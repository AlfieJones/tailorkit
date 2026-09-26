import { defineConfig } from "vite-plus";

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
