import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // youtubei.js uses Node built-ins and dynamic requires — keep it external
  serverExternalPackages: ["youtubei.js"],
};

export default nextConfig;
