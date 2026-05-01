import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SerializedTailorKitSchema } from "@tailorkit/spec";

export type Schema = StandardSchemaV1;
export type CallbackMap = Record<string, CallbackDefinition | undefined>;
export type NativeEventMap = Record<string, NativeEventDefinition | undefined>;
export type ScreenMap = Record<string, ScreenDefinition>;

type EmptyObject = Record<string, never>;
type VoidResult = ReturnType<() => void>;

type InferSchema<TSchema> = TSchema extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<TSchema>
  : EmptyObject;

type InferCallbackInputTuple<TInput extends readonly unknown[]> = {
  [K in keyof TInput]: TInput[K] extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TInput[K]>
    : never;
};

type InferCallbackInput<TCallback> = TCallback extends {
  input?: infer TInput;
}
  ? TInput extends readonly StandardSchemaV1[]
    ? InferCallbackInputTuple<TInput>
    : never
  : never;

type InferCallbackOutput<TCallback> = TCallback extends { output?: infer TOutput }
  ? TOutput extends StandardSchemaV1
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

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type PresetFields<TPreset> =
  TPreset extends ComponentPreset<infer TFields, CallbackMap, NativeEventMap>
    ? InferSchema<TFields>
    : EmptyObject;

type PresetTupleFields<TExtends> = TExtends extends readonly unknown[]
  ? UnionToIntersection<PresetFields<TExtends[number]>>
  : EmptyObject;

export type MergeProps<TBase, TOverride> = Omit<TBase, keyof TOverride> & TOverride;

/**
 * Describes a component-local function prop. Schemas describe serialized input
 * and output values; `async: true` marks a Promise-returning function.
 */
export interface CallbackDefinition<
  TInput extends readonly Schema[] | undefined = readonly Schema[] | undefined,
  TOutput extends Schema | undefined = Schema | undefined,
  TAsync extends boolean | undefined = boolean | undefined,
> {
  /** Serializable callback inputs as positional args. Omit for a zero-argument callback. */
  input?: TInput;
  /** Serializable callback output. Omit for `void`. */
  output?: TOutput;
  /** When true, the component receives a Promise-returning function. */
  async?: TAsync;
}

/**
 * Framework-neutral metadata for a native event exposed by a preset.
 * `name` is TailorKit's canonical event name; framework prop mapping belongs
 * in framework adapters such as `@tailorkit/react`.
 */
export interface NativeEventDefinition<
  TInput extends readonly Schema[] | undefined = readonly Schema[] | undefined,
> extends CallbackDefinition<TInput, undefined, false> {
  /** The DOM element type that emits this event (e.g. `"input"`, `"button"`). */
  element: string;
  /** The native event name as it appears on the DOM element (e.g. `"change"`, `"click"`). */
  name: string;
}

/**
 * A reusable component contract that can contribute serializable fields,
 * callbacks, and native event adapter metadata.
 */
export interface ComponentPreset<
  TFields extends Schema | undefined = Schema | undefined,
  TCallbacks extends CallbackMap = CallbackMap,
  TNativeEvents extends NativeEventMap = NativeEventMap,
> {
  /** Function props contributed by this preset, merged into any component that extends it. */
  callbacks?: TCallbacks;
  /**
   * Explicit list of field keys when TailorKit cannot infer them from `fields` at runtime.
   * Required for schema libraries whose object shape is not stored under a `shape` or `entries` key.
   */
  fieldKeys?: readonly string[];
  /** Serializable value props contributed by this preset. */
  fields?: TFields;
  /** Native DOM event bindings contributed by this preset. */
  nativeEvents?: TNativeEvents;
}

/**
 * Defines a server-safe component contract. Use `fields` for serializable
 * values, `callbacks` for function props, and `slots` for render regions.
 */
export interface ComponentDefinition<
  TExtends extends readonly ComponentPreset[] | undefined = readonly ComponentPreset[] | undefined,
  TFields extends Schema | undefined = Schema | undefined,
  TCallbacks extends CallbackMap = CallbackMap,
  TSlots extends readonly string[] | undefined = readonly string[] | undefined,
