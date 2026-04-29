import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { ReactNode } from "react";

type PropsSchema = StandardSchemaV1;
type EmptyProps = Record<string, never>;
type CallbackSchema = StandardSchemaV1;
type CallbackMap = Record<string, TailorKitCallback>;

type InferSchemaOutput<TSchema> = TSchema extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<TSchema>
  : EmptyProps;

type InferCallbackOutput<TCallback> =
  TCallback extends TailorKitCallback<CallbackSchema | undefined, infer TOutput>
    ? TOutput extends CallbackSchema
      ? StandardSchemaV1.InferOutput<TOutput>
      : undefined
    : never;

type InferCallbackInput<TCallback> =
  TCallback extends TailorKitCallback<infer TInput>
    ? TInput extends CallbackSchema
      ? StandardSchemaV1.InferOutput<TInput>
      : never
    : never;

type InferCallback<TCallback> =
  TCallback extends TailorKitCallback<infer TInput>
    ? TInput extends CallbackSchema
      ? TCallback extends TailorKitCallback<CallbackSchema | undefined, infer TOutput>
        ? TOutput extends CallbackSchema
          ? (input: InferCallbackInput<TCallback>) => Promise<InferCallbackOutput<TCallback>>
          : (input: InferCallbackInput<TCallback>) => Promise<void>
        : never
      : TCallback extends TailorKitCallback<CallbackSchema | undefined, infer TOutput>
        ? TOutput extends CallbackSchema
          ? () => Promise<InferCallbackOutput<TCallback>>
          : () => Promise<void>
        : never
    : never;

type InferCallbacks<TCallbacks> = TCallbacks extends CallbackMap
  ? {
      [TKey in keyof TCallbacks]: InferCallback<TCallbacks[TKey]>;
    }
  : EmptyProps;

interface InferComponentProps<TProps, TChildren, TCallbacks> {
  callbacks: InferCallbacks<TCallbacks>;
  children: TChildren extends true ? ReactNode : undefined;
  props: InferSchemaOutput<TProps>;
}

export interface TailorKitCallback<
  TInput extends CallbackSchema | undefined = CallbackSchema | undefined,
  TOutput extends CallbackSchema | undefined = CallbackSchema | undefined,
> {
  input?: TInput;
  output?: TOutput;
}

export type TailorKitRenderProps<
  TProps extends PropsSchema | undefined = PropsSchema | undefined,
  TChildren extends boolean | undefined = boolean | undefined,
  TCallbacks extends CallbackMap | undefined = CallbackMap | undefined,
> = InferComponentProps<TProps, TChildren, TCallbacks>;

export interface TailorKitComponent<
  TProps extends PropsSchema | undefined = PropsSchema | undefined,
  TChildren extends boolean | undefined = boolean | undefined,
  TCallbacks extends CallbackMap | undefined = CallbackMap | undefined,
> {
  callbacks?: TCallbacks;
  children?: TChildren;
  props?: TProps;
  render: (props: TailorKitRenderProps<TProps, TChildren, TCallbacks>) => ReactNode;
}

type ComponentPropsMap = Record<string, PropsSchema | undefined>;
type ComponentChildrenMap<TKey extends PropertyKey> = Partial<Record<TKey, boolean | undefined>>;
type ComponentCallbacksMap<TKey extends PropertyKey> = Partial<
  Record<TKey, CallbackMap | undefined>
>;
interface ComponentShape {
  callbacks?: unknown;
  children?: unknown;
  props?: unknown;
}

type InferPropsSchema<TComponent> = TComponent extends { props: infer TProps }
  ? TProps extends PropsSchema
    ? TProps
    : never
  : undefined;

type InferChildrenFlag<TComponent> = TComponent extends { children: infer TChildren }
  ? TChildren extends boolean
    ? TChildren
    : never
  : undefined;

type InferComponentCallbacks<TComponent> = TComponent extends { callbacks: infer TCallbacks }
  ? TCallbacks extends CallbackMap
    ? TCallbacks
    : never
  : undefined;

type DefineComponent<TComponent extends ComponentShape> = TailorKitComponent<
  InferPropsSchema<TComponent>,
  InferChildrenFlag<TComponent>,
  InferComponentCallbacks<TComponent>
>;

type DefineComponents<TComponents extends Record<string, ComponentShape>> = {
  [TKey in keyof TComponents]: TComponents[TKey] & DefineComponent<TComponents[TKey]>;
};

export type TailorKitCallbackDefinitions = Record<
  string,
  Record<string, TailorKitCallback | undefined> | undefined
>;

export interface TailorKitConfig<
  TProps extends ComponentPropsMap = ComponentPropsMap,
  TChildren extends ComponentChildrenMap<keyof TProps> = ComponentChildrenMap<keyof TProps>,
  TCallbacks extends ComponentCallbacksMap<keyof TProps> = ComponentCallbacksMap<keyof TProps>,
> {
  callbackDefinitions: TailorKitCallbackDefinitions;
  components?: {
    [TKey in keyof TProps]: TailorKitComponent<
      TProps[TKey],
      TKey extends keyof TChildren ? TChildren[TKey] : undefined,
      TKey extends keyof TCallbacks ? TCallbacks[TKey] : undefined
    >;
  };
}

const extractCallbackDefinitions = (
  components: Record<string, ComponentShape> | undefined,
): TailorKitCallbackDefinitions => {
  const definitions: TailorKitCallbackDefinitions = {};
  for (const [name, component] of Object.entries(components ?? {})) {
    definitions[name] = component.callbacks as Record<string, TailorKitCallback | undefined>;
  }
  return definitions;
};

export function defineConfig<const TComponents extends Record<string, ComponentShape>>(config: {
  components: DefineComponents<TComponents>;
}): {
  callbackDefinitions: TailorKitCallbackDefinitions;
  components: DefineComponents<TComponents>;
};
export function defineConfig<
  const TProps extends ComponentPropsMap,
  const TChildren extends ComponentChildrenMap<keyof TProps>,
  const TCallbacks extends ComponentCallbacksMap<keyof TProps>,
>(
  config: Omit<TailorKitConfig<TProps, TChildren, TCallbacks>, "callbackDefinitions">,
): TailorKitConfig<TProps, TChildren, TCallbacks>;
export function defineConfig(
  config: Omit<TailorKitConfig, "callbackDefinitions">,
): TailorKitConfig {
  return {
    ...config,
    callbackDefinitions: extractCallbackDefinitions(
      config.components as Record<string, ComponentShape> | undefined,
    ),
  };
}
