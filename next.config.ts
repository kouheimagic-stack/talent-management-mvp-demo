import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/me", permanent: false },
      { source: "/actions", destination: "/me", permanent: false },
      { source: "/meetings/:path*", destination: "/me", permanent: false },
      { source: "/admin/users", destination: "/me", permanent: false },
      { source: "/invite", destination: "/me", permanent: false },
    ];
  },
};

export default nextConfig;
