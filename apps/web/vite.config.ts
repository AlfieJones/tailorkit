import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import babel from "@rolldown/plugin-babel";
import { nitro } from "nitro/vite";
import { microfrontends } from "@vercel/microfrontends/experimental/vite";

const serverPackages = [
  "@tailorkit/api",
  "@tailorkit/api-platform",
  "@tailorkit/api-utils",
  "@tailorkit/auth",
  "@tailorkit/db",
  "@tailorkit/observability",
];

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      microfrontends(),
      devtools(),
      tailwindcss(),
      tanstackStart({
        server: {
          entry: "server.ts",
        },
      }),
      nitro(),
      viteReact(),
      babel({
        presets: [reactCompilerPreset()],
      }),
    ],
    server: {
      port: 3000,
    },
    ssr: isDev ? undefined : { external: serverPackages },
  };
});
