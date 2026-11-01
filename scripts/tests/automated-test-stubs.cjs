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

  // Server code must query Airtable directly. A request from the server back to this site's
  // /api/airtable routes caused the "fetch failed" errors in production, so fail it here and the
  // reservation flow under test returns an error instead of passing.
  if (pathname.startsWith('/api/airtable/')) {
    return new Response(
      JSON.stringify({
        message: `Server code called ${pathname} instead of querying Airtable directly.`,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
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
