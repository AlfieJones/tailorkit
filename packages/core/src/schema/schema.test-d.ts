import { createActions, createTailorKitSchema } from "./schema";
import type { ComponentProps, ComponentSlots, InferActionInput, InferActionOutput } from "./schema";
import { expectTypeOf } from "vitest";
import { z } from "zod";

interface User {
  id: string;
}
interface Org {
  id: string;
}

const untypedAction = createActions();

createTailorKitSchema({
  components: {
    Button: {
      fields: z.object({
        variant: z.enum(["default", "secondary"]),
      }),
      slots: ["default"] as const,
    },
  },
});

const tailor = createTailorKitSchema({
  components: {
    Button: {
      fields: z.object({
        variant: z.enum(["default", "secondary"]),
      }),
      slots: ["default"] as const,
    },
  },
  screens: {
    "/": {},
    "/customers/:customerId": {
      context: z.object({ customerId: z.string() }),
    },
  },
  actions: {
    noSchemas: untypedAction.handler(() => ({ ok: true })),
    withInput: untypedAction.input(z.object({ id: z.string() })).handler(({ input }) => input.id),
    withOutput: untypedAction
      .output(z.object({ ok: z.literal(true) }))
      .handler(() => ({ ok: true as const })),
    invalidOutput: untypedAction
      .output(z.object({ ok: z.literal(true) }))
      // @ts-expect-error action handlers must return values matching their output schema
      .handler(() => ({ ok: false })),
  },
});

const component = tailor.components.Button;
const screen = tailor.screens["/customers/:customerId"];
const noSchemaAction = tailor.actions.noSchemas;
void component;
void screen;
void noSchemaAction;

const buttonProps: ComponentProps<typeof tailor.components.Button> = { variant: "default" };
void buttonProps;

expectTypeOf<ComponentProps<typeof tailor.components.Button>>().toMatchTypeOf<{
  variant: "default" | "secondary";
}>();
expectTypeOf<ComponentSlots<typeof tailor.components.Button>>().toEqualTypeOf<{
  default: unknown;
}>();
expectTypeOf<typeof screen.context>().toEqualTypeOf<z.ZodObject<{ customerId: z.ZodString }>>();
expectTypeOf<InferActionInput<typeof tailor.actions.withInput>>().toEqualTypeOf<{ id: string }>();
expectTypeOf<InferActionOutput<typeof tailor.actions.withOutput>>().toEqualTypeOf<{ ok: true }>();
expectTypeOf<InferActionOutput<typeof noSchemaAction>>().toEqualTypeOf<{ ok: boolean }>();

const callbacks = createTailorKitSchema({
  components: {
    Dialog: {
      callbacks: {
        onSave: {
          input: [z.object({ title: z.string() }), z.number()] as const,
          output: z.object({ saved: z.boolean() }),
        },
        onClose: {},
        onLoad: {
          async: true,
          output: z.object({ ready: z.literal(true) }),
        },
      },
    },
  },
});

const dialogProps: ComponentProps<typeof callbacks.components.Dialog> = {
  onSave: (args_0, args_1) => {
    expectTypeOf(args_0).toEqualTypeOf<{ title: string }>();
    expectTypeOf(args_1).toEqualTypeOf<number>();
    return { saved: true };
  },
  onClose: () => {},
  onLoad: () => Promise.resolve({ ready: true as const }),
};
void dialogProps;
expectTypeOf<ComponentProps<typeof callbacks.components.Dialog>>().toMatchTypeOf<{
  onSave: (args_0: { title: string }, args_1: number) => { saved: boolean };
  onClose: () => void;
  onLoad: () => Promise<{ ready: true }>;
}>();

const userAction = createActions().context<{ user: User }>();
const matchingUserAction = createActions().context<{ user: User }>();
const orgAction = createActions().context<{ org: Org }>();

createTailorKitSchema({
  components: {},
  actions: {
    getUser: userAction.handler(({ context }) => context.user.id),
    nested: {
      getNestedUser: matchingUserAction.handler(({ context }) => context.user.id),
    },
  },
});

createTailorKitSchema({
  components: {},
  // @ts-expect-error all actions in one TailorKit instance must use the same context type
  actions: {
    getUser: userAction.handler(({ context }) => context.user.id),
    nested: {
      getOrg: orgAction.handler(({ context }) => context.org.id),
    },
  },
});

createTailorKitSchema({
  components: {
    Button: {
      fields: z.object({
        variant: z.enum(["default", "secondary"]),
      }),
      callbacks: {
        onClick: {},
      },
      slots: ["default"] as const,
    },
  },
});

createTailorKitSchema({
  components: {
    // @ts-expect-error field and callback keys must still conflict when explicitly duplicated
    Button: {
      fields: z.object({
        variant: z.enum(["default", "secondary"]),
      }),
      callbacks: {
        variant: {},
      },
    },
  },
});
