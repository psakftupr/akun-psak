import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@firebase/firestore": "./node_modules/@firebase/firestore/dist/index.esm.js",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@firebase/firestore": path.resolve(
        __dirname,
        "node_modules/@firebase/firestore/dist/index.esm.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
