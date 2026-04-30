
import { component, defineSchema } from "@tailorkit/sdk";
import { native } from "@tailorkit/sdk/native-zod";
import { z } from "zod";
import { defineReactComponents } from "@tailorkit/react";
import { Button } from "@tailorkit/ui/button";
import { Input } from "@tailorkit/ui/input";
import { schema } from "./schema";


export const schema = defineSchema({
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
          input: z.object({ value: z.string() }),
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




export const components = defineReactComponents(schema, {
  Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
  Input: ({ props, slots }) => <Input {...props}>{slots.default}</Input>,
});
