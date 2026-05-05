import { createRemoteComponentType } from "@tailorkit/core/remote";
import { component, defineSchema } from "@tailorkit/core/schema";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createReactHostRenderer, createRemoteUiHost } from "./host";
import type { WorkerUiController } from "./host";

const schema = defineSchema({
  components: {
    Button: component({
      callbacks: {
        onClick: {},
      },
      fields: z
        .object({
          disabled: z.boolean().optional(),
          label: z.string(),
        })
        .strict(),
      slots: ["default"],
    }),
  },
});

const controller = {
  callFunction: () => Promise.resolve(),
  dispatchEvent: () => {},
  mount: () => {},
  unmount: () => {},
} satisfies WorkerUiController;

const createElement = (
  type: unknown,
  _props: Record<string, unknown> | null,
  ...children: string[]
): string => `${String(type)}(${children.join("")})`;

const createHost = () =>
  createRemoteUiHost(
    createReactHostRenderer(createElement, controller, {
      components: {
        Button: "Button",
        Unknown: "Unknown",
      },
      componentValidation: schema.$internal.components,
      fragment: "Fragment",
    }),
  );

describe("remote UI host", () => {
  it("renders a remote tree with valid standard schema props", () => {
    const host = createHost();

    expect(
      host.handleWorkerMessage({
        revision: 1,
        tree: {
          children: [
            {
              children: [{ id: "text", kind: "text", text: "Save" }],
              id: "button",
              kind: "element",
              props: {
                label: "Save",
              },
              type: createRemoteComponentType("Button"),
            },
          ],
          id: "root",
          kind: "fragment",
        },
        type: "snapshot",
      }),
    ).toBe("Fragment(Button(Save))");
  });

  it("does not treat unknown components as a validation error", () => {
    const host = createHost();

    expect(
      host.handleWorkerMessage({
        revision: 1,
        tree: {
          children: [
            {
              children: [],
              id: "unknown",
              kind: "element",
              props: {},
              type: createRemoteComponentType("Unknown"),
            },
          ],
          id: "root",
          kind: "fragment",
        },
        type: "snapshot",
      }),
    ).toBe("Fragment(Unknown())");
  });

  it("rejects undeclared callback props before rendering", () => {
    const host = createHost();

    expect(
      host.handleWorkerMessage({
        revision: 1,
        tree: {
          children: [
            {
              children: [],
              id: "button",
              kind: "element",
              props: {
                label: "Save",
                onHover: {
                  handlerId: "handler",
                  kind: "function",
                },
              },
              type: createRemoteComponentType("Button"),
            },
          ],
          id: "root",
          kind: "fragment",
        },
        type: "snapshot",
      }),
    ).toContain("Button.onHover has no callback schema");
  });

  it("rejects field props that do not match the standard schema", () => {
    const host = createHost();

    expect(
      host.handleWorkerMessage({
        revision: 1,
        tree: {
          children: [
            {
              children: [],
              id: "button",
              kind: "element",
              props: {
                disabled: "yes",
                label: "Save",
              },
              type: createRemoteComponentType("Button"),
            },
          ],
          id: "root",
          kind: "fragment",
        },
        type: "snapshot",
      }),
    ).toContain("Button props failed validation");
  });

  it("rejects declared callbacks that are not remote callback references", () => {
    const host = createHost();

    expect(
      host.handleWorkerMessage({
        revision: 1,
        tree: {
          children: [
            {
              children: [],
              id: "button",
              kind: "element",
              props: {
                label: "Save",
                onClick: "not-a-callback",
              },
              type: createRemoteComponentType("Button"),
            },
          ],
          id: "root",
          kind: "fragment",
        },
        type: "snapshot",
      }),
    ).toContain("Button.onClick must be a remote callback reference");
  });
});
