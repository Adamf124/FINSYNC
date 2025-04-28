import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // keep bcrypt’s native file in the server build
    serverComponentsExternalPackages: ['bcrypt'],
  },};

export default nextConfig;
