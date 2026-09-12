import { useEffect, useMemo, useRef } from "react";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { ScopeDefinition } from "@tailorkit/core/schema";
import type { RegisteredScopes } from "../tailor-kit";
import { useTailorRootContext } from "../components/context";

export type ScreenName<TScreens extends Record<string, ScopeDefinition>> = keyof TScreens & string;

export type ScreenContext<TScreen> =
  TScreen extends ScopeDefinition<infer TContext>
    ? TContext extends StandardJSONSchemaV1
      ? StandardJSONSchemaV1.InferOutput<TContext>
      : Record<string, never>
    : never;

interface ReadyScreenOptions<
  TScreens extends Record<string, ScopeDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  context: ScreenContext<TScreens[TScreen]>;
  scope: TScreen;
  status?: "ready";
}

interface LoadingScreenOptions<TScreen extends string> {
  context?: never;
  scope: TScreen;
  status: "loading";
}

interface ErrorScreenOptions<TScreen extends string> {
  context?: never;
  scope: TScreen;
  status: "error";
}

export type ScopeOptions<
  TScreens extends Record<string, ScopeDefinition> = RegisteredScopes,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> =
  TScreen extends ScreenName<TScreens>
    ?
        | ReadyScreenOptions<TScreens, TScreen>
        | LoadingScreenOptions<TScreen>
        | ErrorScreenOptions<TScreen>
    : never;

export type ScopeState<
  TScopes extends Record<string, ScopeDefinition> = RegisteredScopes,
  TScope extends ScreenName<TScopes> = ScreenName<TScopes>,
> =
  | Omit<ReadyScreenOptions<TScopes, TScope>, "scope">
  | Omit<LoadingScreenOptions<TScope>, "scope">
  | Omit<ErrorScreenOptions<TScope>, "scope">;

export function useScope<TScreen extends ScreenName<RegisteredScopes>>(
  scope: TScreen,
  options: ScopeState<RegisteredScopes, NoInfer<TScreen>>,
): void {
  const { store } = useTailorRootContext("useScope");
  const id = useMemo(() => Symbol("tailorkit-current-screen"), []);
  const status = options.status ?? "ready";
  const context = "context" in options ? options.context : undefined;
  const contextKey = JSON.stringify(context);
  const contextRef = useRef({ key: contextKey, value: context });
  if (contextRef.current.key !== contextKey) {
    contextRef.current = { key: contextKey, value: context };
  }
  const contextSnapshot = contextRef.current.value;

  useEffect(
    () => () => {
      store.unregisterScreen(id);
    },
    [id, store],
  );

  useEffect(() => {
    store.registerScreen({
      context: contextSnapshot,
      id,
      screen: scope,
      status,
    });
  }, [contextSnapshot, id, scope, status, store]);
}
