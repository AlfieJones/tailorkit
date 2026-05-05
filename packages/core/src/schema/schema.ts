import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { TailorKitSchemaSpec } from "../spec";

export type Schema = StandardSchemaV1;
export type CallbackMap = Record<string, CallbackDefinition | undefined>;

type EmptyObject = Record<string, never>;
type VoidResult = ReturnType<() => void>;

type InferSchema<TSchema> = TSchema extends Schema
  ? StandardSchemaV1.InferOutput<TSchema>
  : EmptyObject;

type InferCallbackInputTuple<TInput extends readonly unknown[]> = {
  [K in keyof TInput]: TInput[K] extends Schema ? StandardSchemaV1.InferOutput<TInput[K]> : never;
};

type InferCallbackInput<TCallback> = TCallback extends {
  input?: infer TInput;
}
  ? TInput extends readonly Schema[]
    ? InferCallbackInputTuple<TInput>
    : never
  : never;

type InferCallbackOutput<TCallback> = TCallback extends { output?: infer TOutput }
  ? TOutput extends Schema
    ? StandardSchemaV1.InferOutput<TOutput>
    : VoidResult
  : VoidResult;

type CallbackReturn<TCallback> = TCallback extends { async: true }
  ? Promise<InferCallbackOutput<TCallback>>
  : InferCallbackOutput<TCallback>;

export type InferCallback<TCallback> =
  InferCallbackInput<TCallback> extends never
    ? () => CallbackReturn<TCallback>
    : (...args: InferCallbackInput<TCallback>) => CallbackReturn<TCallback>;

export type InferCallbacks<TCallbacks> =
  TCallbacks extends Record<string, unknown>
    ? {
        [TKey in keyof TCallbacks as TCallbacks[TKey] extends undefined
          ? never
          : TKey]: InferCallback<NonNullable<TCallbacks[TKey]>>;
      }
    : EmptyObject;

export type MergeProps<TBase, TOverride> = Omit<TBase, keyof TOverride> & TOverride;

export interface CallbackDefinition<
  TInput extends readonly Schema[] | undefined = readonly Schema[] | undefined,
  TOutput extends Schema | undefined = Schema | undefined,
  TAsync extends boolean | undefined = boolean | undefined,
> {
  async?: TAsync;
  input?: TInput;
  output?: TOutput;
}

export interface ComponentDefinition<
  TFields extends Schema | undefined = Schema | undefined,
  TCallbacks extends CallbackMap = CallbackMap,
  TSlots extends readonly string[] | undefined = readonly string[] | undefined,
> {
  callbacks?: TCallbacks;
  fields?: TFields;
  slots?: TSlots;
}

export interface ScreenDefinition<TContext extends Schema = Schema> {
  context: TContext;
}

export type ComponentProps<TComponent> =
  TComponent extends ComponentDefinition<
    infer TFields,
    infer TCallbacks,
    readonly string[] | undefined
  >
    ? MergeProps<InferSchema<TFields>, InferCallbacks<TCallbacks>>
    : EmptyObject;

export type ComponentSlots<TComponent> =
  TComponent extends ComponentDefinition<Schema | undefined, CallbackMap, infer TSlots>
    ? TSlots extends readonly string[]
      ? Record<TSlots[number], unknown>
      : EmptyObject
    : EmptyObject;

export interface ResolvedComponentMetadata {
  callbacks: CallbackMap;
  fields?: Schema;
  slots: readonly string[];
}

export interface ResolvedScreenMetadata {
  context: Schema;
}

export type SchemaSerializer = (schema: Schema) => Record<string, unknown> | undefined;

export interface TailorKitSchema<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
> {
  $internal: {
    components: {
      [TName in keyof TComponents]: ResolvedComponentMetadata;
    };
    screens: {
      [TName in keyof TScreens]: ResolvedScreenMetadata;
    };
  };
  components: TComponents;
  screens: TScreens;
  serialize(schemaSerializer?: SchemaSerializer): TailorKitSchemaSpec;
}

type FieldCallbackConflictKeys<TFields, TCallbacks> = Extract<
  string extends keyof InferSchema<TFields>
    ? never
    : Extract<keyof InferSchema<TFields>, keyof TCallbacks>,
  string
>;

