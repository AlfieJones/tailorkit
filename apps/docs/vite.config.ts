import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { createRequire } from "node:module";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

const require = createRequire(import.meta.url);

export default defineConfig({
  build: {
    assetsDir: "docs-assets",
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
      serverFns: {
        base: "/docs/_serverFn",
      },
    }),
    react(),
    imagetools(),
  ],
  resolve: {
    alias: {
      tslib: require.resolve("tslib/tslib.es6.mjs"),
    },
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
  },
});
