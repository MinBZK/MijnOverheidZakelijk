import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  async redirects() {
    return [
      {
        source: "/berichtenbox",
        destination: "/berichtenbox/inbox",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
