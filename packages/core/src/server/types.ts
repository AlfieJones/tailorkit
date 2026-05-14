import type {
  ActionTree,
  ComponentDefinition,
  InferRequestContext,
  Schema,
  ScreenDefinition,
  TailorKitSchema,
} from "../schema";
import type { ImplementedActionRouter } from "./actions";
import type { ClientOptions as PlatformClientOptions } from "@tailorkit/client-platform/client/types.gen";
import type { TailorKitRouter } from "./router";

type HeaderInput = ConstructorParameters<typeof Headers>[0];

export interface TailorKitPlatformOptions {
  baseUrl?: PlatformClientOptions["baseUrl"];
  fetch?: typeof fetch;
  headers?: HeaderInput | (() => HeaderInput | Promise<HeaderInput>);
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
  $internal?: {
    platformBaseUrl?: TailorKitPlatformOptions["baseUrl"];
    platformFetch?: typeof fetch;
    platformHeaders?: TailorKitPlatformOptions["headers"];
  };
}

export interface TailorKitHandlerContext<TRequestContext = unknown> {
  requestContext: TRequestContext;
  resourceId: string;
}

export interface TailorKitServer<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
  TRequestContext extends Schema | undefined = undefined,
> {
  handler: (
    request: Request,
    context: TailorKitHandlerContext<
      InferRequestContext<TailorKitSchema<TComponents, TScreens, TActions, TRequestContext>>
    >,
  ) => Response | Promise<Response>;
  $internal: {
    platformBaseUrl: string;
    router: TailorKitRouter;
    schema: TailorKitSchema<TComponents, TScreens, TActions, TRequestContext>;
  };
}
