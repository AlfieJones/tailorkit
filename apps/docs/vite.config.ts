import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  build: {
    assetsDir: "docs-assets",
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tanstackStart({
      router: {
        indexToken: "home",
      },
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
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
  },
});
