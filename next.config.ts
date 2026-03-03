import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "cdn.discordapp.com"], // add Discord
  },
};

export default nextConfig;
