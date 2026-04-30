import type {
  ComponentDefinition,
  ComponentPreset,
  ComponentProps,
  MergeProps,
  TailorKitSchema,
} from "@tailorkit/sdk";
import type { ReactNode } from "react";

import type { ReactNativeEventProps } from "./events";

type EmptyObject = Record<string, never>;

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type PresetNativeEvents<TPreset> =
  TPreset extends ComponentPreset<infer _TFields, infer _TCallbacks, infer TNativeEvents>
    ? TNativeEvents
    : EmptyObject;

type ComponentNativeEvents<TComponent> =
  TComponent extends ComponentDefinition<
    infer TExtends,
    infer _TFields,
    infer _TCallbacks,
    readonly string[] | undefined
  >
    ? TExtends extends readonly unknown[]
      ? UnionToIntersection<PresetNativeEvents<TExtends[number]>>
      : EmptyObject
    : EmptyObject;

export type ReactComponentProps<TComponent> = MergeProps<
  ReactNativeEventProps<ComponentNativeEvents<TComponent>, keyof ComponentProps<TComponent>>,
  ComponentProps<TComponent>
>;

export type ReactComponentSlots<TComponent> =
  TComponent extends ComponentDefinition<
    readonly ComponentPreset[] | undefined,
    infer _TFields,
    infer _TCallbacks,
    infer TSlots
  >
    ? TSlots extends readonly string[]
      ? Record<TSlots[number], ReactNode>
      : EmptyObject
    : EmptyObject;

export interface ReactRenderInput<TComponent> {
  props: ReactComponentProps<TComponent>;
  slots: ReactComponentSlots<TComponent>;
}

export type ReactComponentRenderer<TComponent> = (input: ReactRenderInput<TComponent>) => ReactNode;

export type ReactComponentMap<
  TSchema extends TailorKitSchema<Record<string, ComponentDefinition>>,
> = {
  [TName in keyof TSchema["components"]]: ReactComponentRenderer<TSchema["components"][TName]>;
};

/**
 * Binds a server-safe TailorKit schema to React render implementations.
 * Renderers receive merged React-ready `props` and declared `slots`.
 */
export function defineReactComponents<
  const TSchema extends TailorKitSchema<Record<string, ComponentDefinition>>,
  const TComponents extends ReactComponentMap<TSchema>,
>(schema: TSchema, components: TComponents): TComponents {
  void schema;
  return components;
}
