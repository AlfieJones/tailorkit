import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { nitro } from "nitro/vite";

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
        base: "/_serverFnDocs",
      },
    }),
    nitro({
      routeRules: {
        "/homepage": {
          redirect: "/home",
        },
      },
    }),
    react(),
    imagetools(),
  ],
  server: {
    port: 5173,
  },
});
