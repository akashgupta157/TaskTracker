import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Add Supabase storage if you're using it
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // For Vercel deployments
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;