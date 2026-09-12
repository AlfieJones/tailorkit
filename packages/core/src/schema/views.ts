import type { InferSchema, Schema } from "./shared";

export interface ViewDefinition<TContext extends Schema | undefined = Schema | undefined> {
  context?: TContext;
}
export type ViewDefinitions = Record<`/${string}`, ViewDefinition>;
export type View = ViewDefinition;
export type Views = ViewDefinitions;
export interface ResolvedViewMetadata {
  context?: Schema;
}

type OwnContext<T> = T extends { context?: infer S }
  ? S extends Schema
    ? InferSchema<S>
    : Record<never, never>
  : Record<never, never>;
type Ancestors<T, P extends string> = {
  [K in keyof T & string]: K extends P
    ? never
    : K extends "/"
      ? K
      : P extends `${K}/${string}`
        ? K
        : never;
}[keyof T & string];
type AncestorKeys<T, P extends string> = {
  [K in Ancestors<T, P>]: keyof OwnContext<T[K]>;
}[Ancestors<T, P>];
export type ViewContextHierarchy<T> = {
  [P in keyof T]: P extends string
    ? Exclude<OwnContext<T[P]>, undefined> extends Record<string, unknown>
      ? Extract<keyof OwnContext<T[P]>, AncestorKeys<T, P>> extends never
        ? unknown
        : {
            readonly __tailorkit_error__: `View "${P}" redeclares an ancestor context field.`;
          }
      : {
          readonly __tailorkit_error__: `View "${P}" context must be an object with named fields.`;
        }
    : unknown;
};

export type SlotDefinitions<TPath extends string = string> = Record<
  string,
  { views: readonly TPath[] }
>;
