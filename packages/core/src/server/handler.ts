import { RPCHandler } from "@orpc/server/fetch";
import { createClient } from "@tailorkit/client-platform/client/client/index";
import type {
  ActionTree,
  ComponentDefinition,
  InferRequestContext,
  Schema,
  ScreenDefinition,
} from "../schema";
import { flattenActionRouter } from "./actions";
import { normalizeBasePath } from "./apps";
import { createContext } from "./context";
import { tailorkitRouter } from "./router";
import type { TailorKitHandlerContext, TailorKitServer, TailorKitServerOptions } from "./types";

const defaultPlatformBaseUrl = "https://tailorkit.dev/api/platform";
type AbsolutePath = `/${string}`;

export function createTailorKitServer<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
  TRequestContext extends Schema | undefined = undefined,
>(
  options: TailorKitServerOptions<TComponents, TScreens, TActions, TRequestContext>,
): TailorKitServer<TComponents, TScreens, TActions, TRequestContext> {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");
  const platformBaseUrl = options.$internal?.platformBaseUrl ?? defaultPlatformBaseUrl;
  const actions = flattenActionRouter(options.actions);
  const platform = createClient({
    baseUrl: platformBaseUrl,
    fetch: options.$internal?.platformFetch,
    responseStyle: "data",
    throwOnError: true,
  });
  const rpcHandler = new RPCHandler(tailorkitRouter);

  const handler = async (
    request: Request,
    context: TailorKitHandlerContext<InferRequestContext<typeof options.schema>>,
  ) => {
    const rpcResult = await rpcHandler.handle(request, {
      context: await createContext({
        actions,
        platform,
        platformHeaders: options.$internal?.platformHeaders,
        request,
        requestContextSchema: options.schema.$internal.requestContext,
        tailorkit: context,
      }),
      prefix: basePath as AbsolutePath,
    });

    if (rpcResult.response) {
      return rpcResult.response;
    }

    return new Response("TailorKit route not found", { status: 404 });
  };

  return {
    $internal: { platformBaseUrl, router: tailorkitRouter, schema: options.schema },
    handler,
  };
}
