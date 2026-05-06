import { createElement } from "react";
import type { ReactNode } from "react";
import { primitives as reactPrimitives, tailorKit } from "tailorkit/react";
import { component, defineSchema, primitives, screen } from "tailorkit";
import { z } from "zod";

export const schema = defineSchema({
  theme: {
    tokens: {
      background: {
        muted: "var(--muted)",
        surface: "var(--background)",
      },
      borderColor: {
        default: "var(--border)",
      },
    },
  },
  components: {
    ...primitives,
    Button: component({
      fields: z.object({
        variant: z.enum(["primary", "secondary"]),
      }),
      callbacks: {
        onClick: {},
      },
      slots: ["default"],
    }),
  },
  screens: {
    "/home": screen({
      context: z.object({
        page: z.object({
          title: z.string(),
        }),
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
        }),
      }),
    }),
  },
});

export const tailor = tailorKit(schema, {
  baseUrl: "http://127.0.0.1:4175",
  components: {
    ...reactPrimitives,
    Button: ({ props, slots }) =>
      createElement(
        "button",
        {
          type: "button",
          className:
            props.variant === "primary"
              ? "cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              : "cursor-pointer rounded bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200",
          onClick: () => {
            props.onClick();
          },
        },
        slots.default as ReactNode,
      ),
  },
});
