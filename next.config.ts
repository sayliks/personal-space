import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "tg.matsumae.top",
      },
      {
        protocol: "https",
        hostname: "tg.salix.eu.org",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
