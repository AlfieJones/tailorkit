import { defineConfig } from "@tailorkit/sdk";
import { z } from "zod";

const nativeEventInput = z.object({
  checked: z.boolean().optional(),
  currentTargetId: z.string(),
  key: z.string().optional(),
  name: z.string(),
  targetId: z.string(),
  value: z.string().optional(),
});

export const tailorKitConfig = defineConfig({
  components: {
    Button: {
      callbacks: {
        onBlur: { input: nativeEventInput },
        onClick: { input: nativeEventInput },
        onFocus: { input: nativeEventInput },
        onKeyDown: { input: nativeEventInput },
        onKeyUp: { input: nativeEventInput },
        onPointerDown: { input: nativeEventInput },
        onPointerUp: { input: nativeEventInput },
        validate: {
          input: z.object({ value: z.string() }),
          output: z.boolean(),
        },
      },
      children: true,
      props: z.object({
        label: z.string(),
      }),
      render: () => null,
    },
  },
});

export const { callbackDefinitions } = tailorKitConfig;
