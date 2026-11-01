import * as Sentry from '@sentry/nextjs';
import { isUnexpectedApiError } from '@/utils/api-error-utils';

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

// Report an unexpected API route failure with the route and action as searchable Sentry tags.
// Expected reservation outcomes such as a full cabin are skipped so they do not alert.
// Waits for Sentry to send the event because serverless functions can stop as soon as the response is returned.
export const logSentryApiError = async ({ error, req, action, extra = {} }) => {
  if (!isUnexpectedApiError(error)) return;
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
