import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
    nitro(),
    imagetools(),
  ],
  resolve: {
    alias: [
      {
        find: /^use-sync-external-store\/shim$/u,
        replacement: fileURLToPath(
          new URL("src/lib/use-sync-external-store-shim.ts", import.meta.url),
        ),
      },
      {
        find: "tslib",
        replacement: "tslib/tslib.es6.js",
      },
    ],
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: ["use-sync-external-store/shim", "use-sync-external-store/shim/with-selector"],
  },
  server: {
    port: 5173,
  },
});
