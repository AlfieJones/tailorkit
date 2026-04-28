import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  extends: [ultracite],
  ignorePatterns: [".agents/skills", ".claude/skills", "routeTree.gen.ts"],
});
