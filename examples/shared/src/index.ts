import { component, defineSchema, screen } from "@tailorkit/core/schema";
import { z } from "zod";

export const schema = defineSchema({
  components: {
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
  },
  screens: {
    "/": screen({
      context: z.object({
        page: z.object({
          title: z.string(),
        }),
      }),
    }),
    "/users/:userId": screen({
      context: z.object({
        params: z.object({
          userId: z.string(),
        }),
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
        }),
      }),
    }),
  },
});
