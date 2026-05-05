import type { ReactNode } from "react";
import type {
  ComponentDefinition,
  ComponentProps,
  ComponentSlots,
  ScreenDefinition,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import { createUseRemoteUI } from "./use-remote-ui";
import type { UseRemoteUIOptions, UseRemoteUIResult } from "./use-remote-ui";

type ComponentRenderer<TComponent extends ComponentDefinition> = (args: {
  props: ComponentProps<TComponent>;
  slots: ComponentSlots<TComponent>;
}) => ReactNode;

type ComponentRenderers<TComponents extends Record<string, ComponentDefinition>> = {
  [TName in keyof TComponents]?: ComponentRenderer<TComponents[TName]>;
};

const componentTagPrefix = "tailorkit-";

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/[\s_]+/g, "-")
    .toLowerCase()}`;

export interface TailorKitInstance<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
> {
  schema: TailorKitSchema<TComponents, TScreens>;
  useRemoteUI: (options: UseRemoteUIOptions) => UseRemoteUIResult;
}

export function tailorKit<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
>(
  schema: TailorKitSchema<TComponents, TScreens>,
  options: { components?: ComponentRenderers<TComponents> } = {},
): TailorKitInstance<TComponents, TScreens> {
  const wrappedComponents: Record<string, unknown> = {};

  for (const [name, renderer] of Object.entries(options.components ?? {})) {
    if (renderer) {
      const TailorKitComponent = function TailorKitComponent({
        children,
        ...props
      }: Record<string, unknown> & { children?: ReactNode }) {
        return (renderer as ComponentRenderer<ComponentDefinition>)({
          props: props as ComponentProps<ComponentDefinition>,
          slots: { default: children } as ComponentSlots<ComponentDefinition>,
        });
      };
      wrappedComponents[name] = TailorKitComponent;
      wrappedComponents[toComponentTagName(name)] = TailorKitComponent;
    }
  }

  return { schema, useRemoteUI: createUseRemoteUI(wrappedComponents) };
}
