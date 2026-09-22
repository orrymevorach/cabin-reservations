import * as Sentry from '@sentry/nextjs';

export const logSentryError = (error, extra = {}) => {
  Sentry.captureException(error, { extra });
};