import type { NextConfig } from "next";
import path from "path";

const isReviewaExport = process.env.REVIEWA_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isReviewaExport
    ? {
        output: "export" as const,
        trailingSlash: false,
        // A separate build directory so the Reviewa export build never shares
        // .next with a `next dev` server that might be running at the same
        // time (in this checkout or another). Sharing it causes flaky,
        // hard-to-reproduce "Cannot find module for page" export errors.
        distDir: ".next-reviewa",
      }
    : {}),
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
