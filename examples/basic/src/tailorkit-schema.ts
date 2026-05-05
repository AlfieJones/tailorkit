import { component, defineSchema } from "@tailorkit/core/schema";
import { z } from "zod";

const emptyFields = z.object({}).strict();

export const tailorkitSchema = defineSchema({
  components: {
    Button: component({
      callbacks: {
        onClick: {},
      },
      fields: emptyFields,
      slots: ["default"],
    }),
    Text: component({
      fields: emptyFields,
      slots: ["default"],
    }),
  },
});
