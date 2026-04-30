import type { StandardSchemaV1 } from "@standard-schema/spec";

export type Schema = StandardSchemaV1;
export type CallbackMap = Record<string, CallbackDefinition | undefined>;
export type NativeEventMap = Record<string, NativeEventDefinition | undefined>;

type EmptyObject = Record<string, never>;
type VoidResult = ReturnType<() => void>;

type InferSchema<TSchema> = TSchema extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<TSchema>
  : EmptyObject;

type InferCallbackInput<TCallback> = TCallback extends { input?: infer TInput }
  ? TInput extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TInput>
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
    : (input: InferCallbackInput<TCallback>) => CallbackReturn<TCallback>;

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
  TInput extends Schema | undefined = Schema | undefined,
  TOutput extends Schema | undefined = Schema | undefined,
  TAsync extends boolean | undefined = boolean | undefined,
> {
  /** Serializable callback input. Omit for a zero-argument callback. */
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
  TInput extends Schema | undefined = Schema | undefined,
> extends CallbackDefinition<TInput, undefined, false> {
  element: string;
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
  callbacks?: TCallbacks;
  fieldKeys?: readonly string[];
  fields?: TFields;
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

export interface TailorKitSchema<TComponents extends Record<string, ComponentDefinition>> {
  components: TComponents;
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

/**
 * Creates a component definition while preserving literal types for inference.
 */
export function component<
  const TExtends extends readonly ComponentPreset[] | undefined = undefined,
  const TFields extends Schema | undefined = undefined,
  const TCallbacks extends CallbackMap = Record<string, never>,
  const TSlots extends readonly string[] | undefined = undefined,
>(
  definition: ComponentDefinition<TExtends, TFields, TCallbacks, TSlots> &
    NoFieldCallbackConflicts<TFields, TCallbacks>,
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
 * Defines a server-safe TailorKit schema and extracts runtime metadata for
 * adapters without importing React or any other UI framework.
 *
 * TODO - improve this doc comment. The serer-safe bit seems a bit odd. We should also link to docs once they're up
 * also saying we dont import react etc shouldn;t be said.
 */
export function defineSchema<
  const TComponents extends Record<string, ComponentDefinition>,
>(schema: { components: TComponents }): TailorKitSchema<TComponents> {
  const components = {} as TailorKitSchema<TComponents>["$internal"]["metadata"]["components"];

  for (const [name, definition] of Object.entries(schema.components)) {
    components[name as keyof TComponents] = resolveComponentMetadata(name, definition);
  }

  return {
    ...schema,
    $internal: { metadata: { components } },
  };
}
