import { defineTailorKitConfig } from "@tailorkit/app";

export default defineTailorKitConfig({
  components: {
    input: "./tailorkit.components.json",
    output: "./src/tailorkit.generated.tsx",
  },
  entry: "./src/main.tsx",
  outDir: ".tailorkit",
});
