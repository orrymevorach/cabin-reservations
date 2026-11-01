const originalFetch = globalThis.fetch;
const { verifyTestIdToken } = require('./dietary-test-identity.cjs');
const stubbedPaths = new Set([
  '/api/cabin-confirmation-email',
  '/api/email-templates/send-cabin-reservation-email',
  '/api/slack/send-slack-notification',
  '/api/platform/guest-intake',
]);

globalThis.fetch = async (input, init) => {
  const requestUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  let pathname;
  try {
    pathname = new URL(requestUrl, 'http://localhost').pathname;
  } catch {
    return originalFetch(input, init);
  }

  if (stubbedPaths.has(pathname)) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (
    new URL(requestUrl, 'http://localhost').hostname ===
    'identitytoolkit.googleapis.com'
  ) {
    const { idToken } = JSON.parse(init.body);
    const identity = verifyTestIdToken(idToken);
    return new Response(
      JSON.stringify(
        identity
          ? { users: [identity] }
          : { error: { message: 'INVALID_ID_TOKEN' } },
      ),
      {
        status: identity ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return originalFetch(input, init);
};
