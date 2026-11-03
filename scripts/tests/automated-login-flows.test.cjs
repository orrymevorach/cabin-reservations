const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium } = require('@playwright/test');
const {
  airtableRequest,
  listAirtableRecords,
  testEmailPrefix,
} = require('./automated-reservations-test-utils.cjs');
const { createTestIdToken } = require('./dietary-test-identity.cjs');

const appUrl = process.env.AUTOMATED_TEST_BASE_URL;
const temporaryPassword = 'Automated-Login-Test-Only';
const runId = Date.now().toString(36);
let fixtureIndex = 0;

assert.ok(appUrl, 'Run through the automated reservations runner.');

function nextIdentity(label) {
  fixtureIndex += 1;
  const suffix = `${runId}-${fixtureIndex}-${label}`;
  const email = `${testEmailPrefix}${suffix}@example.invalid`;
  const uid = `dietary-test-login-${suffix}`;
  return { email, uid, idToken: createTestIdToken({ email, uid }) };
}

async function createTicket({ identity, cabinId, firebaseUid }) {
  const fields = {
    Name: `Login Automation ${identity.email}`,
    'Email Address': identity.email,
    'Temporary Password': temporaryPassword,
    Status: 'Ticket Purchased',
    ...(firebaseUid && { 'Firebase UID': firebaseUid }),
    ...(cabinId && { Cabin: [cabinId] }),
  };
  const record = await airtableRequest({
    method: 'POST',
    table: 'Ticket Purchases',
    body: { fields, typecast: true },
  });
  return record;
}

async function installFirebaseStub(
  page,
  identity,
  { shouldRejectLogin = false } = {},
) {
  await page.route(
    'https://identitytoolkit.googleapis.com/**',
    async route => {
      const requestUrl = new URL(route.request().url());
      const action = requestUrl.pathname.split('/').pop();

      if (action === 'accounts:lookup') {
        await route.fulfill({
          json: {
            users: [
              {
                localId: identity.uid,
                email: identity.email,
                emailVerified: true,
                providerUserInfo: [
                  { providerId: 'password', email: identity.email },
                ],
              },
            ],
          },
        });
        return;
      }

      if (action === 'accounts:signInWithPassword' && shouldRejectLogin) {
        await route.fulfill({
          status: 400,
          json: { error: { message: 'INVALID_PASSWORD' } },
        });
        return;
      }

      if (
        action === 'accounts:signInWithPassword' ||
        action === 'accounts:signUp'
      ) {
        await route.fulfill({
          json: {
            localId: identity.uid,
            email: identity.email,
            idToken: identity.idToken,
            refreshToken: 'unused-test-refresh-token',
            expiresIn: '3600',
            registered: true,
          },
        });
        return;
      }

      if (action === 'accounts:sendOobCode') {
        await route.fulfill({
          json: { email: identity.email, requestType: 'PASSWORD_RESET' },
        });
        return;
      }

      assert.fail(`Unexpected Firebase request: ${action}`);
    },
  );
}

async function openPage(
  browser,
  identity,
  pathname = '/',
  options = {},
) {
  const page = await browser.newPage();
  await installFirebaseStub(page, identity, options);
  await page.goto(`${appUrl}${pathname}`);
  return page;
}

test('email login routes attendees to their cabin, summary, or requested page', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const cabins = await listAirtableRecords('Cabins');
    assert.ok(cabins.length, 'A test cabin is required.');

    const noCabinIdentity = nextIdentity('no-cabin');
    const noCabinTicket = await createTicket({ identity: noCabinIdentity });
    const noCabinPage = await openPage(browser, noCabinIdentity);
    await noCabinPage
      .getByLabel('Email', { exact: true })
      .fill(noCabinIdentity.email);
    await noCabinPage
      .getByLabel('Password', { exact: true })
      .fill('test-password');
    await noCabinPage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await noCabinPage.waitForURL('**/cabin-selection');

    const cabinIdentity = nextIdentity('has-cabin');
    const cabinTicket = await createTicket({
      identity: cabinIdentity,
      cabinId: cabins[0].id,
      firebaseUid: cabinIdentity.uid,
    });
    const cabinPage = await openPage(browser, cabinIdentity);
    await cabinPage
      .getByLabel('Email', { exact: true })
      .fill(cabinIdentity.email);
    await cabinPage
      .getByLabel('Password', { exact: true })
      .fill('test-password');
    await cabinPage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await cabinPage.waitForURL('**/summary');

    const returnIdentity = nextIdentity('return-to');
    await createTicket({ identity: returnIdentity });
    const returnPage = await openPage(
      browser,
      returnIdentity,
      '/?returnTo=%2Fdietary-intake',
    );
    await returnPage
      .getByLabel('Email', { exact: true })
      .fill(returnIdentity.email);
    await returnPage
      .getByLabel('Password', { exact: true })
      .fill('test-password');
    await returnPage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await returnPage.waitForURL('**/dietary-intake');

    const updatedTicket = await airtableRequest({
      table: 'Ticket Purchases',
      recordId: cabinTicket.id,
    });
    assert.equal(updatedTicket.fields['Firebase UID'], cabinIdentity.uid);
    const newlyLinkedTicket = await airtableRequest({
      table: 'Ticket Purchases',
      recordId: noCabinTicket.id,
    });
    assert.equal(newlyLinkedTicket.fields['Firebase UID'], noCabinIdentity.uid);
  } finally {
    await browser.close();
  }
});

