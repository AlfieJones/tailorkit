import { component, defineSchema, tailorKit } from "@tailorkit/sdk";
import { native } from "@tailorkit/sdk/native-zod";
import { z } from "zod";
import { createReactClient } from "@tailorkit/react";
import { Button } from "@tailorkit/ui/button";
import { Input } from "@tailorkit/ui/input";

export const tailorSchema = defineSchema({
  components: {
    Button: component({
      extends: [native.button],
      fields: z.object({
        loading: z.boolean().optional(),
        size: z.enum(["sm", "default", "lg", "icon"]).optional(),
        variant: z
          .enum([
            "default",
            "secondary",
            "outline",
            "ghost",
            "link",
            "destructive",
            "destructive-outline",
          ])
          .optional(),
      }),
      callbacks: {
        reset: {
          async: true,
        },
        validate: {
          async: true,
          input: [z.object({ value: z.string() })],
          output: z.boolean(),
        },
      },
      slots: ["default"],
    }),
    Input: component({
      extends: [native.input],
      fields: z.object({}),
      callbacks: {},
      slots: ["default"],
    }),
  },
});

export const tailor = tailorKit({
  schema: tailorSchema,
});

export const tailorClient = createReactClient(tailorSchema, {
  components: {
    Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
    Input: ({ props, slots }) => <Input {...props}>{slots.default}</Input>,
  },
});
