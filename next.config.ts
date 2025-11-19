import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  // Enable standalone output for production Docker builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Enable hot reload in Docker
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  devIndicators: false,
  typescript: {
    // Ignore TypeScript errors during production build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
