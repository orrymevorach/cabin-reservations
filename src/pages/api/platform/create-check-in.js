import { createAirtableRecord } from '@/lib/airtable-server';
import { requireSignedInUser } from '@/lib/user-session-server';
import { logSentryError } from '@/utils/sentry-utils';

// Fields the check-in form submits. Anything else in the request is ignored.
const CHECK_IN_FIELDS = [
  'City',
  'Birthday',
  'Arrival Day',
  'Arrival Time',
  'How Did You Hear About Highlands',
  'Does your EV need to be charged?',
  'Departing before 9AM on Sunday?',
];

// Create the signed-in user's own check-in record. The browser reaches this route through the
// /api/airtable/create-check-in rewrite in next.config.js.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;

  const { tableId, newFields } = req.body || {};
  const attendeeIds = newFields?.Attendee;
  if (
    tableId !== 'Check In' ||
    !Array.isArray(attendeeIds) ||
    attendeeIds.length !== 1 ||
    attendeeIds[0] !== signedInUser.id
  ) {
    return res
      .status(403)
      .json({ message: 'You can only check in with your own ticket.' });
  }

  try {
    const checkInFields = Object.fromEntries(
      CHECK_IN_FIELDS.filter(name => Object.hasOwn(newFields, name)).map(name => [
        name,
        newFields[name],
      ]),
    );
    const record = await createAirtableRecord({
      tableId: 'Check In',
      newFields: { ...checkInFields, Attendee: [signedInUser.id] },
    });
    return res.status(200).json({ record });
  } catch (error) {
    logSentryError(error, { action: 'create-reservation-check-in', attendeeId: signedInUser.id });
    return res.status(500).json({ message: 'Unable to create your check-in.' });
  }
}
