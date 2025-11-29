import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,

  experimental: {
    webpackBuildWorker: true,

    // Enable concurrent features for better performance
    cpus: Math.max(1, Math.floor(require("node:os").cpus().length * 0.8)),

    // allocate workers based on the memory
    memoryBasedWorkersCount: true,

    // Optimize build performance
    optimizeServerReact: true,

    // Enable Turbopack optimizations for faster compilation
    turbopackMemoryLimit: 1024 * 1024 * 1024 * 2, // 2GB

    turbopackSourceMaps: true, // Disable for faster dev builds

    // Forward browser logs to the terminal for easier debugging
    browserDebugInfoInTerminal: true,

    // Enable persistent caching for the turbopack dev server and build
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
