import type { InferSchema, Schema } from "./shared";

export interface ScopeDefinition<TContext extends Schema | undefined = Schema | undefined> {
  context?: TContext;
}
export type ScopeDefinitions = Record<`/${string}`, ScopeDefinition>;
export type Scope = ScopeDefinition;
export type Scopes = ScopeDefinitions;
export interface ResolvedScopeMetadata {
  context?: Schema;
}

type OwnContext<T> =
  T extends ScopeDefinition<infer S>
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
export type ScopeContextHierarchy<T> = {
  [P in keyof T]: P extends string
    ? Extract<keyof OwnContext<T[P]>, AncestorKeys<T, P>> extends never
      ? unknown
      : {
          readonly __tailorkit_error__: `Scope "${P}" redeclares an ancestor context field.`;
        }
    : unknown;
};
