import { iframeRuntimePlugin } from "./iframe-plugin.ts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [iframeRuntimePlugin()],
});
