import type { TailorKitSchemaSpec } from "../spec";
import type { ActionTree, NoMixedActionContexts } from "./actions";
import { serializeActions } from "./actions";
import type {
  ComponentDefinitions,
  NoComponentFieldCallbackConflicts,
  ResolvedComponentMetadata,
} from "./components";
import { resolveComponentMetadata } from "./components";
import type { ResolvedScreenMetadata, ScreenDefinitions } from "./screens";
import { jsonSchemaSerializer, serializeSchema, serializeSchemaTuple } from "./shared";
import type { SchemaSerializer } from "./shared";

type EmptyActionMap = Record<never, never>;

export interface TailorKitSchema<
  TComponents extends Record<string, unknown> = ComponentDefinitions,
  TScreens extends Record<string, unknown> = ScreenDefinitions,
  TActions extends ActionTree = EmptyActionMap,
> {
  /**
   * Internal TailorKit implementation details.
   *
   * This API is not covered by semantic versioning and may change or break at
   * any time. Avoid depending on it in application code. If you need something
   * exposed here, please open a GitHub issue explaining what you are trying to
   * build so we can design a stable public API for that use case.
   *
   * @internal
   */
  $internal: {
    actions: TActions;
    components: {
      [TName in keyof TComponents]: ResolvedComponentMetadata;
    };
    screens: {
      [TName in keyof TScreens]: ResolvedScreenMetadata;
    };
  };
  actions: TActions;
  components: TComponents;
  screens: TScreens;
  serialize(schemaSerializer?: SchemaSerializer): TailorKitSchemaSpec;
}

export const createTailorKitSchema = <
  const TComponents extends Record<string, unknown>,
  const TScreens extends Record<string, unknown> = Record<string, never>,
  const TActions extends ActionTree = EmptyActionMap,
>(schema: {
  actions?: TActions & NoMixedActionContexts<NoInfer<TActions>>;
  components: TComponents & NoComponentFieldCallbackConflicts<NoInfer<TComponents>>;
  screens?: TScreens;
}): TailorKitSchema<TComponents, TScreens, TActions> => {
  const components = {} as TailorKitSchema<
    TComponents,
    TScreens,
    TActions
  >["$internal"]["components"];
  const screens = {} as TailorKitSchema<TComponents, TScreens, TActions>["$internal"]["screens"];

  for (const [name, definition] of Object.entries(schema.components as ComponentDefinitions)) {
    components[name as keyof TComponents] = resolveComponentMetadata(name, definition);
  }

  for (const [name, definition] of Object.entries((schema.screens ?? {}) as ScreenDefinitions)) {
    screens[name as keyof TScreens] = { context: definition.context };
  }

  const serialize = (
    schemaSerializer: SchemaSerializer = jsonSchemaSerializer,
  ): TailorKitSchemaSpec => {
    const serializedComponents: TailorKitSchemaSpec["components"] = {};
    const serializedScreens: TailorKitSchemaSpec["screens"] = {};

    for (const [name, metadata] of Object.entries(components)) {
      const callbacks: TailorKitSchemaSpec["components"][string]["callbacks"] = {};
      for (const [callbackName, callback] of Object.entries(metadata.callbacks)) {
        if (callback === undefined) {
          continue;
        }
        callbacks[callbackName] = {
          async: callback.async,
          input: serializeSchemaTuple(callback.input, schemaSerializer),
          output: serializeSchema(callback.output, schemaSerializer),
        };
      }

      serializedComponents[name] = {
        callbacks,
        fields: serializeSchema(metadata.fields, schemaSerializer),
        slots: [...metadata.slots],
      };
    }

    for (const [name, metadata] of Object.entries(screens)) {
      serializedScreens[name] = {
        context: serializeSchema(metadata.context, schemaSerializer),
      };
    }

    return {
      actions: serializeActions(schema.actions ?? {}, schemaSerializer),
      components: serializedComponents,
      screens: serializedScreens,
      version: 1,
    };
  };

  return {
    actions: (schema.actions ?? {}) as TActions,
    components: schema.components,
    screens: (schema.screens ?? {}) as TScreens,
    serialize,
    $internal: {
      actions: (schema.actions ?? {}) as TActions,
      components,
      screens,
    },
  };
};

export type { TailorKitTheme } from "../primitives/theme";
export {
  createActions,
  type Action,
  type ActionDefinition,
  type ActionDefinitions,
  type ActionHandler,
  type Actions,
  type ActionTree,
  type HandlerArgs,
  type ImplementedAction,
  type InferActionInput,
  type InferActionOutput,
  type InferActionTreeContext,
  type NoMixedActionContexts,
  type ResolveActionTreeContext,
} from "./actions";
export {
  type Callback,
  type CallbackDefinition,
  type CallbackMap,
  type Callbacks,
  type InferCallback,
  type InferCallbacks,
} from "./callbacks";
export {
  type Component,
  type ComponentDefinition,
  type ComponentDefinitions,
  type ComponentProps,
  type Components,
  type ComponentSlots,
  type Fields,
  type NoComponentFieldCallbackConflicts,
  type ResolvedComponentMetadata,
  type Slots,
} from "./components";
export {
  type ResolvedScreenMetadata,
  type Screen,
  type ScreenDefinition,
  type ScreenDefinitions,
  type Screens,
} from "./screens";
export { jsonSchemaSerializer, type Schema, type SchemaSerializer } from "./shared";
export type { TailorKitSchema as TailorKit };
