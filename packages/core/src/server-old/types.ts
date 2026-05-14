import type {
  ActionTree,
  ComponentDefinition,
  InferRequestContext,
  Schema,
  ScreenDefinition,
  TailorKitSchema,
} from "../schema";
import type { ImplementedActionRouter } from "./actions";
import type { TailorKitPlatformOptions } from "./platform-client";
export type { TailorKitPlatformOptions } from "./platform-client";

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
  TActions extends ActionTree = Record<never, never>,
  TRequestContext extends Schema | undefined = undefined,
> {
  schema: TailorKitSchema<TComponents, TScreens, TActions, TRequestContext>;
  actions?: ImplementedActionRouter<
    TActions,
    InferRequestContext<TailorKitSchema<TComponents, TScreens, TActions, TRequestContext>>
  >;
  basePath?: string;
  maxClientBundleSize?: number;
  platform?: TailorKitPlatformOptions;
}

export interface TailorKitHandlerContext<TRequestContext = unknown> {
  projectId: string;
  requestContext: TRequestContext;
  resourceId: string;
}

export interface TailorKitServer {
  fetch: (request: Request) => Response | Promise<Response>;
  handler: (request: Request, context?: TailorKitHandlerContext) => Response | Promise<Response>;
  $internal: {
    schema: TailorKitSchema<
      Record<string, ComponentDefinition>,
      Record<string, ScreenDefinition>,
      ActionTree,
      Schema | undefined
    >;
  };
}

export interface PublicTailorKitApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}

export interface TailorKitUploadIntent {
  clientEntryUploadId?: string;
  headers?: Record<string, string>;
  id: string;
  maxBytes?: number;
  uploadUrl: string;
}
