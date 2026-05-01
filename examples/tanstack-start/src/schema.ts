import { component, defineSchema } from "@tailorkit/sdk";
import { native } from "@tailorkit/sdk/native-zod";
import { z } from "zod";

export const screenPathSchema = z.enum(["/", "/customers", "/settings"]);

export type ScreenPath = z.infer<typeof screenPathSchema>;

export const defaultContextSchema = z.object({
  organizationName: z.string(),
  userName: z.string(),
});

export const screenContextSchemas = {
  "/": z.object({
    highlights: z.array(z.string()),
    title: z.string(),
  }),
  "/customers": z.object({
    customerCount: z.number(),
    featuredCustomer: z.string(),
  }),
  "/settings": z.object({
    billingPlan: z.string(),
    workspaceRegion: z.string(),
  }),
} satisfies Record<ScreenPath, z.ZodType>;

export const screenLabels = {
  "/": "Overview",
  "/customers": "Customers",
  "/settings": "Settings",
} satisfies Record<ScreenPath, string>;

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
          input: [z.object({ value: z.string() })],
          output: z.boolean(),
        },
      },
      slots: ["default"],
    }),
    Input: component({
      extends: [native.input],
      fields: z.object({
        label: z.string().optional(),
      }),
      callbacks: {},
    }),
  },
  defaultContext: defaultContextSchema,
  screens: {
    "/": {
      context: screenContextSchemas["/"],
    },
    "/customers": {
      context: screenContextSchemas["/customers"],
    },
    "/settings": {
      context: screenContextSchemas["/settings"],
    },
  },
});

export const getDefaultContext = () =>
  defaultContextSchema.parse({
    organizationName: "Acme Studio",
    userName: "Mira Chen",
  });

export const getScreenContext = (
  screen: ScreenPath,
): z.output<(typeof screenContextSchemas)[ScreenPath]> =>
  screenContextSchemas[screen].parse(
    {
      "/": {
        highlights: ["Worker bundle loaded", "Shared schemas validated", "Host components active"],
        title: "Workspace overview",
      },
      "/customers": {
        customerCount: 128,
        featuredCustomer: "Northstar Labs",
      },
      "/settings": {
        billingPlan: "Team",
        workspaceRegion: "Australia Southeast",
      },
    }[screen],
  );
