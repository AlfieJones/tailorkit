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
    "/": { context: typedSchema<{ user: { id: string } }>() },
    "/home": { context: typedSchema<{ page: { title: string }; user: { id: string } }>() },
    "/home/detail": {
      context: typedSchema<{
        detail: { id: string };
        page: { title: string };
        user: { id: string };
      }>(),
    },
    "/user": { context: typedSchema<{ user: { id: string }; userId: string }>() },
  },
});

const tailor = createTailorKitClient<typeof server>({ baseUrl: "http://runtime.test" });
const app = { clientPath: "/apps/todo.js", id: "todo" };

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

const requiredComponentsServer = createTailorKitServer({
  components: {
    Button: {},
    Input: {},
  },
});

createTailorKitClient<typeof requiredComponentsServer>({
  baseUrl: "http://runtime.test",
  // @ts-expect-error all server components must have client renderers when components are provided
  components: {
    Button: () => null,
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

tailor.useCurrentScreen({
  screen: "/home",
  context: { page: { title: "Home" }, user: { id: "user_1" } },
});

tailor.useCurrentScreen({ screen: "/user", status: "loading" });

tailor.useCurrentScreen({ screen: "/user", status: "error" });

// @ts-expect-error invalid screen name
tailor.useCurrentScreen({ screen: "missing", context: {} });

// @ts-expect-error invalid context shape for selected screen
tailor.useCurrentScreen({ screen: "/user", context: { page: { title: "Home" } } });

// @ts-expect-error ready matches require context
tailor.useCurrentScreen({ screen: "/home" });

// @ts-expect-error loading screens cannot expose partial context
tailor.useCurrentScreen({ screen: "/user", status: "loading", context: { userId: "user_1" } });

<tailor.AppView app={app} />;

<tailor.AppView
  app={app}
  screen="/home"
  context={{ page: { title: "Home" }, user: { id: "user_1" } }}
/>;

<tailor.AppView app={app} screen="/user" status="loading" />;

<tailor.AppView app={app} screen="/user" status="error" />;

// @ts-expect-error invalid screen name
<tailor.AppView app={app} screen="missing" context={{}} />;

// @ts-expect-error invalid context shape for selected screen
<tailor.AppView app={app} screen="/user" context={{ page: { title: "Home" } }} />;

// @ts-expect-error ready app views require context when screen is provided
<tailor.AppView app={app} screen="/home" />;

// @ts-expect-error loading app views cannot expose context
<tailor.AppView app={app} screen="/user" status="loading" context={{ userId: "user_1" }} />;
