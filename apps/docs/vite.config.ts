import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { nitro } from "nitro/vite";
import { microfrontends } from "@vercel/microfrontends/experimental/vite";
import { createHash } from "node:crypto";

function createPrefixedServerFnIdGenerator(prefix: string) {
  return (opts: { filename: string; functionName: string }) => {
    const filename = opts.filename.replaceAll("\\", "/");

    const safePrefix = prefix.replaceAll(/[^a-zA-Z0-9_-]/gu, "_");
    const safeName = opts.functionName.replaceAll(/[^a-zA-Z0-9_-]/gu, "_").slice(0, 16);

    const hash = createHash("sha256")
      .update(`${filename}:${opts.functionName}`)
      .digest("base64url")
      .slice(0, 16);

    return `${safePrefix}_${safeName}_${hash}`;
  };
}

export default defineConfig({
  plugins: [
    microfrontends(),
    mdx(await import("./source.config")),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
      serverFns: {
        generateFunctionId: createPrefixedServerFnIdGenerator("docs"),
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
  server: {
    port: 5173,
  },
});
