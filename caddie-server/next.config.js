/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    HUBSPOT_CLIENT_ID: process.env.HUBSPOT_CLIENT_ID,
  },
};

module.exports = nextConfig;

