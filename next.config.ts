import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default {
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
