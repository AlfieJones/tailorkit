interface TemplateOptions {
  packageName: string;
  packageVersions: {
    preact: string;
    typescript: string;
  };
  useWorkspaceDependencies?: boolean;
}

export const createPackageJson = ({
  packageName,
  packageVersions,
  useWorkspaceDependencies,
}: TemplateOptions): string => {
  const tailorkitVersion = useWorkspaceDependencies ? "workspace:*" : "latest";

  return `${JSON.stringify(
    {
      name: packageName,
      description: "A TailorKit.dev app for building sandboxed custom UI components.",
      private: true,
      scripts: {
        build: "tailorkit build",
        dev: "tailorkit dev",
        generate: "tailorkit generate",
      },
      dependencies: {
        "@tailorkit/app": tailorkitVersion,
        "@tailorkit/sandbox-ui": tailorkitVersion,
        preact: packageVersions.preact,
      },
      devDependencies: {
        "@tailorkit/cli": tailorkitVersion,
        typescript: packageVersions.typescript,
      },
      type: "module",
    },
    null,
    2,
  )}
`;
};

export const createTailorKitConfig =
  (): string => `import { defineTailorKitConfig } from "@tailorkit/app";

export default defineTailorKitConfig({
  components: {
    input: "./tailorkit.components.json",
    output: "./src/tailorkit.generated.tsx",
  },
  entry: "./src/main.tsx",
  outDir: ".tailorkit",
});
`;

export const createComponentSpec = (): string => `${JSON.stringify(
  {
    components: {
      Button: {
        props: {
          children: "ComponentChildren",
          disabled: "boolean",
          onClick: "() => void",
          variant: '"default" | "secondary"',
        },
      },
    },
  },
  null,
  2,
)}
`;

export const createApp = (): string => `import { Button } from "./tailorkit.generated";

export const App = () => (
  <section>
    <h1>TailorKit sandbox</h1>
    <Button variant="default">Hello from the sandbox</Button>
  </section>
);
`;

export const createMain =
  (): string => `import { exposePreactWorker } from "@tailorkit/sandbox-ui/worker";
import { h } from "preact";
import { App } from "./app";

exposePreactWorker(self as unknown as MessagePort, () => h(App, null));
`;

export const createGeneratedFile =
  (): string => `import { createRemoteComponent } from "@tailorkit/sandbox-ui/worker";
import type { ComponentChildren, FunctionalComponent } from "preact";

export interface ButtonProps {
  children?: ComponentChildren;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "secondary";
}

export const Button = createRemoteComponent("Button") as unknown as FunctionalComponent<ButtonProps>;
`;

export const createTsconfig = (): string => `${JSON.stringify(
  {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      isolatedModules: true,
      jsx: "react-jsx",
      jsxImportSource: "preact",
      lib: ["ESNext", "DOM", "WebWorker"],
      module: "ESNext",
      moduleResolution: "bundler",
      noEmit: true,
      strict: true,
      target: "ESNext",
      types: ["vite/client"],
      verbatimModuleSyntax: true,
    },
    include: ["src", "tailorkit.config.ts"],
  },
  null,
  2,
)}
`;
