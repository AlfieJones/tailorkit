import type { InferSchema, Schema } from "./shared";

export interface ScreenDefinition<TContext extends Schema | undefined = Schema | undefined> {
  context?: TContext;
}

export type ScreenRoute = `/${string}`;

export type ScreenDefinitions = Record<ScreenRoute, ScreenDefinition>;

type SplitPath<TPath extends string> = TPath extends `${infer THead}/${infer TTail}`
  ? [THead, ...SplitPath<TTail>]
  : TPath extends ""
    ? []
    : [TPath];

type JoinPath<TSegments extends string[]> = TSegments extends []
  ? "/"
  : TSegments extends [infer THead extends string, ...infer TTail extends string[]]
    ? TTail extends []
      ? `/${THead}`
      : `/${THead}${JoinPath<TTail>}`
    : "/";

type ParentPath<TPath extends string> = TPath extends "/"
  ? never
  : TPath extends `/${infer TRest}`
    ? SplitPath<TRest> extends [...infer TParent extends string[], string]
      ? JoinPath<TParent>
      : never
    : never;

type ClosestDeclaredParent<
  TScreens,
  TPath extends string,
  TCandidate extends string | never = ParentPath<TPath>,
> = [TCandidate] extends [never]
  ? never
  : TCandidate extends keyof TScreens
    ? TCandidate
    : TCandidate extends string
      ? ClosestDeclaredParent<TScreens, TCandidate>
      : never;

type ScreenContextOutput<TScreen> =
  TScreen extends ScreenDefinition<infer TContext>
    ? TContext extends Schema
      ? InferSchema<TContext>
      : unknown
    : never;

type ScreenContextHierarchyEntry<
  TScreens,
  TPath extends keyof TScreens & string,
  TParent = ClosestDeclaredParent<TScreens, TPath>,
> = [TParent] extends [never]
  ? unknown
  : TParent extends keyof TScreens
    ? ScreenContextOutput<TScreens[TPath]> extends ScreenContextOutput<TScreens[TParent]>
      ? unknown
      : {
          readonly __tailorkit_error__: `Screen context for "${TPath}" must include the context for parent screen "${TParent & string}".`;
        }
    : unknown;

export type ScreenContextHierarchy<TScreens> = {
  [TPath in keyof TScreens]: TPath extends string
    ? ScreenContextHierarchyEntry<TScreens, TPath>
    : unknown;
};

export interface ResolvedScreenMetadata {
  context?: Schema;
}

export type Screen = ScreenDefinition;
export type Screens = ScreenDefinitions;
