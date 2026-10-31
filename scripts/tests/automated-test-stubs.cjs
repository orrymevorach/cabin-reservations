const originalFetch = globalThis.fetch;
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

  return originalFetch(input, init);
};
