import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { ScreenDefinition } from "@tailorkit/core/schema";
import type { TailorKitStore } from "../tailor-kit";
import { useTailorRootContext } from "./context";

const ScreenMatchContext = createContext<{ depth: number; id: symbol | null }>({
  depth: 0,
  id: null,
});

type ScreenContext<TScreen> =
  TScreen extends ScreenDefinition<infer TContext>
    ? TContext extends StandardJSONSchemaV1
      ? StandardJSONSchemaV1.InferOutput<TContext>
      : Record<string, never>
    : never;

export type ScreenName<TScreens extends Record<string, ScreenDefinition>> = keyof TScreens & string;

interface ScreenMatchLoadingProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  children?: ReactNode;
  context?: ScreenContext<TScreens[TScreen]>;
  isLoading: true;
  screen: TScreen;
}

interface ScreenMatchReadyProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  children?: ReactNode;
  context: ScreenContext<TScreens[TScreen]>;
  isLoading?: false;
  screen: TScreen;
}

export type ScreenMatchProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> =
  TScreen extends ScreenName<TScreens>
    ? ScreenMatchLoadingProps<TScreens, TScreen> | ScreenMatchReadyProps<TScreens, TScreen>
    : never;

export function createScreenMatch<TScreens extends Record<string, ScreenDefinition>>(
  store: TailorKitStore,
) {
  return function ScreenMatch<TScreen extends ScreenName<TScreens>>({
    children,
    context,
    isLoading = false,
    screen,
  }: ScreenMatchProps<TScreens, TScreen>): ReactNode {
    useTailorRootContext("tailor.ScreenMatch");
    const id = useMemo(() => Symbol("tailorkit-screen-match"), []);
    const parent = useContext(ScreenMatchContext);
    const depth = parent.depth + 1;

    useEffect(() => {
      store.registerMatch({
        context,
        depth,
        id,
        isLoading,
        parentId: parent.id,
        screen,
      });

      return () => {
        store.unregisterMatch(id);
      };
    }, [context, depth, id, isLoading, parent.id, screen]);

    return (
      <ScreenMatchContext.Provider value={{ depth, id }}>{children}</ScreenMatchContext.Provider>
    );
  };
}
