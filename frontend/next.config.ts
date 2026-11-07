import type { NextConfig } from 'next';

const backendUrl = process.env.INTERNAL_API_URL;
const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
