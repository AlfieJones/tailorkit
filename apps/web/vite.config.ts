import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  build: {
    rolldownOptions: {
      external: [/^@base-ui\/utils(\/.*)?$/, "reselect"],
      output: {
        codeSplitting: false,
      },
    },
  },
  ssr: {
    external: ["@base-ui/utils/store", "reselect", "@base-ui/utils"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
});
