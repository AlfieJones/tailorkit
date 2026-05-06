import { component, defineSchema, screen } from "@tailorkit/core/schema";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { tailorKit } from "../tailor-kit";

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

const tailor = tailorKit(schema, { baseUrl: "http://runtime.test" });

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
