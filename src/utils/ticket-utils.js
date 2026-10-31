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
