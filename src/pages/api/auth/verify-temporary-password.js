import Airtable from 'airtable';
import { logSentryApiError } from '@/utils/sentry-utils';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';
import { ticketLookupErrorMessage } from '@/utils/api-error-utils';

// Account creation step 1: check the temporary password from the ticket email on the server. The
// browser never receives the ticket's password; it learns only whether the entered one matches.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  const temporaryPassword = req.body?.temporaryPassword;
  if (!email || typeof temporaryPassword !== 'string' || !temporaryPassword) {
    return res.status(400).json({ message: 'Email and temporary password are required.' });
  }
  try {
    const escapedEmail = email.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const tickets = await new Airtable({
      apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    })
      .base(process.env.AIRTABLE_BASE)('Ticket Purchases')
      .select({ filterByFormula: `LOWER({Email Address}) = "${escapedEmail}"` })
      .all();
    const ticket = tickets.find(
      record =>
        record.fields.Status !== 'Payment Made' &&
        !isInactiveTicketStatus(record.fields.Status),
    );
    if (!ticket) return res.status(404).json({ code: 'USER_NOT_FOUND' });
    if (temporaryPassword !== ticket.fields['Temporary Password']) {
      return res.status(401).json({ code: 'PASSWORD_DOES_NOT_MATCH' });
    }
    return res.status(200).json({
      user: { id: ticket.id, emailAddress: ticket.fields['Email Address'] },
    });
  } catch (error) {
    await logSentryApiError({ error, req, action: 'verify-temporary-password', extra: {} });
    return res.status(500).json({ message: ticketLookupErrorMessage });
  }
}
