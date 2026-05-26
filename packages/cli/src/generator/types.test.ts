import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { generateTypes, renderGeneratedTypes } from "./types";

const testDirectories: string[] = [];

const createTempDir = async (): Promise<string> => {
  const directory = await mkdtemp(path.join(tmpdir(), "tailorkit-types-"));
  testDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  for (const directory of testDirectories.splice(0)) {
    await rm(directory, { force: true, recursive: true });
  }
});

describe("renderGeneratedTypes", () => {
  it("generates screen props from schema screens", () => {
    const output = renderGeneratedTypes({
      components: {},
      screens: {
        "/test": {
          context: {
            additionalProperties: false,
            properties: {},
            type: "object",
          },
        },
      },
    });

    expect(output).toContain('"/test": {');
    expect(output).toContain("context: Record<string, never>;");
  });

  it("generates component props from fields and callbacks", () => {
    const output = renderGeneratedTypes({
      components: {
        Button: {
          callbacks: {
            onClick: {},
            onValueChange: {
              input: [{ type: "string" }],
            },
          },
          fields: {
            additionalProperties: false,
            properties: {
              disabled: {
                type: "boolean",
              },
              label: {
                type: "string",
              },
            },
            required: ["label"],
            type: "object",
          },
          slots: ["default"],
        },
      },
      screens: {},
    });

    expect(output).toContain("export type Disabled = boolean;");
    expect(output).toContain("export type Label = string;");
    expect(output).toContain("disabled?: Disabled;");
    expect(output).toContain("label?: Label;");
    expect(output).toContain("onClick?: () => void;");
    expect(output).toContain("onValueChange?: (value1: string) => void;");
    expect(output).toContain('createRemoteComponent<ButtonProps, readonly ["default"]>');
    expect(output).toContain('callbacks: { "onClick": 0, "onValueChange": 1 }');
  });

  it("supports fieldKeys from older schema files", () => {
    const output = renderGeneratedTypes({
      components: {
        Button: {
          callbacks: {},
          fieldKeys: ["variant"],
          slots: ["default"],
        },
      },
      screens: {},
    });

    expect(output).toContain("export type Variant = unknown;");
    expect(output).toContain("variant?: Variant;");
  });

  it("generates primitive component props from serialized fields", () => {
    const output = renderGeneratedTypes({
      components: {
        Box: {
          callbacks: {},
          fields: {
            properties: {
              padding: {
                enum: ["sm", "md", "lg"],
                type: "string",
              },
            },
            type: "object",
          },
          slots: ["default"],
        },
      },
      screens: {},
    });

    expect(output).toContain("export interface BoxProps");
    expect(output).toContain('export type Padding = "sm" | "md" | "lg";');
    expect(output).toContain("padding?: Padding;");
    expect(output).toContain('createRemoteComponent<BoxProps, readonly ["default"]>');
  });

  it("generates literal responsive primitive token props", () => {
    const output = renderGeneratedTypes({
      components: {
        Box: {
          callbacks: {},
          fields: {
            properties: {
              margin: {
                anyOf: [
                  {
                    enum: ["lg", "xl"],
                    type: "string",
                  },
                  {
                    additionalProperties: false,
                    properties: {
                      base: {
                        enum: ["lg", "xl"],
                        type: "string",
                      },
                      md: {
                        enum: ["lg", "xl"],
                        type: "string",
                      },
                    },
                    type: "object",
                  },
                ],
              },
            },
            type: "object",
          },
          slots: ["default"],
        },
      },
      screens: {},
    });

    expect(output).toContain(
      'export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";',
    );
    expect(output).toContain(
      "export type Responsive<TValue> = TValue | Partial<Record<Breakpoint, TValue>>;",
    );
    expect(output).toContain('export type Margin = Responsive<"lg" | "xl">;');
    expect(output).toContain("margin?: Margin;");
  });

  it("generates never for primitive props with no configured tokens", () => {
    const output = renderGeneratedTypes({
      components: {
        Box: {
          callbacks: {},
          fields: {
            properties: {
              background: {
                anyOf: [
                  {
                    not: {},
                  },
                  {
                    additionalProperties: false,
                    properties: {
                      base: {
                        not: {},
                      },
                      md: {
                        not: {},
                      },
                    },
                    type: "object",
                  },
                ],
              },
            },
            type: "object",
          },
          slots: ["default"],
        },
      },
      screens: {},
    });

    expect(output).toContain("export type Background = never;");
    expect(output).toContain("background?: Background;");
  });

  it("generates typed action callers without request context", () => {
    const output = renderGeneratedTypes({
      actions: {
        todo: {
          create: {
            input: {
              properties: {
                title: { type: "string" },
              },
              required: ["title"],
              type: "object",
            },
            output: {
              properties: {
                id: { type: "string" },
                title: { type: "string" },
              },
              required: ["id", "title"],
              type: "object",
            },
          },
        },
      },
      components: {},
      screens: {},
    });

    expect(output).toContain("export type TailorKitActions = {");
    expect(output).toContain("todo: {");
    expect(output).toContain("create: (input: {");
    expect(output).toContain("title: string;");
    expect(output).toContain("}) => Promise<{");
    expect(output).toContain("id: string;");
    expect(output).not.toContain("requestContext");
  });
});

describe("generateTypes", () => {
  it("writes generated types from tailorkit.schema.json", async () => {
    const targetDirectory = await createTempDir();
    await writeFile(
      path.join(targetDirectory, "tailorkit.schema.json"),
      JSON.stringify({
        components: {},
        screens: {
          "/test": {
            context: {
              additionalProperties: false,
              properties: {},
              type: "object",
            },
          },
        },
        version: 1,
      }),
      "utf-8",
    );

    await generateTypes({ cwd: targetDirectory });

    const output = await readFile(path.join(targetDirectory, "src", "tailorkit.gen.ts"), "utf-8");
    expect(output).toContain('"/test": {');
  });
});
