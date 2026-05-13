import type { EventHandler } from "h3";
import type { ComponentDefinition, ScreenDefinition, TailorKitSchema } from "../schema";

export interface TailorKitServerApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}

export interface TailorKitServerOptions<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition>,
> {
  schema: TailorKitSchema<TComponents, TScreens>;
  apps?: TailorKitServerApp[] | (() => Promise<TailorKitServerApp[]> | TailorKitServerApp[]);
  basePath?: string;
}

export interface TailorKitServer {
  handler: EventHandler;
}

export interface PublicTailorKitApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}
