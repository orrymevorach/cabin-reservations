import crypto from 'crypto';

// Server-to-server requests between Highlands sites carry the shared email secret in the
// x-app-api-key header. Routes that only this site's server calls use it to refuse public requests.
export const getInternalApiSecret = () =>
  process.env.EMAIL_APP_SECRET || process.env.EMAIL_API_SECRET || '';

export function isInternalRequest(req) {
  const secret = getInternalApiSecret();
  const provided = String(req.headers?.['x-app-api-key'] || '');
  return (
    Boolean(secret) &&
    provided.length === secret.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret))
  );
}
