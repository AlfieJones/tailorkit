import { useStableContext } from "./use-stable-context";
import { useEffect, useMemo } from "react";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { ViewDefinition } from "@tailorkit/core/schema";
import type { RegisteredViews } from "../tailor-kit";
import { useTailorRootContext } from "../components/context";

export type ViewName<TViews extends Record<string, ViewDefinition>> = keyof TViews & string;

export type ViewContext<TView> =
  TView extends ViewDefinition<infer TContext>
    ? TContext extends StandardJSONSchemaV1
      ? StandardJSONSchemaV1.InferOutput<TContext>
      : Record<string, never>
    : never;

interface ReadyViewOptions<
  TViews extends Record<string, ViewDefinition>,
  TView extends ViewName<TViews>,
> {
  context: ViewContext<TViews[TView]>;
  view: TView;
  status?: "ready";
}

interface LoadingViewOptions<TView extends string> {
  context?: never;
  view: TView;
  status: "loading";
}

interface ErrorViewOptions<TView extends string> {
  context?: never;
  view: TView;
  status: "error";
}

export type ViewOptions<
  TViews extends Record<string, ViewDefinition> = RegisteredViews,
  TView extends ViewName<TViews> = ViewName<TViews>,
> =
  TView extends ViewName<TViews>
    ? ReadyViewOptions<TViews, TView> | LoadingViewOptions<TView> | ErrorViewOptions<TView>
    : never;

export type ViewState<
  TViews extends Record<string, ViewDefinition> = RegisteredViews,
  TView extends ViewName<TViews> = ViewName<TViews>,
> =
  | Omit<ReadyViewOptions<TViews, TView>, "view">
  | Omit<LoadingViewOptions<TView>, "view">
  | Omit<ErrorViewOptions<TView>, "view">;

export function useView<TView extends ViewName<RegisteredViews>>(
  view: TView,
  options: ViewState<RegisteredViews, NoInfer<TView>>,
): void {
  const { store } = useTailorRootContext("useView");
  const id = useMemo(() => Symbol("tailorkit-current-view"), []);
  const status = options.status ?? "ready";
  const context = "context" in options ? options.context : undefined;
  const contextSnapshot = useStableContext(context);

  useEffect(
    () => () => {
      store.views.unregister(id);
    },
    [id, store],
  );

  useEffect(() => {
    store.views.register({
      context: contextSnapshot,
      id,
      view,
      status,
    });
  }, [contextSnapshot, id, view, status, store]);
}
