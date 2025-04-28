import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // NEW location
  serverExternalPackages: ['bcrypt'],};

export default nextConfig;
