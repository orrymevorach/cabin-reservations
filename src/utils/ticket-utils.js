// Guests a cabin or yurt purchaser can add without buying more tickets. Bundle tickets are counted from Airtable instead.
const FREE_TICKET_ALLOWANCES = {
  'Cabin Purchased': 14,
  Yurt: 1,
};

export function hasIncludedGuestTicketRemaining({
  status,
  groupMemberCount,
}) {
  const freeTicketAllowance = FREE_TICKET_ALLOWANCES[status];
  if (freeTicketAllowance === undefined) return false;

  const numberOfAddedGuests = Math.max((groupMemberCount || 1) - 1, 0);
  return numberOfAddedGuests < freeTicketAllowance;
}

export function isInactiveTicketStatus(status) {
  return status === 'Archived' || status === 'Refunded';
}

export function throwIfReservationTicketIsInvalid(ticket) {
  if (!ticket?.id || isInactiveTicketStatus(ticket.status)) {
    throw Object.assign(
      new Error('This ticket is no longer valid. Please contact Highlands for more information.'),
      { statusCode: 410 },
    );
  }
}
