import type { Schema } from "./shared";

export interface ScreenDefinition<TContext extends Schema | undefined = Schema | undefined> {
  context?: TContext;
}

export type ScreenDefinitions = Record<string, ScreenDefinition>;

export interface ResolvedScreenMetadata {
  context?: Schema;
}

export type Screen = ScreenDefinition;
export type Screens = ScreenDefinitions;