test('email login reports rejected credentials and missing ticket records', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ticketIdentity = nextIdentity('wrong-password');
    await createTicket({ identity: ticketIdentity });
    const rejectedPage = await openPage(browser, ticketIdentity, '/', {
      shouldRejectLogin: true,
    });
    await rejectedPage
      .getByLabel('Email', { exact: true })
      .fill(ticketIdentity.email);
    await rejectedPage
      .getByLabel('Password', { exact: true })
      .fill('wrong-password');
    await rejectedPage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await rejectedPage.getByText(
      /We could not sign you in with that email and password/,
    ).waitFor();

    const unknownIdentity = nextIdentity('unknown-ticket');
    const unknownPage = await openPage(browser, unknownIdentity, '/', {
      shouldRejectLogin: true,
    });
    await unknownPage
      .getByLabel('Email', { exact: true })
      .fill(unknownIdentity.email);
    await unknownPage
      .getByLabel('Password', { exact: true })
      .fill('wrong-password');
    await unknownPage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await unknownPage.getByText(
      /We do not have a record of this email/,
    ).waitFor();

    const firebaseIdentity = nextIdentity('no-active-ticket');
    const firebasePage = await openPage(browser, firebaseIdentity);
    await firebasePage
      .getByLabel('Email', { exact: true })
      .fill(firebaseIdentity.email);
    await firebasePage
      .getByLabel('Password', { exact: true })
      .fill('test-password');
    await firebasePage
      .getByRole('button', { name: 'Log in', exact: true })
      .click();
    await firebasePage
      .getByText(/We do not have an active ticket for this email/)
      .waitFor();
  } finally {
    await browser.close();
  }
});

test('forgot-password sends a reset request and confirms the result', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const identity = nextIdentity('password-reset');
    const page = await openPage(browser, identity);
    let requestedResetEmail;
    page.on('request', request => {
      if (request.url().includes('accounts:sendOobCode')) {
        requestedResetEmail = request.postDataJSON().email;
      }
    });
    await page.getByRole('button', { name: 'Click here', exact: true }).click();
    await page.getByRole('heading', {
      name: 'Please enter your email to send a password reset link',
    }).waitFor();
    await page.locator('input').last().fill(identity.email);
    await page
      .getByRole('button', { name: 'Send Password Reset Link', exact: true })
      .click();
    await page.getByRole('heading', {
      name: /If an account is associated with that email/,
    }).waitFor();
    assert.equal(requestedResetEmail, identity.email);
  } finally {
    await browser.close();
  }
});

test('account creation verifies the temporary password, resends it, and updates the password', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const identity = nextIdentity('create-account');
    const ticket = await createTicket({ identity });
    const page = await openPage(
      browser,
      identity,
      '/create-account?returnTo=%2Fdietary-intake',
    );
    await page
      .getByLabel('Email Address', { exact: true })
      .fill(identity.email);
    await page
      .getByLabel(/^Temporary Password/)
      .fill('incorrect-temporary-password');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page
      .getByText(/This password does not match the one that was sent/)
      .waitFor();

    let temporaryPasswordEmailAttempts = 0;
    await page.route(
      'https://highlandsmusicfestival.ca/api/email-templates/send-cabin-reservation-email**',
      async route => {
        temporaryPasswordEmailAttempts += 1;
        await route.fulfill({
          json:
            temporaryPasswordEmailAttempts === 1
              ? { success: false, error: 'Test email service unavailable.' }
              : { success: true },
        });
      },
    );
    await page
      .getByRole('button', { name: 'Resend Temporary Password', exact: true })
      .click();
    await page.getByText(/We could not send your temporary password/).waitFor();
    await page
      .getByRole('button', { name: 'Resend Temporary Password', exact: true })
      .click();
    await page.getByText('Sent!', { exact: true }).waitFor();
    assert.equal(temporaryPasswordEmailAttempts, 2);

    await page
      .getByLabel(/^Temporary Password/)
      .fill(temporaryPassword);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.getByText('Please update your password', { exact: true }).waitFor();
    await page
      .getByLabel('New Password', { exact: true })
      .fill('new-password-123');
    await page
      .getByLabel('Confirm Password', { exact: true })
      .fill('different-password');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page
      .getByText(/This password does not match the one that was sent/)
      .waitFor();

    await page
      .getByLabel('Confirm Password', { exact: true })
      .fill('new-password-123');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.waitForURL('**/dietary-intake');

    const updatedTicket = await airtableRequest({
      table: 'Ticket Purchases',
      recordId: ticket.id,
    });
    assert.equal(updatedTicket.fields['Firebase UID'], identity.uid);
  } finally {
    await browser.close();
  }
});
