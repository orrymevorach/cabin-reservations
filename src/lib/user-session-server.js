// Server-only user sign-in. After Firebase login, the server checks the Firebase ID token and sets a
// signed, httpOnly session cookie naming the user's ticket. Pages and API routes read the signed-in
// user from that cookie (or, for the mobile app, from a Firebase ID token in an Authorization:
// Bearer header). Record IDs sent by the browser are never trusted to say who the user is.
import crypto from 'crypto';
import { getAirtableRecordById } from '@/lib/airtable-server';
import { getAuthenticatedGuestTicket } from '@/lib/guest-ticket-server';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';

export const USER_SESSION_COOKIE = 'highlands_user_session';
const SESSION_DAYS = 7;

function getSessionSecret() {
  const secret = process.env.USER_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('USER_SESSION_SECRET must be set to at least 32 characters.');
  }
  return secret;
}

const sign = payload =>
  crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');

function serializeCookie(value, maxAgeSeconds) {
  const secureAttribute = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${USER_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureAttribute}`;
}

// Sign the user in by setting the session cookie for their ticket and Firebase account.
export function setUserSession(res, { recordId, firebaseUid }) {
  const payload = Buffer.from(
    JSON.stringify({
      recordId,
      firebaseUid,
      expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }),
  ).toString('base64url');
  res.setHeader(
    'Set-Cookie',
    serializeCookie(`${payload}.${sign(payload)}`, SESSION_DAYS * 24 * 60 * 60),
  );
}

export function clearUserSession(res) {
  res.setHeader('Set-Cookie', serializeCookie('', 0));
}

function readCookie(req, name) {
  const header = req.headers?.cookie || '';
  const match = header
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

// The session's ticket and Firebase account, or null when the cookie is missing, edited, or expired.
export function readUserSession(req) {
  const value = readCookie(req, USER_SESSION_COOKIE);
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expectedSignature = sign(payload);
  const isSignatureValid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isSignatureValid) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!session.recordId || !session.firebaseUid || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// The signed-in user's active ticket (same record shape as lib/airtable), or { status, message } when
// no user is signed in. A ticket unlinked from the session's Firebase account no longer signs in.
export async function getSignedInUser(req) {
  const authorization = req.headers?.authorization || '';
  if (authorization.startsWith('Bearer ')) {
    const result = await getAuthenticatedGuestTicket(authorization.slice('Bearer '.length));
    if (result.status) return result;
    return { user: await getAirtableRecordById({ tableId: 'Ticket Purchases', recordId: result.ticket.id }) };
  }

  const session = readUserSession(req);
  if (!session) return { status: 401, message: 'Please sign in again.' };
  const user = await getAirtableRecordById({
    tableId: 'Ticket Purchases',
    recordId: session.recordId,
  }).catch(() => null);
  // transformFields turns the "Firebase UID" field into firebaseUID.
  if (!user?.id || user.firebaseUID !== session.firebaseUid) {
    return { status: 401, message: 'Please sign in again.' };
  }
  // The user really is signed in, but their ticket was archived, refunded, or is still awaiting
  // payment, so say so instead of asking them to sign in again.
  if (user.status === 'Payment Made' || isInactiveTicketStatus(user.status)) {
    return {
      status: 410,
      message:
        'This ticket is no longer valid. Please contact Highlands for more information.',
    };
  }
  return { user };
}

// Returns the signed-in user, or sends the 401 response and returns null.
export async function requireSignedInUser(req, res) {
  const result = await getSignedInUser(req);
  if (result.status) {
    res.status(result.status).json({ message: result.message });
    return null;
  }
  return result.user;
}
