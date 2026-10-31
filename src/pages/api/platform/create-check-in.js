import Airtable from 'airtable';
import createRecord from '@/pages/api/airtable/create-record';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';
import { logSentryError } from '@/utils/sentry-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { tableId, newFields } = req.body;
  const attendeeIds = newFields?.Attendee;
  if (
    tableId !== 'Check In' ||
    !Array.isArray(attendeeIds) ||
    attendeeIds.length === 0 ||
    attendeeIds.some(id => typeof id !== 'string' || !id)
  ) {
    return res
      .status(422)
      .json({ message: 'An active attendee ticket is required.' });
  }

  try {
    const ticketTable = new Airtable({
      apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    }).base(process.env.AIRTABLE_BASE)('Ticket Purchases');
    const attendees = await Promise.all(
      attendeeIds.map(id => ticketTable.find(id)),
    );
    if (
      attendees.some(attendee => isInactiveTicketStatus(attendee.fields.Status))
    ) {
      return res.status(410).json({
        message:
          'This ticket is no longer valid. Please contact Highlands for more information.',
      });
    }
    return createRecord(req, res);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500)
      logSentryError(error, {
        action: 'create-reservation-check-in',
        attendeeIds,
      });
    return res
      .status(status)
      .json({ message: error.message || 'Unable to create your check-in.' });
  }
}
