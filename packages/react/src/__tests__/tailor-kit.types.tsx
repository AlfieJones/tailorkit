import { AppView, useScope } from "../index";
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
  viewports: {
    panel: { scopes: ["/", "/home", "/home/detail", "/user"] },
    navbar: { scopes: ["/"] },
  },
  components: {
    Button: {},
  },
  scopes: {
    "/": { context: typedSchema<{ user: { id: string } }>() },
    "/home": { context: typedSchema<{ page: { title: string } }>() },
    "/home/detail": {
      context: typedSchema<{
        detail: { id: string };
      }>(),
    },
    "/user": { context: typedSchema<{ userId: string }>() },
  },
});

const tailor = createTailorKitClient<typeof server>({ baseUrl: "http://runtime.test" });
const app = { clientPath: "/apps/todo.js", id: "todo" };

const childrenServer = createTailorKitServer({
  components: {
    Button: {
      children: true,
    },
  },
});

const childrenSchema = childrenServer.$internal.schema;

createTailorKitClient<typeof childrenServer>({
  baseUrl: "http://runtime.test",
  components: {
    Button: ({ children }) => {
      const content: ReactNode = children;
      return content;
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

components(childrenSchema, {
  Button: ({ props, children }) => {
    const typedProps = props satisfies Record<string, never>;
    const typedChildren: ReactNode = children;
    void typedProps;
    void typedChildren;
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
      children: true,
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

useScope({
  scope: "/home",
  context: { page: { title: "Home" } },
});

useScope({ scope: "/user", status: "loading" });

useScope({ scope: "/user", status: "error" });

// @ts-expect-error invalid screen name
useScope({ scope: "missing", context: {} });

// @ts-expect-error invalid context shape for selected screen
useScope({ scope: "/user", context: { page: { title: "Home" } } });

// @ts-expect-error ready matches require context
useScope({ scope: "/home" });

// @ts-expect-error loading screens cannot expose partial context
useScope({ scope: "/user", status: "loading", context: { userId: "user_1" } });

<AppView viewport="panel" app={app} />;

<AppView viewport="panel" app={app} scope="/home" context={{ page: { title: "Home" } }} />;

<AppView viewport="panel" app={app} scope="/user" status="loading" />;

<AppView viewport="panel" app={app} scope="/user" status="error" />;

// @ts-expect-error invalid screen name
<AppView viewport="panel" app={app} scope="missing" context={{}} />;

// @ts-expect-error invalid context shape for selected screen
<AppView viewport="panel" app={app} scope="/user" context={{ page: { title: "Home" } }} />;

// @ts-expect-error ready app views require context when screen is provided
<AppView viewport="panel" app={app} scope="/home" />;

// @ts-expect-error loading app views cannot expose context
<AppView
  viewport="panel"
  app={app}
  scope="/user"
  status="loading"
  context={{ userId: "user_1" }}
/>;

declare module "../tailor-kit" {
  interface Register {
    client: typeof tailor;
  }
}

// @ts-expect-error Unknown host viewport.
<AppView app={app} viewport="missing" />;

// @ts-expect-error The navbar supports root only, despite /user being globally declared.
<AppView app={app} viewport="navbar" scope="/user" context={{ userId: "u1" }} />;
<AppView app={app} viewport="navbar" scope="/" context={{ user: { id: "u1" } }} />;
