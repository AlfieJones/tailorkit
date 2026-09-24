export const appTemplateFiles = {
  "package.json": JSON.stringify(
    {
      name: "tailorkit-generated-app",
      private: true,
      type: "module",
      scripts: { build: "node build.mjs", typecheck: "tsc --noEmit" },
      dependencies: {
        "@tailorkit/app": "0.1.0-beta.14",
        preact: "^10.29.8",
      },
      devDependencies: {
        typescript: "^7.0.2",
        vite: "^8.3.0",
      },
    },
    null,
    2,
  ),
  "build.mjs": `import { buildApp } from "@tailorkit/app/builder";\nawait buildApp();\n`,
  "tailorkit.config.ts": `export default {\n  client: { entry: "./src/client.ts" },\n};\n`,
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "preact",
        module: "ESNext",
        moduleResolution: "Bundler",
        noEmit: true,
        strict: true,
        target: "ESNext",
        types: ["vite/client"],
      },
      include: ["src/**/*.ts", "src/**/*.tsx"],
    },
    null,
    2,
  ),
  "src/tailorkit.gen.ts": `import type { TailorKitViews } from "@tailorkit/app";\n\ndeclare module "@tailorkit/app" {\n  interface TailorKitViews {\n    "/": { context: Record<string, never> };\n  }\n  interface TailorKitSlots {\n    panel: "/";\n    navbar: "/";\n  }\n}\n\nexport type GeneratedViews = TailorKitViews;\n`,
  "src/client.ts": `import "./tailorkit.gen";\nimport { defineClient } from "@tailorkit/app";\nimport defaultView from "./views/default";\n\nexport default defineClient({\n  slots: {\n    panel: { "/": defaultView },\n    navbar: { "/": defaultView },\n  },\n});\n`,
  "src/views/default.tsx": `import { createView } from "@tailorkit/app";\n\nfunction DefaultView() {\n  return (\n    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>\n      <h1>Your app preview</h1>\n      <p>Describe what you want to build to get started.</p>\n    </main>\n  );\n}\n\nexport default createView("/", { component: DefaultView });\n`,
} as const;

export function isEditableSourcePath(path: string): boolean {
  return (
    path.startsWith("src/") &&
    !path.includes("..") &&
    !path.startsWith("src/tailorkit.gen.") &&
    /\.(?:ts|tsx|css|json)$/u.test(path)
  );
}

export function validateSourceFiles(source: unknown): Record<string, string> {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("The source snapshot is invalid.");
  }

  const entries = Object.entries(source);
  if (entries.length > 200) {
    throw new Error("The app source contains too many files.");
  }

  const files: Record<string, string> = {};
  let totalBytes = 0;
  for (const [path, content] of entries) {
    if (!isEditableSourcePath(path) || typeof content !== "string") {
      throw new Error(`The source snapshot contains an unsupported file: ${path}`);
    }
    const size = new TextEncoder().encode(content).byteLength;
    if (size > 256 * 1024) {
      throw new Error(`The source file ${path} is larger than 256 KB.`);
    }
    totalBytes += size;
    if (totalBytes > 2 * 1024 * 1024) {
      throw new Error("The source snapshot is larger than 2 MB.");
    }
    files[path] = content;
  }

  return files;
}
