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

    expect(output).toContain("disabled?: boolean;");
    expect(output).toContain("label?: string;");
    expect(output).toContain("onClick?: () => void;");
    expect(output).toContain('createRemoteComponent<ButtonProps, readonly ["default"]>');
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

    expect(output).toContain("variant?: unknown;");
  });

  it("generates primitive component props from serialized fields", () => {
    const output = renderGeneratedTypes({
      components: {
        Box: {
          callbacks: {},
          fields: {
            properties: {
              padding: {
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
    expect(output).toContain("padding?: string;");
    expect(output).toContain('createRemoteComponent<BoxProps, readonly ["default"]>');
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
