import z from "zod";
import { callback, defineComponent, defineConfig, nativeCallbacks } from "../index";

const component = defineComponent({
  callbacks: {
    ...nativeCallbacks.button,
    validate: callback({
      input: z.object({
        value: z.string(),
      }),
      output: z.boolean(),
    }),
  },
  props: z.object({
    label: z.string(),
  }),
  children: true,
  render: ({ callbacks, children, props }) => {
    callbacks.onClick({
      currentTargetId: "button",
      name: "click",
      targetId: "button",
    });
    callbacks.validate({ value: props.label }) satisfies Promise<boolean>;
    children satisfies React.ReactNode;
    props.label satisfies string;

    return null;
  },
});

export const tailorKit = defineConfig({
  components: {
    Button: component,
  },
});
