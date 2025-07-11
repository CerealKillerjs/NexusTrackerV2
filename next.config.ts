import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/announce',
        destination: '/api/announce',
      },
    ];
  },
};

export default nextConfig;