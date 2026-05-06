import { component, defineSchema, screen, primitives } from "@tailorkit/core/schema";
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
    Input: component({
      fields: z.object({
        type: z.enum(["text", "email", "password"]).optional(),
        placeholder: z.string().optional(),
        value: z.string().optional(),
        disabled: z.boolean().optional(),
      }),
      callbacks: {
        onChange: {},
        onBlur: {},
        onFocus: {},
      },
      slots: ["default"],
    }),
    Tabs: component({
      fields: z.object({
        tabs: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ),
        value: z.string().optional(),
        variant: z.enum(["default", "underline"]).optional(),
      }),
      callbacks: {
        onChange: {},
      },
      slots: ["default"],
    }),
  },
  screens: {
    "/": screen({}),
    "/users/:userId": screen({
      context: z.object({
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
        }),
      }),
    }),
  },
});

export default schema;
