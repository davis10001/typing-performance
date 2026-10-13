import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  redirects: async () => [
    { source: "/typing-test", destination: "/", permanent: true },
    { source: "/average-wpm", destination: "/average-typing-speed", permanent: true },
  ],
};

export default nextConfig;
