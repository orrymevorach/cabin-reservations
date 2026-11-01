import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Reports errors thrown out of API routes and getServerSideProps that are not caught by the route itself.
export const onRequestError = Sentry.captureRequestError;