> {
  /** Presets to merge before local fields and callbacks. */
  extends?: TExtends;
  /** Serializable value props for this component. */
  fields?: TFields;
  /** Component-local function props. */
  callbacks?: TCallbacks;
  /** Named render regions. Use `["default"]` for the default child region. */
  slots?: TSlots;
}

/**
 * Describes a screen route and its serializable context shape.
 */
export interface ScreenDefinition<TContext extends Schema = Schema> {
  /** Serializable context available to this screen. */
  context: TContext;
}

export type ComponentProps<TComponent> =
  TComponent extends ComponentDefinition<
    infer TExtends,
    infer TFields,
    infer TCallbacks,
    readonly string[] | undefined
  >
    ? MergeProps<
        PresetTupleFields<TExtends>,
        MergeProps<InferSchema<TFields>, InferCallbacks<TCallbacks>>
      >
    : EmptyObject;

export type ComponentSlots<TComponent> =
  TComponent extends ComponentDefinition<
    readonly ComponentPreset[] | undefined,
    Schema | undefined,
    CallbackMap,
    infer TSlots
  >
    ? TSlots extends readonly string[]
      ? Record<TSlots[number], unknown>
      : EmptyObject
    : EmptyObject;

/**
 * Unstable adapter metadata. Do not read or construct this from application
 * code; TailorKit may change it without a breaking-change guarantee.
 *
 * @internal
 */
export interface ResolvedComponentMetadata {
  callbacks: CallbackMap;
  fieldKeys: readonly string[];
  fields: readonly Schema[];
  nativeEvents: NativeEventMap;
  overriddenNativeFieldKeys: readonly string[];
  slots: readonly string[];
}

/**
 * Converts a StandardSchema instance to a JSON Schema object for wire
 * serialization. Pass a validator-specific implementation when calling
 * `schema.serialize()`. For Zod v4, use `(s) => z.toJsonSchema(s)`.
 *
 * Returning `undefined` omits the schema from the serialized output, which
 * is useful when the schema type is not supported by the serializer.
 */
export type SchemaSerializer = (schema: Schema) => Record<string, unknown> | undefined;

export interface TailorKitSchema<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends ScreenMap = ScreenMap,
  TDefaultContext extends Schema | undefined = Schema | undefined,
> {
  /** Map of component name to its definition, as passed to `defineSchema`. */
  components: TComponents;
  /** Optional default context shape shared across screens. */
  defaultContext?: TDefaultContext;
  /** Map of screen path patterns to their context definitions. */
  screens: TScreens;
  /**
   * Produces a wire-safe, JSON-serializable representation of this schema.
   * The output validates against the `TailorKitSchemaSpec` from `@tailorkit/spec`.
   *
   * @param schemaSerializer - Optional converter from StandardSchema to JSON
   * Schema. Without it, `input`/`output`/`fields` shapes are omitted from
   * callbacks and native events — only structural metadata is included.
   */
  serialize(schemaSerializer?: SchemaSerializer): SerializedTailorKitSchema;
  /**
   * Unstable runtime data for TailorKit adapters and tooling. This is
   * intentionally isolated from the public schema contract.
   *
   * @internal
   */
  $internal: {
    metadata: {
      components: {
        [TName in keyof TComponents]: ResolvedComponentMetadata;
      };
    };
  };
}

type FieldCallbackConflictKeys<TFields, TCallbacks> = Extract<
  Extract<keyof InferSchema<TFields>, keyof TCallbacks>,
  string
>;

type NoFieldCallbackConflicts<TFields, TCallbacks> =
  FieldCallbackConflictKeys<TFields, TCallbacks> extends never
    ? unknown
    : {
        readonly __tailorkit_error__: `Field and callback keys must be unique. Conflicting key: ${FieldCallbackConflictKeys<TFields, TCallbacks>}`;
      };

