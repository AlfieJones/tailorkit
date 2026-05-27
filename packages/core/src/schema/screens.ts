import type { Schema } from "./shared";

export interface ScreenDefinition<TContext extends Schema | undefined = Schema | undefined> {
  context?: TContext;
}

export type ScreenRoute = `/${string}`;

export type ScreenDefinitions = Record<ScreenRoute, ScreenDefinition>;

export interface ResolvedScreenMetadata {
  context?: Schema;
}

export type Screen = ScreenDefinition;
export type Screens = ScreenDefinitions;
