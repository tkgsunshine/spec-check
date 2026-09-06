import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  allowedDevOrigins: [
    'localhost:3000',
    '192.168.10.129',
    '192.168.10.129:3000',
  ],
};

export default nextConfig;
