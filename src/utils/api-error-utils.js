export const unexpectedErrorMessage =
  'Something went wrong. Please try again, or contact info@highlandsmusicfestival.ca if the problem continues.';

export const ticketLookupErrorMessage =
  'We could not look up this ticket right now. Please try again, or contact info@highlandsmusicfestival.ca if the problem continues.';

// Expected reservation outcomes (invalid ticket, cabin full, bad input) are thrown with a 4xx statusCode and have messages written for guests.
// Airtable errors also carry a 4xx statusCode, but they mean our request to Airtable failed, so they are unexpected.
export const isUnexpectedApiError = error => {
  const isAirtableError = typeof error?.error === 'string';
  const statusCode = Number(error?.statusCode);
  const isExpectedClientError = statusCode >= 400 && statusCode < 500;
  return isAirtableError || !isExpectedClientError;
};

// Guests see the message for expected reservation outcomes. Unexpected failures show a generic message instead,
// so technical details such as "Cannot read properties of undefined" only appear in Sentry.
export const getGuestErrorMessage = error =>
  isUnexpectedApiError(error) ? unexpectedErrorMessage : error.message;
