const { spawn } = require('node:child_process');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const {
  captureTestBaseBaseline,
  compareTestBaseBaselines,
  getTestConfiguration,
  projectRoot,
  restoreCabinReservationFields,
  restoreProductInventoryStatuses,
  resetAutomatedReservationFixtures,
} = require('./automated-reservations-test-utils.cjs');

const testPort = 3171;
const appUrl = `http://127.0.0.1:${testPort}`;
const nextCliPath = path.join(
  projectRoot,
  'node_modules',
  'next',
  'dist',
  'bin',
  'next',
);
const stubFilePath = path.join(__dirname, 'automated-test-stubs.cjs');

function runCommand(command, args, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: environment,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) return resolve();
      reject(
        new Error(
          `${path.basename(command)} exited with ${signal || `code ${code}`}.`,
        ),
      );
    });
  });
}

async function waitForApp(serverProcess) {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        'The automated reservations server exited before starting.',
      );
    }

    try {
      const response = await fetch(`${appUrl}/api/platform/cabins`);
      if (response.ok) return;
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for the automated reservations server.');
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill('SIGTERM');
  await new Promise(resolve => {
    const timeout = setTimeout(() => {
      if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
      resolve();
    }, 10_000);
    serverProcess.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function run() {
  const { baseId, personalAccessToken } = getTestConfiguration();
  const testEnvironment = {
    ...process.env,
    AIRTABLE_BASE: baseId,
    AIRTABLE_BASE_AUTOMATED_TESTING: baseId,
    AIRTABLE_PERSONAL_ACCESS_TOKEN: personalAccessToken,
    NEXT_PUBLIC_ENV_URL: appUrl,
    AUTOMATED_TEST_RESET_APPLIED: 'true',
    AUTOMATED_TEST_IDENTITY_SECRET: randomBytes(32).toString('hex'),
  };

  let serverProcess;
  let baseline;
  let testFailure;
  const lockPath = path.join(projectRoot, '.automated-reservations-test.lock');
  const lockDescriptor = fs.openSync(lockPath, 'wx');

  try {
    const resetCounts = await resetAutomatedReservationFixtures();
    console.log('Automated test-base reset complete:', resetCounts);
    baseline = await captureTestBaseBaseline();

    await runCommand('npm', ['run', 'build'], testEnvironment);

    serverProcess = spawn(
      process.execPath,
      [nextCliPath, 'start', '-p', String(testPort)],
      {
        cwd: projectRoot,
        env: {
          ...testEnvironment,
          NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${stubFilePath}`]
            .filter(Boolean)
            .join(' '),
        },
        stdio: 'inherit',
      },
    );
    await waitForApp(serverProcess);

    const testFiles = fs.readdirSync(__dirname, { recursive: true })
      .filter(filename => filename.endsWith('.test.cjs'))
      .sort()
      .map(filename => path.join(__dirname, filename));
    if (!testFiles.length) {
      throw new Error('No test files were discovered in scripts/tests.');
    }
    await runCommand(
      process.execPath,
      ['--experimental-vm-modules', '--test', '--test-concurrency=1', ...testFiles],
      { ...testEnvironment, AUTOMATED_TEST_BASE_URL: appUrl },
    );
  } catch (error) {
    testFailure = error;
  } finally {
    await stopServer(serverProcess);
    try {
      const resetCounts = await resetAutomatedReservationFixtures();
      console.log('Automated test-base cleanup complete:', resetCounts);
      if (baseline) {
        await restoreCabinReservationFields({ originalBaseline: baseline });
        await restoreProductInventoryStatuses({ originalBaseline: baseline });
        let differences = [];
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const currentBaseline = await captureTestBaseBaseline();
          differences = compareTestBaseBaselines({
            originalBaseline: baseline,
            currentBaseline,
          });
          if (!differences.length) break;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (differences.length) {
          throw new Error(
            `Test-base records differ from the post-reset baseline after cleanup: ${JSON.stringify(differences)}`,
          );
        }

        console.log('Test-base baseline restored.');
      }
    } catch (cleanupError) {
      testFailure = new AggregateError(
        [testFailure, cleanupError].filter(Boolean),
        'Automated reservation tests failed or the test base could not be restored.',
      );
    }
    fs.closeSync(lockDescriptor);
    fs.unlinkSync(lockPath);
  }

  if (testFailure) {
    console.error(testFailure);
    process.exitCode = 1;
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
