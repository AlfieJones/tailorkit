import { defineConfig } from "vite";

const liquidRawPlugin = () => ({
  name: "liquid-raw",
  transform(code: string, id: string) {
    if (id.endsWith(".liquid")) {
      return `export default ${JSON.stringify(code)};`;
    }
  },
});

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: true,
    outDir: "dist",
    rollupOptions: {
      external: [
        /^node:/,
        "@clack/prompts",
        "@standard-schema/spec",
        "arktype",
        "cac",
        "liquidjs",
        "picocolors",
        "preact",
        "preact/hooks",
        "preact/package.json",
        "valibot",
        "vite",
        "zod",
      ],
      output: {
        entryFileNames: "index.js",
      },
    },
    ssr: "src/index.ts",
    target: "node24",
  },
  plugins: [liquidRawPlugin()],
});
