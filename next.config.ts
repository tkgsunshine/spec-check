import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '192.168.10.129',
    '192.168.10.129:3000',
  ],
};

export default nextConfig;
