import { component, defineSchema, screen, primitives, tailorKit } from "tailorkit";
import { z } from "zod";

const Button = component({
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  callbacks: {
    onClick: {},
  },
  slots: ["default"],
});

// This is the contract between the your platform and apps
// Try to avoid breaking changes as this can break any apps which rely on the schema
export const schema = defineSchema({
  theme: {
    // See https://tailorkit.dev/docs/styling#theme
    tokens: {
      borderColor: {
        default: "var(--border)",
      },
      textColor: {
        default: "var(--text)",
      },
    },
  },
  components: {
    ...primitives,
    Button,
  },
  screens: {
    "/": screen({}),
  },
});

export const tailor = tailorKit({
  schema,
});
