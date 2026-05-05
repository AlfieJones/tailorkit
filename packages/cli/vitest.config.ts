import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "liquid-raw",
      transform(code, id) {
        if (id.endsWith(".liquid")) {
          return `export default ${JSON.stringify(code)};`;
        }
      },
    },
  ],
});
