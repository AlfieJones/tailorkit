import { createActions, createTailorKit } from "tailorkit";
import { primitives } from "tailorkit/zod";
import { z } from "zod";
import type { DemoUser } from "@examples/shared";

const Button = {
  fields: z.object({
    variant: z.enum(["default", "secondary"]),
  }),
  callbacks: {
    onClick: {},
  },
  slots: ["default"],
};

const action = createActions().context<{ user: DemoUser }>();

export const tailorKit = createTailorKit({
  projectKey: process.env.TAILORKIT_PROJECT_KEY,
  $internal: {
    platformBaseUrl:
      process.env.TAILORKIT_PLATFORM_BASE_URL ?? "http://localhost:3000/api/platform",
  },

  components: {
    ...primitives({
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
  },

  screens: {
    "/": {
      context: z.object({}),
    },
  },

  actions: {
    echo: action
      .input(z.string())
      .output(z.string())
      .handler(({ input, context }) => `${context.user.name} said '${input}'`),
  },
});