type NoFieldCallbackConflicts<TFields, TCallbacks> =
  FieldCallbackConflictKeys<TFields, TCallbacks> extends never
    ? unknown
    : {
        readonly __tailorkit_error__: `Field and callback keys must be unique. Conflicting key: ${FieldCallbackConflictKeys<TFields, TCallbacks>}`;
      };

const getObjectKeys = (value: unknown): string[] => {
  if (!(value && typeof value === "object")) {
    return [];
  }

  if ("shape" in value) {
    const shape = (value as { shape?: unknown }).shape;
    if (shape && typeof shape === "object") {
      return Object.keys(shape);
    }
  }

  if ("entries" in value) {
    const entries = (value as { entries?: unknown }).entries;
    if (entries && typeof entries === "object") {
      return Object.keys(entries);
    }
  }

  return [];
};

const assertNoLocalFieldCallbackConflicts = (
  componentName: string,
  fieldKeys: readonly string[],
  callbackKeys: readonly string[],
): void => {
  const callbackKeySet = new Set(callbackKeys);
  for (const fieldKey of fieldKeys) {
    if (callbackKeySet.has(fieldKey)) {
      throw new Error(
        `Component "${componentName}" defines both a field and callback named "${fieldKey}". Use distinct names for serializable fields and function callbacks.`,
      );
    }
  }
};

export function component<
  const TFields extends Schema | undefined = undefined,
  const TCallbacks extends CallbackMap = Record<string, never>,
  const TSlots extends readonly string[] | undefined = undefined,
>(
  definition: {
    callbacks?: TCallbacks;
    fields?: TFields;
    slots?: TSlots;
  } & NoFieldCallbackConflicts<TFields, TCallbacks>,
): ComponentDefinition<TFields, TCallbacks, TSlots> {
  return definition;
}

export function screen<const TContext extends Schema>(
  definition: ScreenDefinition<TContext>,
): ScreenDefinition<TContext> {
  return definition;
}

const resolveComponentMetadata = (
  name: string,
  definition: ComponentDefinition,
): ResolvedComponentMetadata => {
  const fieldKeys = definition.fields ? getObjectKeys(definition.fields) : [];
  const callbackKeys = Object.keys(definition.callbacks ?? {});
  assertNoLocalFieldCallbackConflicts(name, fieldKeys, callbackKeys);

  return {
    callbacks: definition.callbacks ?? {},
    fields: definition.fields,
    slots: [...(definition.slots ?? [])],
  };
};

export function defineSchema<
  const TComponents extends Record<string, ComponentDefinition>,
  const TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
>(schema: {
  components: TComponents;
  screens?: TScreens;
}): TailorKitSchema<TComponents, TScreens> {
  const components = {} as TailorKitSchema<TComponents, TScreens>["$internal"]["components"];
  const screens = {} as TailorKitSchema<TComponents, TScreens>["$internal"]["screens"];

  for (const [name, definition] of Object.entries(schema.components)) {
    components[name as keyof TComponents] = resolveComponentMetadata(name, definition);
  }

  for (const [name, definition] of Object.entries(schema.screens ?? {})) {
    screens[name as keyof TScreens] = { context: definition.context };
  }

  const serialize = (schemaSerializer?: SchemaSerializer): TailorKitSchemaSpec => {
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
          input:
            callback.input === undefined || schemaSerializer === undefined
              ? undefined
              : callback.input
                  .map(schemaSerializer)
                  .filter((entry): entry is Record<string, unknown> => entry !== undefined),
          output:
            callback.output === undefined || schemaSerializer === undefined
              ? undefined
              : schemaSerializer(callback.output),
        };
      }

      serializedComponents[name] = {
        callbacks,
        fields:
          metadata.fields === undefined || schemaSerializer === undefined
            ? undefined
            : schemaSerializer(metadata.fields),
        slots: [...metadata.slots],
      };
    }

    for (const [name, metadata] of Object.entries(screens)) {
      serializedScreens[name] = {
        context:
          schemaSerializer === undefined ? undefined : schemaSerializer(metadata.context),
      };
    }

    return {
      components: serializedComponents,
      screens: serializedScreens,
      version: 1,
    };
  };

  return {
    components: schema.components,
    screens: (schema.screens ?? {}) as TScreens,
    serialize,
    $internal: { components, screens },
  };
}
