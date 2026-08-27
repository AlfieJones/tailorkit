import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: {
        host: resolve(import.meta.dirname, "src/host/index.ts"),
        protocol: resolve(import.meta.dirname, "src/protocol.ts"),
        worker: resolve(import.meta.dirname, "src/worker/worker.ts"),
        "worker-dom/dom": resolve(import.meta.dirname, "src/worker-dom/dom.ts"),
        "worker-dom/index": resolve(import.meta.dirname, "src/worker-dom/index.ts"),
      },
      name: "@tailorkit/sandbox",
    },
    rolldownOptions: {
      external: [],
    },
  },
});
