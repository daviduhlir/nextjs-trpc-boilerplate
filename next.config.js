/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  env: {
    // Environment variables are loaded from .env.local
  },
};

module.exports = nextConfig;
