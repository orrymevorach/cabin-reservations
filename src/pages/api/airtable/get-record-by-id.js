import { getAirtableRecordById } from '@/lib/airtable-server';
import { requireSignedInUser } from '@/lib/user-session-server';

// Browser and app access to one record: the signed-in user's own ticket only. Server code reads
// Airtable directly through lib/airtable-server.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;
  const { tableId, recordId } = req.body || {};
  if (tableId !== 'Ticket Purchases' || recordId !== signedInUser.id) {
    return res.status(403).json({ message: 'You can only view your own ticket.' });
  }
  const record = await getAirtableRecordById({ tableId, recordId: signedInUser.id });
  delete record.temporaryPassword;
  return res.status(200).json({ record });
}
