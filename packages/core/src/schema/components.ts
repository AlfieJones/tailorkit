import type { CallbackMap, Callbacks, InferCallbacks } from "./callbacks";
import type { EmptyObject, InferSchema, MergeProps, Schema } from "./shared";

type EmptyCallbackMap = Record<never, never>;

export type Fields = Schema;
export type Slots = readonly string[];

export interface ComponentDefinition<
  TFields extends Fields | undefined = Fields | undefined,
  TCallbacks extends Callbacks = EmptyCallbackMap,
  TSlots extends Slots | undefined = Slots | undefined,
> {
  callbacks?: TCallbacks;
  fields?: TFields;
  slots?: TSlots;
}

type AnyComponentDefinition = ComponentDefinition<
  Schema | undefined,
  CallbackMap,
  readonly string[] | undefined
>;

export type ComponentDefinitions = Record<string, AnyComponentDefinition>;

export type ComponentProps<TComponent> = MergeProps<
  TComponent extends { fields: infer TFields } ? InferSchema<TFields> : EmptyObject,
  TComponent extends { callbacks: infer TCallbacks } ? InferCallbacks<TCallbacks> : EmptyObject
>;

export type ComponentSlots<TComponent> = TComponent extends { slots: infer TSlots }
  ? TSlots extends readonly string[]
    ? Record<TSlots[number], unknown>
    : EmptyObject
  : EmptyObject;

export interface ResolvedComponentMetadata {
  callbacks: CallbackMap;
  fields?: Schema;
  slots: readonly string[];
}

type FieldCallbackConflictKeys<TFields, TCallbacks> = Extract<
  string extends keyof InferSchema<TFields>
    ? never
    : string extends keyof TCallbacks
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

export type NoComponentFieldCallbackConflicts<TComponents> = {
  [TName in keyof TComponents]: TComponents[TName] extends ComponentDefinition<
    infer TFields,
    infer TCallbacks,
    readonly string[] | undefined
  >
    ? NoFieldCallbackConflicts<TFields, TCallbacks>
    : unknown;
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

export const resolveComponentMetadata = (
  name: string,
  definition: ComponentDefinition,
): ResolvedComponentMetadata => {
  const fields = definition.fields;
  const fieldKeys = fields ? getObjectKeys(fields) : [];
  const callbackKeys = Object.keys(definition.callbacks ?? {});
  assertNoLocalFieldCallbackConflicts(name, fieldKeys, callbackKeys);

  return {
    callbacks: definition.callbacks ?? {},
    fields,
    slots: [...(definition.slots ?? [])],
  };
};

export type Component = ComponentDefinition;
export type Components = ComponentDefinitions;