type ScreenDefinitionExtraKeys<TScreens> =
  TScreens extends Record<string, unknown>
    ? {
        [TPath in keyof TScreens]: Extract<Exclude<keyof TScreens[TPath], "context">, string>;
      }[keyof TScreens]
    : never;

type NoExtraScreenDefinitionKeys<TScreens> =
  ScreenDefinitionExtraKeys<TScreens> extends never
    ? unknown
    : {
        readonly __tailorkit_error__: `Screen definitions can only include "context". Invalid key: ${ScreenDefinitionExtraKeys<TScreens>}`;
      };

/**
 * Creates a component definition while preserving literal types for inference.
 *
 * @param definition - The component contract to define. See {@link ComponentDefinition} for
 * accepted properties.
 */
export function component<
  const TExtends extends readonly ComponentPreset[] | undefined = undefined,
  const TFields extends Schema | undefined = undefined,
  const TCallbacks extends CallbackMap = Record<string, never>,
  const TSlots extends readonly string[] | undefined = undefined,
>(
  definition: {
    /** Presets to merge before local fields and callbacks. */
    extends?: TExtends;
    /** Serializable value props for this component. */
    fields?: TFields;
    /** Component-local function props. */
    callbacks?: TCallbacks;
    /** Named render regions. Use `["default"]` for the default child region. */
    slots?: TSlots;
  } & NoFieldCallbackConflicts<TFields, TCallbacks>,
): ComponentDefinition<TExtends, TFields, TCallbacks, TSlots> {
  return definition;
}

const mergeNamedDefinitions = <TValue>(
  target: Record<string, TValue | undefined>,
  source: Record<string, TValue | undefined> | undefined,
  context: string,
) => {
  if (!source) {
    return;
  }

  for (const [name, definition] of Object.entries(source)) {
    if (name in target && target[name] !== definition) {
      throw new Error(`${context} defines duplicate "${name}". Override it locally instead.`);
    }
    target[name] = definition;
  }
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

  if ("json" in value) {
    const json = (value as { json?: unknown }).json;
    if (json && typeof json === "object") {
      const { optional, required } = json as {
        optional?: readonly { key?: unknown }[];
        required?: readonly { key?: unknown }[];
      };
      return [...(required ?? []), ...(optional ?? [])]
        .map(({ key }) => (typeof key === "string" ? key : undefined))
        .filter((key): key is string => typeof key === "string");
    }
  }

  return [];
};

const assertNoLocalFieldCallbackConflicts = (
  componentName: string,
  fieldKeys: readonly string[],
  callbackKeys: readonly string[],
) => {
  const callbackKeySet = new Set(callbackKeys);
  for (const fieldKey of fieldKeys) {
    if (callbackKeySet.has(fieldKey)) {
      throw new Error(
        `Component "${componentName}" defines both a field and callback named "${fieldKey}". Use distinct names for serializable fields and function callbacks.`,
      );
    }
  }
};

const resolveComponentMetadata = (
  name: string,
  definition: ComponentDefinition,
): ResolvedComponentMetadata => {
  const fields: Schema[] = [];
  const fieldKeys = new Set<string>();
  const callbacks: CallbackMap = {};
  const nativeEvents: NativeEventMap = {};
  const overriddenNativeFieldKeys = new Set<string>();

  for (const preset of definition.extends ?? []) {
    if (preset.fields) {
      fields.push(preset.fields);
      for (const key of preset.fieldKeys ?? getObjectKeys(preset.fields)) {
        fieldKeys.add(key);
      }
    }
    mergeNamedDefinitions(callbacks, preset.callbacks, `Component "${name}" preset callbacks`);
    mergeNamedDefinitions(nativeEvents, preset.nativeEvents, `Component "${name}" native events`);
  }

  const localFieldKeys = definition.fields ? getObjectKeys(definition.fields) : [];
  const localCallbackKeys = Object.keys(definition.callbacks ?? {});
  assertNoLocalFieldCallbackConflicts(name, localFieldKeys, localCallbackKeys);

  for (const key of localFieldKeys) {
    if (fieldKeys.has(key)) {
      overriddenNativeFieldKeys.add(key);
    }
  }

  if (definition.fields) {
    fields.push(definition.fields);
    for (const key of localFieldKeys) {
      fieldKeys.add(key);
    }
  }
  Object.assign(callbacks, definition.callbacks);

  return {
    callbacks,
    fieldKeys: [...fieldKeys],
    fields,
    nativeEvents,
    overriddenNativeFieldKeys: [...overriddenNativeFieldKeys],
    slots: [...(definition.slots ?? [])],
  };
};

