import type { TailorKitSchemaSpec } from "../spec/index";
import type { ActionTree, NoMixedActionContexts } from "./actions";
import { serializeActions } from "./actions";
import type {
  ComponentDefinitions,
  NoComponentFieldCallbackConflicts,
  ResolvedComponentMetadata,
} from "./components";
import { resolveComponentMetadata } from "./components";
import type { ResolvedScopeMetadata, ScopeContextHierarchy, ScopeDefinitions } from "./scopes";
import { jsonSchemaSerializer, serializeSchema } from "./shared";
import type { SchemaSerializer } from "./shared";

type EmptyActionMap = Record<never, never>;

export interface TailorKitSchema<
  TComponents extends Record<string, unknown> = ComponentDefinitions,
  TScreens extends Record<string, unknown> = ScopeDefinitions,
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
    scopes: {
      [TName in keyof TScreens]: ResolvedScopeMetadata;
    };
  };
  viewports: Record<string, Record<string, never>>;
  actions: TActions;
  components: TComponents;
  scopes: TScreens;
  serialize(schemaSerializer?: SchemaSerializer): TailorKitSchemaSpec;
}

export const createTailorKitSchema = <
  const TComponents extends Record<string, unknown>,
  const TScreens extends Record<string, unknown> = Record<string, never>,
  const TActions extends ActionTree = EmptyActionMap,
>(schema: {
  viewports?: Record<string, Record<string, never>>;
  actions?: TActions & NoMixedActionContexts<NoInfer<TActions>>;
  components: TComponents & NoComponentFieldCallbackConflicts<NoInfer<TComponents>>;
  scopes?: TScreens & ScopeContextHierarchy<NoInfer<TScreens>>;
}): TailorKitSchema<TComponents, TScreens, TActions> => {
  const components = {} as TailorKitSchema<
    TComponents,
    TScreens,
    TActions
  >["$internal"]["components"];
  const scopes = {} as TailorKitSchema<TComponents, TScreens, TActions>["$internal"]["scopes"];

  for (const [name, definition] of Object.entries(schema.components as ComponentDefinitions)) {
    components[name as keyof TComponents] = resolveComponentMetadata(name, definition);
  }

  for (const [name, definition] of Object.entries((schema.scopes ?? {}) as ScopeDefinitions)) {
    scopes[name as keyof TScreens] = { context: definition.context };
  }

  const serialize = (
    schemaSerializer: SchemaSerializer = jsonSchemaSerializer,
  ): TailorKitSchemaSpec => {
    const serializedComponents: TailorKitSchemaSpec["components"] = {};
    const serializedScreens: TailorKitSchemaSpec["scopes"] = {};

    for (const [name, metadata] of Object.entries(components)) {
      const callbacks: TailorKitSchemaSpec["components"][string]["callbacks"] = {};
      for (const [callbackName, callback] of Object.entries(metadata.callbacks)) {
        if (callback === undefined) {
          continue;
        }
        callbacks[callbackName] = {
          async: callback.async,
          input: serializeSchema(callback.input, schemaSerializer),
          output: serializeSchema(callback.output, schemaSerializer),
        };
      }

      serializedComponents[name] = {
        callbacks,
        fields: serializeSchema(metadata.fields, schemaSerializer),
        children: metadata.children,
      };
    }

    for (const [name, metadata] of Object.entries(scopes)) {
      serializedScreens[name] = {
        context: serializeSchema(metadata.context, schemaSerializer),
      };
    }

    return {
      actions: serializeActions(schema.actions ?? {}, schemaSerializer),
      components: serializedComponents,
      scopes: serializedScreens,
      viewports: schema.viewports ?? {},
      version: 1,
    };
  };

  return {
    viewports: schema.viewports ?? {},
    actions: (schema.actions ?? {}) as TActions,
    components: schema.components,
    scopes: (schema.scopes ?? {}) as TScreens,
    serialize,
    $internal: {
      actions: (schema.actions ?? {}) as TActions,
      components,
      scopes,
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
  type Fields,
  type NoComponentFieldCallbackConflicts,
  type ResolvedComponentMetadata,
} from "./components";
export {
  type ResolvedScopeMetadata,
  type Scope,
  type ScopeContextHierarchy,
  type ScopeDefinition,
  type ScopeDefinitions,
  type Scopes,
} from "./scopes";
export { jsonSchemaSerializer, type Schema, type SchemaSerializer } from "./shared";
export type { TailorKitSchema as TailorKit };
