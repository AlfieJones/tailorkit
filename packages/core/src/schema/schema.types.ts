import { component } from "./schema";
import { z } from "zod";

component({
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  slots: ["default"] as const,
});

component({
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  callbacks: {
    onClick: {},
  },
  slots: ["default"] as const,
});

// @ts-expect-error field and callback keys must still conflict when explicitly duplicated
component({
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  callbacks: {
    variant: {},
  },
});
