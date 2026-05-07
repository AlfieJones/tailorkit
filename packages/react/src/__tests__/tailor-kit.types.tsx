import { component, defineSchema, screen } from "@tailorkit/core/schema";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { ReactNode } from "react";
import { components, createTailorKitClient } from "../tailor-kit";

const typedSchema = <TValue,>(): StandardSchemaV1<unknown, TValue> =>
  ({
    "~standard": {
      validate: (value: unknown) => ({ value: value as TValue }),
      vendor: "test",
      version: 1,
    },
  }) as const satisfies StandardSchemaV1<unknown, TValue>;

const schema = defineSchema({
  components: {
    Button: component({}),
  },
  screens: {
    "/home": screen({
      context: typedSchema<{ page: { title: string }; user: { id: string } }>(),
    }),
    "/user": screen({
      context: typedSchema<{ userId: string }>(),
    }),
  },
});

const tailor = createTailorKitClient(schema, { baseUrl: "http://runtime.test" });

const slotsSchema = defineSchema({
  components: {
    Button: component({
      slots: ["default"] as const,
    }),
  },
});

createTailorKitClient(slotsSchema, {
  baseUrl: "http://runtime.test",
  components: {
    Button: ({ slots }) => {
      const slot: ReactNode = slots.default;
      return slot;
    },
  },
});

components(slotsSchema, {
  Button: ({ props, slots }) => {
    const typedProps = props satisfies Record<string, never>;
    const typedSlot: ReactNode = slots.default;
    void typedProps;
    void typedSlot;
    return null;
  },
});

const callbackSchema = defineSchema({
  components: {
    Button: component({
      fields: typedSchema<{ variant?: "default" | "secondary" }>(),
      callbacks: {
        onClick: {},
      },
      slots: ["default"] as const,
    }),
  },
});

components(callbackSchema, {
  Button: ({ props }) => {
    const variant: "default" | "secondary" | undefined = props.variant;
    const onClick: (() => void) | undefined = props.onClick;
    void variant;
    void onClick;
    return null;
  },
});

<tailor.ScreenMatch
  pattern="/"
  screen="/home"
  context={{ page: { title: "Home" }, user: { id: "user_1" } }}
/>;

<tailor.ScreenMatch pattern="/users/:userId" screen="/user" isLoading />;

<tailor.ScreenMatch
  pattern="/users/:userId"
  screen="/user"
  isLoading
  context={{ userId: "user_1" }}
/>;

// @ts-expect-error invalid screen name
<tailor.ScreenMatch pattern="/" screen="missing" context={{}} />;

// @ts-expect-error invalid context shape for selected screen
<tailor.ScreenMatch pattern="/" screen="/user" context={{ page: { title: "Home" } }} />;

// @ts-expect-error ready matches require context
<tailor.ScreenMatch pattern="/" screen="/home" />;

// @ts-expect-error isLoading false requires full context
<tailor.ScreenMatch pattern="/" screen="/home" isLoading={false} />;
