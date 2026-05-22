import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { nitro } from "nitro/vite";
import { microfrontends } from "@vercel/microfrontends/experimental/vite";

export default defineConfig({
  // build: {
  //   assetsDir: "docs-assets",
  // },
  environments: {
    nitro: {
      build: {
        rolldownOptions: {
          external: ["tslib"],
        },
      },
    },
    ssr: {
      build: {
        rolldownOptions: {
          external: ["tslib"],
        },
      },
    },
  },
  plugins: [
    microfrontends(),
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
    nitro({
      routeRules: {
        "/homepage": {
          redirect: "/home",
        },
        "/": {
          redirect: "/home",
        },
      },
    }),
    react(),
    imagetools(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    external: ["tslib"],
  },
  server: {
    port: 5173,
  },
});
