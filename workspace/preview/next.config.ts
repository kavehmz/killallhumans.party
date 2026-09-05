import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The app has one route; prefix its assets without changing export routing.
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
