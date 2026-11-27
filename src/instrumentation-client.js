import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  // Automated test builds set NEXT_PUBLIC_DISABLE_SENTRY so deliberate test failures are not reported.
  enabled: process.env.NEXT_PUBLIC_DISABLE_SENTRY !== 'true',
  dsn: 'https://303d0a97efa3fab2ec43c5bf8147617f@o4506745899778048.ingest.us.sentry.io/4507880313585664',
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
});