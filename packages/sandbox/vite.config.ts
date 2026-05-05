import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: {
        host: resolve(import.meta.dirname, "src/host/index.ts"),
        worker: resolve(import.meta.dirname, "src/worker/worker.ts"),
      },
      name: "@tailorkit/sandbox",
    },
    rolldownOptions: {
      external: [],
    },
  },
});
