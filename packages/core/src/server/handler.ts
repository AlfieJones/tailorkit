import { RPCHandler } from "@orpc/server/fetch";
import { appsList, previewResolve } from "@tailorkit/client-platform/client";
import { createClient } from "@tailorkit/client-platform/client/client/index";
import type {
  NoComponentFieldCallbackConflicts,
  NoMixedActionContexts,
  ResolveActionTreeContext,
  ViewContextHierarchy,
  SlotDefinitions,
} from "../schema/index";
import { createTailorKitSchema } from "../schema/schema";
import { flattenActionRouter } from "./actions";
import { normalizeBasePath } from "./apps";
import { handleCliAuthApprovalPage } from "./cli-auth-page";
import { createContext } from "./context";
import { tailorkitRouter } from "./router";
import type {
  InferTailorKitServerActions,
  InferTailorKitServerComponents,
  InferTailorKitServerContexts,
  TailorKitHandlerOptions,
  TailorKitServer,
  TailorKitServerInputOptions,
} from "./types";

const defaultPlatformBaseUrl = "https://tailorkit.dev/api/platform";
type AbsolutePath = `/${string}`;

export function createTailorKitServer<const TOptions extends TailorKitServerInputOptions>(
  options: TOptions & {
    slots?: SlotDefinitions<keyof InferTailorKitServerContexts<NoInfer<TOptions>> & string>;
    actions?: InferTailorKitServerActions<TOptions> &
      NoMixedActionContexts<InferTailorKitServerActions<TOptions>>;
    components: InferTailorKitServerComponents<TOptions> &
      NoComponentFieldCallbackConflicts<InferTailorKitServerComponents<TOptions>>;
    contexts?: InferTailorKitServerContexts<TOptions> &
      ViewContextHierarchy<InferTailorKitServerContexts<TOptions>>;
  },
): TailorKitServer<
  InferTailorKitServerComponents<TOptions>,
  InferTailorKitServerContexts<TOptions>,
  InferTailorKitServerActions<TOptions>
> & {
  readonly $slots?: TOptions extends { slots: infer V } ? V : Record<never, never>;
} {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");
  const schema = createTailorKitSchema<
    InferTailorKitServerComponents<TOptions>,
    InferTailorKitServerContexts<TOptions>,
    InferTailorKitServerActions<TOptions>
  >({
    actions: options.actions as
      | (InferTailorKitServerActions<TOptions> &
          NoMixedActionContexts<InferTailorKitServerActions<TOptions>>)
      | undefined,
    slots: options.slots,
    components: options.components,
    contexts: options.contexts,
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

  // oxlint-disable-next-line complexity -- request dispatch is intentionally centralized here.
  const handler = async (
    request: Request,
    handlerOptions: TailorKitHandlerOptions<
      ResolveActionTreeContext<InferTailorKitServerActions<TOptions>>
    >,
  ) => {
    const url = new URL(request.url);
    const previewPrefix = `${basePath}/preview/`;
    if (url.pathname === `${basePath}/schema`) {
      return Response.json(schema.serialize());
    }

    if (url.pathname === `${basePath}/meta`) {
      return Response.json({
        assetsBaseUrl: assetsBaseUrl ?? null,
        schema: schema.serialize(),
      });
    }

    if (
      (request.method === "GET" || request.method === "HEAD") &&
      url.pathname.startsWith(previewPrefix)
    ) {
      const previewPath = url.pathname.slice(previewPrefix.length);
      const separator = previewPath.indexOf("/");
      const sessionId = previewPath.slice(0, separator);
      const assetPath = previewPath.slice(separator + 1);
      if (
        separator <= 0 ||
        !/^[a-zA-Z0-9._/-]+$/u.test(assetPath) ||
        assetPath.split("/").some((segment) => segment === "." || segment === "..")
      ) {
        return new Response("Not found", { status: 404 });
      }

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

      const previewResult = await previewResolve({
        client: context.platform,
        headers: context.platformHeaders,
        path: { sessionId },
        query: { scopeId: tailorkit.scopeId },
      });
      const previewData = "data" in previewResult ? previewResult.data : previewResult;
      const preview =
        previewData && typeof previewData === "object" && "body" in previewData
          ? previewData.body
          : previewData;
      if (!preview || typeof preview !== "object" || !("clientPath" in preview)) {
        return new Response("Not found", { status: 404 });
      }
      const clientPath = preview.clientPath;
      if (typeof clientPath !== "string") {
        return new Response("Not found", { status: 404 });
      }

      const assetUrl = new URL(clientPath);
      assetUrl.pathname = `${assetUrl.pathname.slice(0, assetUrl.pathname.lastIndexOf("/") + 1)}${assetPath}`;
      const assetResponse = await fetch(assetUrl, { method: request.method });
      const headers = new Headers();
      for (const name of ["cache-control", "content-length", "content-type", "etag"] as const) {
        const value = assetResponse.headers.get(name);
        if (value) {
          headers.set(name, value);
        }
      }
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(assetResponse.body, { headers, status: assetResponse.status });
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

      const previewSessionId = url.searchParams.get("previewSessionId");
      if (!previewSessionId || !body || typeof body !== "object" || !("items" in body)) {
        return Response.json(body && typeof body === "object" && "items" in body ? body.items : []);
      }

      const previewResult = await previewResolve({
        client: context.platform,
        headers: context.platformHeaders,
        path: { sessionId: previewSessionId },
        query: { scopeId: tailorkit.scopeId },
      });
      const previewData = "data" in previewResult ? previewResult.data : previewResult;
      const preview =
        previewData && typeof previewData === "object" && "body" in previewData
          ? previewData.body
          : previewData;

      if (!preview || typeof preview !== "object") {
        return Response.json((body as { items: unknown }).items);
      }
      const resolvedPreview = preview as {
        appId?: unknown;
        clientPath?: unknown;
        sessionId?: unknown;
        status?: unknown;
      };
      if (
        typeof resolvedPreview.appId !== "string" ||
        typeof resolvedPreview.clientPath !== "string" ||
        typeof resolvedPreview.sessionId !== "string" ||
        (resolvedPreview.status !== "connected" && resolvedPreview.status !== "offline")
      ) {
        return Response.json((body as { items: unknown }).items);
      }

      const items = (body as { items: Record<string, unknown>[] }).items.map((item) =>
        item.publicId === resolvedPreview.appId
          ? {
              ...item,
              clientPath: new URL(
                `${basePath}/preview/${resolvedPreview.sessionId}/client.js`,
                url.origin,
              ).href,
              preview: {
                sessionId: resolvedPreview.sessionId,
                status: resolvedPreview.status,
              },
            }
          : item,
      );

      return Response.json(items);
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
        signInPath: options.cliAuth?.signInPath,
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
