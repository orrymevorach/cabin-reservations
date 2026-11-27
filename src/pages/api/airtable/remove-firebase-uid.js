import { logSentryApiError } from '@/utils/sentry-utils';
import { updateAirtableRecord } from '@/lib/airtable-server';
import {
  clearUserSession,
  requireSignedInUser,
} from '@/lib/user-session-server';

// Unlink the signed-in user's own ticket from their login (used when they delete their account in
// the mobile app) and sign them out. A user can never unlink someone else's ticket.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;
  const { recordId } = req.body || {};
  if (recordId && recordId !== signedInUser.id) {
    return res.status(403).json({ message: 'You can only unlink your own account.' });
  }
  try {
    const record = await updateAirtableRecord({
      tableId: 'Ticket Purchases',
      recordId: signedInUser.id,
      newFields: { 'Firebase UID': '' },
    });
    clearUserSession(res);
    return res.status(200).json({ record: { id: record.id } });
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'airtable-remove-firebase-uid',
      extra: { recordId: signedInUser.id },
    });
    return res.status(500).json({ message: 'Unable to unlink your account.' });
  }
}
