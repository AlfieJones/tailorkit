import type {
  ActionDefinition,
  ActionTree,
  ComponentDefinition,
  InferActionInput,
  InferActionOutput,
  InferRequestContext,
  Schema,
  ScreenDefinition,
  TailorKitSchema,
} from "../schema";

type MaybePromise<T> = T | Promise<T>;

export type ActionHandler<TAction, TRequestContext> = (options: {
  input: InferActionInput<TAction>;
  requestContext: TRequestContext;
}) => MaybePromise<InferActionOutput<TAction>>;

export interface ImplementedAction<TAction, TRequestContext> {
  $tailorkitAction: true;
  definition: TAction;
  handler: ActionHandler<TAction, TRequestContext>;
}

interface ActionLeafBuilder<TAction, TRequestContext> {
  handler: (
    handler: ActionHandler<TAction, TRequestContext>,
  ) => ImplementedAction<TAction, TRequestContext>;
}

export type ImplementedActionRouter<TActions, TRequestContext> = {
  [TKey in keyof TActions]: TActions[TKey] extends ActionDefinition
    ? ImplementedAction<TActions[TKey], TRequestContext>
    : TActions[TKey] extends ActionTree
      ? ImplementedActionRouter<TActions[TKey], TRequestContext>
      : never;
};

export type ActionImplementer<TActions, TRequestContext> = {
  router: <TRouter extends ImplementedActionRouter<TActions, TRequestContext>>(
    router: TRouter,
  ) => TRouter;
} & {
  [TKey in keyof TActions]: TActions[TKey] extends ActionDefinition
    ? ActionLeafBuilder<TActions[TKey], TRequestContext>
    : TActions[TKey] extends ActionTree
      ? ActionImplementer<TActions[TKey], TRequestContext>
      : never;
};

export function implementActions<
  const TComponents extends Record<string, ComponentDefinition>,
  const TScreens extends Record<string, ScreenDefinition>,
  const TActions extends ActionTree,
  const TRequestContext extends Schema | undefined,
>(
  schema: TailorKitSchema<TComponents, TScreens, TActions, TRequestContext>,
): ActionImplementer<TActions, InferRequestContext<typeof schema>> {
  return createActionImplementer(schema.actions) as ActionImplementer<
    TActions,
    InferRequestContext<typeof schema>
  >;
}

const isActionDefinition = (value: unknown): value is ActionDefinition =>
  value !== null &&
  typeof value === "object" &&
  ("input" in value || "output" in value) &&
  !("$tailorkitAction" in value);

const createActionImplementer = (tree: ActionTree): unknown => {
  const implementer: Record<string, unknown> = {
    router: <TRouter>(router: TRouter): TRouter => router,
  };

  for (const [key, value] of Object.entries(tree)) {
    if (value === undefined) {
      continue;
    }

    if (isActionDefinition(value)) {
      implementer[key] = {
        handler: (handler: ActionHandler<typeof value, unknown>) => ({
          $tailorkitAction: true,
          definition: value,
          handler,
        }),
      };
    } else {
      implementer[key] = createActionImplementer(value);
    }
  }

  return implementer;
};

export const flattenActionRouter = (
  router: unknown,
  prefix: string[] = [],
): Map<string, ImplementedAction<ActionDefinition, unknown>> => {
  const actions = new Map<string, ImplementedAction<ActionDefinition, unknown>>();

  if (router === undefined || router === null || typeof router !== "object") {
    return actions;
  }

  for (const [key, value] of Object.entries(router)) {
    if (value && typeof value === "object" && "$tailorkitAction" in value) {
      actions.set(
        [...prefix, key].join("."),
        value as ImplementedAction<ActionDefinition, unknown>,
      );
      continue;
    }

    for (const [path, action] of flattenActionRouter(value, [...prefix, key])) {
      actions.set(path, action);
    }
  }

  return actions;
};
