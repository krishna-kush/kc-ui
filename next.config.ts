import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  // Enable standalone output for production Docker builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Redirect all auth-related routes to /auth
  async redirects() {
    return [
      { source: '/login', destination: '/auth', permanent: true },
      { source: '/signup', destination: '/auth', permanent: true },
      { source: '/signin', destination: '/auth', permanent: true },
      { source: '/auth/login', destination: '/auth', permanent: true },
      { source: '/auth/signin', destination: '/auth', permanent: true },
      { source: '/auth/signup', destination: '/auth', permanent: true },
    ];
  },
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
