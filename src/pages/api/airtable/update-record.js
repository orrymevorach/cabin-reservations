import { BEDS } from '@/utils/constants';
import { logSentryApiError } from '@/utils/sentry-utils';
import { getAirtableRecordById, updateAirtableRecord } from '@/lib/airtable-server';
import { requireSignedInUser } from '@/lib/user-session-server';

const BED_FIELDS = Object.values(BEDS);
const WAIVER_FIELDS = ['Waiver Accepted', 'Waiver Accepted Date'];

// Whether the signed-in user may make this update from the browser. Only two updates are allowed:
// clearing their own bed choice, and accepting the waiver on their own check-in record.
async function isAllowedUserUpdate({ signedInUser, tableId, recordId, newFields }) {
  const fieldNames = Object.keys(newFields || {});
  if (!fieldNames.length) return false;
  if (tableId === 'Ticket Purchases') {
    return (
      recordId === signedInUser.id &&
      fieldNames.every(
        name =>
          BED_FIELDS.includes(name) &&
          Array.isArray(newFields[name]) &&
          newFields[name].length === 0,
      )
    );
  }
  if (tableId === 'Check In') {
    if (!fieldNames.every(name => WAIVER_FIELDS.includes(name))) return false;
    const checkIn = await getAirtableRecordById({ tableId, recordId }).catch(() => null);
    return Boolean(checkIn?.attendee?.includes(signedInUser.id));
  }
  return false;
}

// Browser updates are limited to the signed-in user's own bed choice and check-in waiver. Server
// code writes Airtable directly through lib/airtable-server. The /clear-current-bed-selection
// rewrite in next.config.js also reaches this route.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;
  const { tableId, recordId, newFields } = req.body || {};
  if (!(await isAllowedUserUpdate({ signedInUser, tableId, recordId, newFields }))) {
    return res.status(403).json({ message: 'This change is not allowed.' });
  }
  try {
    const record = await updateAirtableRecord({ tableId, recordId, newFields });
    delete record.temporaryPassword;
    return res.status(200).json({ record });
  } catch (err) {
    await logSentryApiError({ error: err, req, action: 'airtable-update-record', extra: { tableId, recordId } });
    return res.status(500).json({ message: 'Unable to update Airtable record.' });
  }
}