/**
 * Defines a TailorKit schema and extracts runtime metadata for adapters.
 *
 * @param schema - Schema definition object.
 * @param schema.components - Map of component name to its {@link ComponentDefinition}.
 *   Each entry describes the serializable fields, function callbacks, slots, and
 *   optional preset extensions that make up the component's public contract.
 */
export function defineSchema<
  const TComponents extends Record<string, ComponentDefinition>,
  const TScreens extends ScreenMap = Record<string, never>,
  const TDefaultContext extends Schema | undefined = undefined,
>(
  schema: {
    components: TComponents;
    defaultContext?: TDefaultContext;
    screens?: TScreens;
  } & NoExtraScreenDefinitionKeys<TScreens>,
): TailorKitSchema<TComponents, TScreens, TDefaultContext> {
  const resolvedComponents = {} as TailorKitSchema<
    TComponents,
    TScreens,
    TDefaultContext
  >["$internal"]["metadata"]["components"];

  for (const [name, definition] of Object.entries(schema.components)) {
    resolvedComponents[name as keyof TComponents] = resolveComponentMetadata(name, definition);
  }

  const serialize = (schemaSerializer?: SchemaSerializer): SerializedTailorKitSchema => {
    const toJsonSchema = (schema: Schema | undefined): Record<string, unknown> | undefined => {
      if (!schema || !schemaSerializer) {
        return undefined;
      }
      return schemaSerializer(schema);
    };

    const toJsonSchemas = (
      schemas: readonly Schema[] | undefined,
    ): Record<string, unknown>[] | undefined => {
      if (!schemas || !schemaSerializer) {
        return undefined;
      }
      const result = schemas
        .map(schemaSerializer)
        .filter((s): s is Record<string, unknown> => s !== undefined);
      return result.length > 0 ? result : undefined;
    };

    const serializedComponents: SerializedTailorKitSchema["components"] = {};

    for (const [name, meta] of Object.entries(resolvedComponents)) {
      const callbacks: SerializedTailorKitSchema["components"][string]["callbacks"] = {};

      for (const [cbName, cb] of Object.entries(meta.callbacks)) {
        if (!cb) {
          continue;
        }
        callbacks[cbName] = {
          async: cb.async,
          input: toJsonSchemas(cb.input),
          output: toJsonSchema(cb.output),
        };
      }

      const nativeEvents: SerializedTailorKitSchema["components"][string]["nativeEvents"] = {};

      for (const [evName, ev] of Object.entries(meta.nativeEvents)) {
        if (!ev) {
          continue;
        }
        nativeEvents[evName] = {
          element: ev.element,
          name: ev.name,
          input: toJsonSchemas(ev.input),
        };
      }

      serializedComponents[name] = {
        fieldKeys: [...meta.fieldKeys],
        callbacks,
        slots: [...meta.slots],
        nativeEvents,
      };
    }

    const serializedScreens: SerializedTailorKitSchema["screens"] = {};

    for (const [path, screen] of Object.entries(schema.screens ?? {})) {
      serializedScreens[path] = {
        context: toJsonSchema(screen.context),
      };
    }

    return {
      version: 1,
      components: serializedComponents,
      defaultContext: toJsonSchema(schema.defaultContext),
      screens: serializedScreens,
    };
  };

  return {
    screens: {} as TScreens,
    ...schema,
    serialize,
    $internal: { metadata: { components: resolvedComponents } },
  };
}
