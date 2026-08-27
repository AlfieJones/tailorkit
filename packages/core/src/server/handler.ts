import { RPCHandler } from "@orpc/server/fetch";
import { appsList } from "@tailorkit/client-platform/client";
import { createClient } from "@tailorkit/client-platform/client/client/index";
import type {
  NoComponentFieldCallbackConflicts,
  NoMixedActionContexts,
  ResolveActionTreeContext,
  ScreenContextHierarchy,
} from "../schema";
import { createTailorKitSchema } from "../schema/schema";
import { flattenActionRouter } from "./actions";
import { normalizeBasePath } from "./apps";
import { handleCliAuthApprovalPage } from "./cli-auth-page";
import { createContext } from "./context";
import { tailorkitRouter } from "./router";
import type {
  InferTailorKitServerActions,
  InferTailorKitServerComponents,
  InferTailorKitServerScreens,
  TailorKitHandlerOptions,
  TailorKitServer,
  TailorKitServerInputOptions,
} from "./types";

const defaultPlatformBaseUrl = "https://tailorkit.dev/api/platform";
type AbsolutePath = `/${string}`;

export function createTailorKitServer<const TOptions extends TailorKitServerInputOptions>(
  options: TOptions & {
    actions?: InferTailorKitServerActions<TOptions> &
      NoMixedActionContexts<InferTailorKitServerActions<TOptions>>;
    components: InferTailorKitServerComponents<TOptions> &
      NoComponentFieldCallbackConflicts<InferTailorKitServerComponents<TOptions>>;
    screens?: InferTailorKitServerScreens<TOptions> &
      ScreenContextHierarchy<InferTailorKitServerScreens<TOptions>>;
  },
): TailorKitServer<
  InferTailorKitServerComponents<TOptions>,
  InferTailorKitServerScreens<TOptions>,
  InferTailorKitServerActions<TOptions>
> {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");
  const schema = createTailorKitSchema<
    InferTailorKitServerComponents<TOptions>,
    InferTailorKitServerScreens<TOptions>,
    InferTailorKitServerActions<TOptions>
  >({
    actions: options.actions as
      | (InferTailorKitServerActions<TOptions> &
          NoMixedActionContexts<InferTailorKitServerActions<TOptions>>)
      | undefined,
    components: options.components,
    screens: options.screens,
  });
  const platformBaseUrl = options.$internal?.platformBaseUrl ?? defaultPlatformBaseUrl;
  const assetsBaseUrl = options.assetsBaseUrl;
  const actions = flattenActionRouter(options.actions);
  const platform = createClient({
    baseUrl: platformBaseUrl,
    fetch: options.$internal?.platformFetch,
    responseStyle: "data",
    throwOnError: true,
  });
  const platformHeaders =
    options.$internal?.platformHeaders ??
    (options.projectKey ? { authorization: `Bearer ${options.projectKey}` } : undefined);
  const rpcHandler = new RPCHandler(tailorkitRouter);

  const handler = async (
    request: Request,
    handlerOptions: TailorKitHandlerOptions<
      ResolveActionTreeContext<InferTailorKitServerActions<TOptions>>
    >,
  ) => {
    const url = new URL(request.url);
    if (url.pathname === `${basePath}/schema`) {
      return Response.json(schema.serialize());
    }

    if (url.pathname === `${basePath}/meta`) {
      return Response.json({
        assetsBaseUrl: assetsBaseUrl ?? null,
        schema: schema.serialize(),
      });
    }

    if (request.method === "GET" && url.pathname === `${basePath}/apps`) {
      const context = await createContext({
        actions,
        platform,
        platformHeaders,
        request,
        schema,
        authenticate: handlerOptions.authenticate,
      });
      const tailorkit = await context.authenticate({ request });

      if (!tailorkit) {
        return new Response("Unauthorized", { status: 401 });
      }

      const result = await appsList({
        client: context.platform,
        headers: context.platformHeaders,
        query: {
          page: 1,
          pageSize: 100,
          scopeId: tailorkit.scopeId,
        },
      });
      const data = "data" in result ? result.data : result;
      const body = data && typeof data === "object" && "body" in data ? data.body : data;

      return Response.json(body && typeof body === "object" && "items" in body ? body.items : []);
    }

    if (url.pathname === `${basePath}/cli-auth/approve`) {
      const context = await createContext({
        actions,
        platform,
        platformHeaders,
        request,
        schema,
        authenticate: handlerOptions.authenticate,
      });

      return handleCliAuthApprovalPage({
        authenticate: context.authenticate,
        platform: context.platform,
        platformHeaders: context.platformHeaders,
        request,
      });
    }

    const rpcResult = await rpcHandler.handle(request, {
      context: await createContext({
        actions,
        platform,
        platformHeaders,
        request,
        schema,
        authenticate: handlerOptions.authenticate,
      }),
      prefix: basePath as AbsolutePath,
    });

    if (rpcResult.response) {
      return rpcResult.response;
    }

    return new Response("TailorKit route not found", { status: 404 });
  };

  return {
    $internal: { assetsBaseUrl, platformBaseUrl, router: tailorkitRouter, schema },
    handler,
  };
}
