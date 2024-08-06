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
