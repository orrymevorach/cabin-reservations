/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        port: '',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/airtable/get-cabin',
        destination: '/api/airtable/get-record',
      },
      {
        source: '/api/airtable/get-cabins',
        destination: '/api/airtable/get-records',
      },
      {
        source: '/api/airtable/get-units',
        destination: '/api/airtable/get-records',
      },
      {
        source: '/api/airtable/reserve-spot-in-cabin',
        destination: '/api/airtable/update-record',
      },
      {
        source: '/api/airtable/get-user-by-email',
        destination: '/api/airtable/get-record',
      },
      {
        source: '/api/airtable/get-user-by-record-id',
        destination: '/api/airtable/get-record-by-id',
      },
      {
        source: '/api/airtable/reserve-bed',
        destination: '/api/airtable/update-record',
      },
      {
        source: '/api/airtable/clear-current-bed-selection',
        destination: '/api/airtable/update-record',
      },
      {
        source: '/api/airtable/create-group',
        destination: '/api/airtable/create-record',
      },
      {
        source: '/api/airtable/update-group',
        destination: '/api/airtable/update-record',
      },
      {
        source: '/api/airtable/get-cabin-by-id',
        destination: '/api/airtable/get-record-by-id',
      },
      {
        source: '/api/airtable/get-bed-occupant',
        destination: '/api/airtable/get-record-by-id',
      },
      {
        source: '/api/airtable/get-group',
        destination: '/api/airtable/get-record-by-id',
      },
      {
        source: '/api/airtable/get-cabin-categories',
        destination: '/api/airtable/get-records',
      },
    ];
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "orry-mevorach",
    project: "highlands-cabin-reservations",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
