import { useEffect, useMemo, useRef } from "react";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { ScreenDefinition } from "@tailorkit/core/schema";
import type { TailorKitStore } from "../tailor-kit";
import { useTailorRootContext } from "../components/context";

export type ScreenName<TScreens extends Record<string, ScreenDefinition>> = keyof TScreens & string;

export type ScreenContext<TScreen> =
  TScreen extends ScreenDefinition<infer TContext>
    ? TContext extends StandardJSONSchemaV1
      ? StandardJSONSchemaV1.InferOutput<TContext>
      : Record<string, never>
    : never;

interface ReadyScreenOptions<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  context: ScreenContext<TScreens[TScreen]>;
  screen: TScreen;
  status?: "ready";
}

interface LoadingScreenOptions<TScreen extends string> {
  context?: never;
  screen: TScreen;
  status: "loading";
}

interface ErrorScreenOptions<TScreen extends string> {
  context?: never;
  screen: TScreen;
  status: "error";
}

export type CurrentScreenOptions<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> =
  TScreen extends ScreenName<TScreens>
    ?
        | ReadyScreenOptions<TScreens, TScreen>
        | LoadingScreenOptions<TScreen>
        | ErrorScreenOptions<TScreen>
    : never;

export function createUseCurrentScreen<TScreens extends Record<string, ScreenDefinition>>(
  store: TailorKitStore,
) {
  return function useCurrentScreen<TScreen extends ScreenName<TScreens>>(
    options: CurrentScreenOptions<TScreens, TScreen>,
  ): void {
    useTailorRootContext("tailor.useCurrentScreen");
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
      [id],
    );

    useEffect(() => {
      store.registerScreen({
        context: contextSnapshot,
        id,
        screen: options.screen,
        status,
      });
    }, [contextSnapshot, id, options.screen, status]);
  };
}
