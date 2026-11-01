import Airtable from 'airtable';
import { getFirebaseIdentity } from '@/lib/firebase-identity';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';

export async function getAuthenticatedGuestTicket(idToken) {
  const identityResult = await getFirebaseIdentity(idToken);
  if (identityResult.status) return identityResult;
  if (
    !process.env.AIRTABLE_BASE ||
    !process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
  ) {
    throw new Error('Airtable guest information configuration is missing.');
  }
  const { identity } = identityResult;
  const escapedUid = identity.localId
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  const table = new Airtable({
    apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
  }).base(process.env.AIRTABLE_BASE)('Ticket Purchases');
  const tickets = await table
    .select({
      filterByFormula: `{Firebase UID} = "${escapedUid}"`,
    })
    .all();
  const matchingTickets = tickets.filter(
    ticket =>
      ticket.fields.Status !== 'Payment Made' &&
      !isInactiveTicketStatus(ticket.fields.Status) &&
      String(ticket.fields['Email Address'] || '')
        .trim()
        .toLowerCase() === identity.email.trim().toLowerCase(),
  );
  if (matchingTickets.length !== 1) {
    return {
      status: 409,
      message:
        'We could not identify one active ticket for your account. Please contact info@highlandsmusicfestival.ca.',
    };
  }
  return { table, ticket: matchingTickets[0] };
}
