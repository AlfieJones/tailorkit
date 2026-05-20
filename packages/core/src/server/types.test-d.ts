import { expectTypeOf } from "vitest";
import type { TailorKitHandlerOptions, TailorKitHostContext } from "./types";

interface UserContext {
  user: { id: string };
}

expectTypeOf<TailorKitHostContext<UserContext>>().toMatchTypeOf<{
  actionContext: UserContext;
  scopeId: string;
}>();

expectTypeOf<TailorKitHostContext<never>>().toMatchTypeOf<{
  actionContext?: never;
  scopeId: string;
}>();

expectTypeOf<TailorKitHandlerOptions<UserContext>>().toMatchTypeOf<{
  authenticate: (
    request: Request,
  ) => TailorKitHostContext<UserContext> | null | Promise<TailorKitHostContext<UserContext> | null>;
}>();

const contextlessHandlerContext: TailorKitHostContext<never> = {
  scopeId: "user:user_1",
};
void contextlessHandlerContext;

const invalidContextlessHandlerContext: TailorKitHostContext<never> = {
  // @ts-expect-error actionContext cannot be provided when no action context is declared
  actionContext: {},
  scopeId: "user:user_1",
};
void invalidContextlessHandlerContext;
