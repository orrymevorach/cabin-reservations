const { createHmac, timingSafeEqual } = require('node:crypto');

function getSecret() {
  if (
    process.env.AIRTABLE_BASE !== 'appFe9v1pu6BLVxeD' ||
    !process.env.AUTOMATED_TEST_IDENTITY_SECRET
  ) {
    throw new Error(
      'Dietary identity stubs require the approved test base and runner secret.',
    );
  }
  return process.env.AUTOMATED_TEST_IDENTITY_SECRET;
}

function createTestIdToken({ email, uid }) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      email,
      user_id: uid,
      sub: uid,
      iat: now,
      exp: now + 3600,
      auth_time: now,
    }),
  ).toString('base64url');
  const signature = createHmac('sha256', getSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyTestIdToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const expected = createHmac('sha256', getSecret())
    .update(`${parts[0]}.${parts[1]}`)
    .digest('base64url');
  const actualBuffer = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  )
    return null;
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (
    payload.exp <= Date.now() / 1000 ||
    !payload.email?.startsWith('reservations-automation+') ||
    !payload.email.endsWith('@example.invalid') ||
    !payload.sub?.startsWith('dietary-test-')
  )
    return null;
  return { localId: payload.sub, email: payload.email };
}

module.exports = { createTestIdToken, verifyTestIdToken };
