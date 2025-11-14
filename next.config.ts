import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled to prevent WaveSurfer AbortError spam in development
};

export default nextConfig;
