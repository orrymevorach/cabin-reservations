import * as Sentry from '@sentry/nextjs';

// Airtable rejects requests with plain objects ({ error, message, statusCode }) instead of Error instances.
// Convert them so Sentry groups issues by message and keeps a stack trace instead of reporting "Non-Error exception".
const getErrorForSentry = error => {
  if (error instanceof Error) return error;
  const errorMessage = error?.message || String(error);
  const airtableErrorType = typeof error?.error === 'string' ? error.error : '';
  const normalizedError = new Error(
    airtableErrorType
      ? `Airtable ${airtableErrorType}: ${errorMessage}`
      : errorMessage,
  );
  normalizedError.statusCode = error?.statusCode;
  return normalizedError;
};

export const logSentryError = (error, extra = {}) => {
  Sentry.captureException(getErrorForSentry(error), { extra });
};

// Expected reservation outcomes (invalid ticket, cabin full, bad input) are thrown with a 4xx statusCode and should not alert.
// Airtable errors also carry a 4xx statusCode, but they mean our request to Airtable failed, so they are always reported.
const shouldReportApiError = error => {
  const isAirtableError = typeof error?.error === 'string';
  const statusCode = Number(error?.statusCode);
  const isExpectedClientError = statusCode >= 400 && statusCode < 500;
  return isAirtableError || !isExpectedClientError;
};

// Report an unexpected API route failure with the route and action as searchable Sentry tags.
// Waits for Sentry to send the event because serverless functions can stop as soon as the response is returned.
export const logSentryApiError = async ({ error, req, action, extra = {} }) => {
  if (!shouldReportApiError(error)) return;
  Sentry.captureException(getErrorForSentry(error), {
    tags: {
      action,
      apiRoute: req?.url?.split('?')[0],
      httpMethod: req?.method,
    },
    extra: {
      ...extra,
      statusCode: error?.statusCode,
      airtableErrorType: typeof error?.error === 'string' ? error.error : undefined,
    },
  });
  await Sentry.flush(2000);
};
