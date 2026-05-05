import type { ReactNode } from "react";
import type {
  ComponentDefinition,
  ComponentProps,
  ComponentSlots,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import type { RemoteCallbackDefinition, RemoteCallbackDefinitions } from "./render-utils";
import { createUseRemoteUI } from "./use-remote-ui";
import type { UseRemoteUIOptions, UseRemoteUIResult } from "./use-remote-ui";

type ComponentRenderer<TComponent extends ComponentDefinition> = (args: {
  props: ComponentProps<TComponent>;
  slots: ComponentSlots<TComponent>;
}) => ReactNode;

type ComponentRenderers<TComponents extends Record<string, ComponentDefinition>> = {
  [TName in keyof TComponents]?: ComponentRenderer<TComponents[TName]>;
};

export interface TailorKitInstance<TComponents extends Record<string, ComponentDefinition>> {
  useRemoteUI: (options: UseRemoteUIOptions) => UseRemoteUIResult;
  schema: TailorKitSchema<TComponents>;
}

export function tailorKit<TComponents extends Record<string, ComponentDefinition>>(
  schema: TailorKitSchema<TComponents>,
  options: { components?: ComponentRenderers<TComponents> } = {},
): TailorKitInstance<TComponents> {
  // Derive callback definitions from schema for automatic validation
  const callbackDefinitions: RemoteCallbackDefinitions = {};
  for (const [componentName, metadata] of Object.entries(schema.$internal.components)) {
    const defs: Record<string, RemoteCallbackDefinition | undefined> = {};
    for (const [cbName, cb] of Object.entries(metadata.callbacks)) {
      if (cb !== undefined) {
        defs[cbName] = { input: cb.input, output: cb.output };
      }
    }
    callbackDefinitions[componentName] = defs;
  }

  // Wrap each component renderer so it receives { props, slots } and returns ReactNode.
  // The raw remote component receives props directly including a `slots` key.
  const wrappedComponents: Record<string, unknown> = {};
  for (const [name, renderer] of Object.entries(options.components ?? {})) {
    if (renderer) {
      wrappedComponents[name] = function TailorKitComponent({
        slots,
        ...rest
      }: Record<string, unknown>) {
        return (renderer as ComponentRenderer<ComponentDefinition>)({
          props: rest as ComponentProps<ComponentDefinition>,
          slots: (slots ?? {}) as ComponentSlots<ComponentDefinition>,
        });
      };
    }
  }

  const useRemoteUI = createUseRemoteUI(wrappedComponents, callbackDefinitions);

  return { schema, useRemoteUI };
}
