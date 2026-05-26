import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import babel from "@rolldown/plugin-babel";
import { nitro } from "nitro/vite";

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
    define: {
      "import.meta.env.VITE_ORG_CREATION_MANAGED": JSON.stringify(
        process.env.VERCEL_ENV === "production",
      ),
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      nitro({
        routeRules: {
          "/signup": {
            redirect: {
              to: "/sign-up",
              status: 308,
            },
          },
          "/signin": {
            redirect: {
              to: "/login",
              status: 308,
            },
          },
          "/sign-in": {
            redirect: {
              to: "/login",
              status: 308,
            },
          },
        },
      }),
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
