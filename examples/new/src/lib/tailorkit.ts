import { createElement } from "react";
import type { ReactNode } from "react";
import { tailorKit } from "tailorkit/react";
import { defineSchema } from "tailorkit";
import { z } from "zod";

export const schema = defineSchema({
  components: {
    Button: {
      fields: z.object({
        variant: z.enum(["primary", "secondary"]),
      }),
      callbacks: {
        onClick: {},
      },
      slots: ["default"],
    },
  },
});

export const tk = tailorKit(schema, {
  components: {
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
