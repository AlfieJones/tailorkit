import { build } from "vite";

// Each app must be self-contained: data-URL imports cannot resolve shared chunks.
for (const name of ["todo", "messages"]) {
  await build({
    configFile: false,
    publicDir: false,
    build: {
      outDir: "public/tailorkit-clients",
      emptyOutDir: false,
      lib: { entry: `clients/${name}.ts`, fileName: () => `${name}.js`, formats: ["es"] },
      minify: true,
    },
  });
}
