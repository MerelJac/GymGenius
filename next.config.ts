import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: { fullUrl: true },
  },
  // surfaces server errors in prod logs
  serverRuntimeConfig: {
    // your config
  },
};

export default nextConfig;
