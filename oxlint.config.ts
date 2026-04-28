import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [".agents/skills", ".claude/skills", "routeTree.gen.ts"],
  rules: {
    "ban-types": "warn",
    eqeqeq: "warn",
    "func-style": "off",
    "no-array-reduce": "off",
    "no-empty-function": "off",
    "no-eq-null": "warn",
    "no-inferrable-types": "off",
    "no-negated-condition": "off",
    "no-param-reassign": "off",
    "no-shadow": "off",
    "no-use-before-define": "off",
    "prefer-await-to-callbacks": "off",
    "prefer-logical-operator-over-ternary": "off",
    "sort-keys": "off",
    "prefer-destructuring": "off",
    "no-barrel-file": "off",
    "no-inline-comments": "off",
    "no-warning-comments": "warn",
    "avoid-new": "off",
    "no-promise-executor-return": "off",
    "no-named-as-default": "off",
    "prefer-ternary": "off",
    "prefer-await-to-then": "off",
  },
});
