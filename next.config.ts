import type { NextConfig } from "next";
import path from "path";

const isReviewaExport = process.env.REVIEWA_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isReviewaExport
    ? { output: "export" as const, trailingSlash: false }
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
