import { createTailorKitServer } from "@tailorkit/core/server";
import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";
import type { ReactNode } from "react";
import { components, createTailorKitClient } from "../tailor-kit";

const typedSchema = <TValue,>(): StandardSchemaV1<unknown, TValue> &
  StandardJSONSchemaV1<unknown, TValue> =>
  ({
    "~standard": {
      jsonSchema: {
        input: () => ({}),
        output: () => ({}),
      },
      validate: (value: unknown) => ({ value: value as TValue }),
      vendor: "test",
      version: 1,
    },
  }) as const satisfies StandardSchemaV1<unknown, TValue> & StandardJSONSchemaV1<unknown, TValue>;

const server = createTailorKitServer({
  components: {
    Button: {},
  },
  screens: {
    "/home": { context: typedSchema<{ page: { title: string }; user: { id: string } }>() },
    "/user": { context: typedSchema<{ userId: string }>() },
  },
});

const tailor = createTailorKitClient<typeof server>({ baseUrl: "http://runtime.test" });

const slotsServer = createTailorKitServer({
  components: {
    Button: {
      slots: ["default"] as const,
    },
  },
});

const slotsSchema = slotsServer.$internal.schema;

createTailorKitClient<typeof slotsServer>({
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

const callbackServer = createTailorKitServer({
  components: {
    Button: {
      fields: typedSchema<{ variant?: "default" | "secondary" }>(),
      callbacks: {
        onClick: {},
      },
      slots: ["default"] as const,
    },
  },
});

components(callbackServer.$internal.schema, {
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
