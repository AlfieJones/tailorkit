import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  transpilePackages: ["@examples/shared", "@tailorkit/ui", "tailorkit"],
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".js"],
    };
    config.module.rules.push({
      resourceQuery: /worker&url/u,
      test: /worker\.ts$/u,
      use: [
        {
          loader: fileURLToPath(new URL("loaders/worker-url.cjs", import.meta.url)),
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
