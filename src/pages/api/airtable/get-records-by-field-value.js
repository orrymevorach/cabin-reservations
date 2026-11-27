import { getAirtableRecordsByFieldValue } from '@/lib/airtable-server';
import { requireSignedInUser } from '@/lib/user-session-server';

// Browser access: a signed-in user looks up another ticket holder by email (for example to add them
// to a group). Only the ticket ID, name, and status are returned. Server code reads Airtable directly.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;
  const { tableId, formulaArray } = req.body || {};
  const isEmailLookup =
    tableId === 'Ticket Purchases' &&
    Array.isArray(formulaArray) &&
    formulaArray.length === 1 &&
    formulaArray[0]?.fieldName === 'Email Address' &&
    typeof formulaArray[0]?.fieldValue === 'string';
  if (!isEmailLookup) {
    return res.status(403).json({ message: 'This lookup is not allowed.' });
  }
  const records = await getAirtableRecordsByFieldValue({ tableId, formulaArray });
  return res.status(200).json({
    records: records.map(record => ({
      id: record.id,
      name: record.name,
      status: record.status,
    })),
  });
}
