import { iframeRuntimePlugin } from "./iframe-plugin.ts";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [iframeRuntimePlugin()],
});
