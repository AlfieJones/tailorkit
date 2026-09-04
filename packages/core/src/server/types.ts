import type {
  ActionTree,
  ActionDefinitions,
  ComponentDefinitions,
  NoMixedActionContexts,
  NoComponentFieldCallbackConflicts,
  ResolveActionTreeContext,
  ScreenContextHierarchy,
  ScreenDefinition,
  ScreenDefinitions,
  TailorKitSchema,
} from "../schema";
import type { ClientOptions as PlatformClientOptions } from "@tailorkit/client-platform/client/types.gen";
import type { TailorKitRouter } from "./router";

type HeaderInput = ConstructorParameters<typeof Headers>[0];

export interface TailorKitPlatformOptions {
  baseUrl?: PlatformClientOptions["baseUrl"];
  fetch?: typeof fetch;
  headers?: HeaderInput | (() => HeaderInput | Promise<HeaderInput>);
}

export interface TailorKitServerBaseOptions {
  /**
   * TailorKit.dev project key
   *
   * @default process.env.TAILORKIT_PROJECT_KEY
   */
  projectKey?: string;
  /** Optional custom asset origin. Hosted apps receive a tenant-scoped clientPath from TailorKit automatically. */
  assetsBaseUrl?: string;
  basePath?: string;
  /**
   * Internal TailorKit implementation options.
   *
   * These options are not covered by semantic versioning and may change or
   * break at any time. Avoid using them in application code. If you need one of
   * these hooks, please open a GitHub issue explaining the problem you are
   * solving so we can find a stable public API.
   *
   * @internal
   */
  $internal?: {
    platformBaseUrl?: TailorKitPlatformOptions["baseUrl"];
    platformFetch?: typeof fetch;
    platformHeaders?: TailorKitPlatformOptions["headers"];
  };
}

export interface TailorKitServerSchemaOptions<
  TComponents extends ComponentDefinitions,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
> {
  actions?: TActions & ActionDefinitions & NoMixedActionContexts<TActions>;
  components: TComponents & NoComponentFieldCallbackConflicts<TComponents>;
  screens?: TScreens & ScreenContextHierarchy<TScreens>;
}

export interface TailorKitServerInputOptions extends TailorKitServerBaseOptions {
  actions?: ActionDefinitions;
  components: ComponentDefinitions;
  screens?: ScreenDefinitions;
}

export type InferTailorKitServerComponents<TOptions extends TailorKitServerInputOptions> =
  TOptions["components"];

export type InferTailorKitServerScreens<TOptions extends TailorKitServerInputOptions> =
  TOptions extends { screens: infer TScreens } ? TScreens : Record<never, never>;

export type InferTailorKitServerActions<TOptions extends TailorKitServerInputOptions> =
  TOptions extends { actions: infer TActions } ? TActions : Record<never, never>;

export interface TailorKitServerOptions<
  TComponents extends ComponentDefinitions,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
>
  extends
    TailorKitServerBaseOptions,
    TailorKitServerSchemaOptions<TComponents, TScreens, TActions> {}

export type TailorKitHostContext<TActionContext = never> = {
  scopeId: string;
} & ([TActionContext] extends [never]
  ? { actionContext?: never }
  : { actionContext: TActionContext });

export interface TailorKitHandlerOptions<TActionContext = never> {
  authenticate: (ctx: {
    request: Request;
  }) =>
    | TailorKitHostContext<TActionContext>
    | null
    | Promise<TailorKitHostContext<TActionContext> | null>;
}

export type TailorKitHandlerContext<TActionContext = never> = TailorKitHostContext<TActionContext>;

export interface TailorKitServer<
  TComponents extends ComponentDefinitions,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
  TActionContext = ResolveActionTreeContext<TActions>,
> {
  handler: (
    request: Request,
    options: TailorKitHandlerOptions<TActionContext>,
  ) => Response | Promise<Response>;
  /**
   * Internal TailorKit implementation details.
   *
   * This API is not covered by semantic versioning and may change or break at
   * any time. Avoid depending on it in application code. If you need something
   * exposed here, please open a GitHub issue explaining what you are trying to
   * build so we can design a stable public API for that use case.
   *
   * @internal
   */
  $internal: {
    assetsBaseUrl?: string;
    platformBaseUrl: string;
    router: TailorKitRouter;
    schema: TailorKitSchema<TComponents, TScreens, TActions>;
  };
}
