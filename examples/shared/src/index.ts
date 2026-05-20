import { tailorKit } from "tailorkit";
import { primitives } from "tailorkit/zod";
import { z } from "zod";

const Button = {
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  callbacks: {
    onClick: {},
  },
  slots: ["default"] as const,
} as const;

const Tabs = {
  fields: z.object({
    value: z.string(),
  }),
  callbacks: {
    onValueChange: {
      input: [z.string()] as const,
    },
  },
  slots: ["default"] as const,
} as const;

const TabsList = {
  slots: ["default"] as const,
} as const;

const TabsTab = {
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"] as const,
} as const;

const TabsPanel = {
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"] as const,
} as const;

const Input = {
  fields: z.object({
    value: z.string(),
  }),
  callbacks: {
    onValueChange: {
      input: [z.string()] as const,
    },
  },
  slots: ["default"] as const,
} as const;

// This is the contract between the your platform and apps
// Try to avoid breaking changes as this can break any apps which rely on the schema
export const tailor = tailorKit({
  components: {
    ...primitives({
      // See https://tailorkit.dev/docs/styling#theme
      tokens: {
        borderColor: {
          default: "var(--border)",
        },
        textColor: {
          default: "var(--text)",
        },
      },
    }),
    Button,
    Tabs,
    TabsList,
    TabsTab,
    TabsPanel,
    Input,
  },
  screens: {
    "/": {},
  },
});

export const schema = tailor.$internal.schema;
