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

const Tabs = component({
  fields: z.object({
    value: z.string(),
  }),
  callbacks: {
    onValueChange: {
      input: [z.string()],
    },
  },
  slots: ["default"],
});

const TabsList = component({
  slots: ["default"],
});

const TabsTab = component({
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"],
});

const TabsPanel = component({
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"],
});

const Input = component({
  fields: z.object({
    value: z.string(),
  }),
  callbacks: {
    onValueChange: {
      input: [z.string()],
    },
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
    Tabs,
    TabsList,
    TabsTab,
    TabsPanel,
    Input,
  },
  screens: {
    "/": screen({}),
  },
});

export const tailor = tailorKit({
  schema,
});
