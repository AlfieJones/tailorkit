import { getRouterParam, H3, HTTPError } from "h3";
import type {
  ActionDefinition,
  ActionTree,
  ComponentDefinition,
  Schema,
  ScreenDefinition,
} from "../schema";
import { flattenActionRouter } from "./actions";
import { normalizeBasePath, toPublicApp } from "./apps";
import { createTailorKitPlatformClient } from "./platform-client";
import type { TailorKitHandlerContext, TailorKitServer, TailorKitServerOptions } from "./types";

const defaultMaxClientBundleSize = 1024 * 1024;

const validateSchema = async <T>(schema: Schema | undefined, value: unknown): Promise<T> => {
  if (schema === undefined) {
    return value as T;
  }

  const result = await schema["~standard"].validate(value);
  if ("issues" in result) {
    throw HTTPError.status(400, "Invalid TailorKit payload");
  }

  return result.value as T;
};

const requireHandlerContext = (
  context: TailorKitHandlerContext | undefined,
): TailorKitHandlerContext => {
  if (!context?.resourceId) {
    throw HTTPError.status(400, "Missing TailorKit resourceId");
  }
  if (!context.projectId) {
    throw HTTPError.status(400, "Missing TailorKit projectId");
  }

  return context;
};

export function createTailorKitServer<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition>,
  TActions extends ActionTree = Record<never, never>,
  TRequestContext extends Schema | undefined = undefined,
>(
  options: TailorKitServerOptions<TComponents, TScreens, TActions, TRequestContext>,
): TailorKitServer {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");
  const maxClientBundleSize = options.maxClientBundleSize ?? defaultMaxClientBundleSize;
  const actions = flattenActionRouter(options.actions);
  const platform = options.platform ? createTailorKitPlatformClient(options.platform) : undefined;
  const app = new H3();

  app.get("/apps", async (event) => {
    const context = requireHandlerContext(
      event.context.tailorkit as TailorKitHandlerContext | undefined,
    );

    const apps = await platform?.tailorkit.listApps({
      projectId: context.projectId,
      resourceId: context.resourceId,
    });

    if (apps === undefined) {
      throw HTTPError.status(501, "TailorKit Cloud app client is not configured");
    }

    return apps.map((app) =>
      toPublicApp(
        {
          description: app.description ?? undefined,
          id: app.id,
          name: app.name ?? undefined,
        },
        basePath,
      ),
    );
  });

  app.post("/actions/:path", async (event) => {
    const context = requireHandlerContext(
      event.context.tailorkit as TailorKitHandlerContext | undefined,
    );
    const actionPath = getRouterParam(event, "path", { decode: true });
    const implementation = actionPath ? actions.get(actionPath) : undefined;

    if (implementation === undefined) {
      throw HTTPError.status(404, "Action not found");
    }

    const requestContext = await validateSchema(
      options.schema.$internal.requestContext,
      context.requestContext,
    );
    const input = await validateSchema(
      (implementation.definition as ActionDefinition).input,
      await event.req.json(),
    );
    const output = await implementation.handler({ input, requestContext });

    return validateSchema((implementation.definition as ActionDefinition).output, output);
  });

  app.post("/apps/new-version", async (event) => {
    const context = requireHandlerContext(
      event.context.tailorkit as TailorKitHandlerContext | undefined,
    );
    const manifest = await event.req.json().catch(() => {});
    const upload = await platform?.tailorkit.createVersion({
      manifest,
      maxBytes: maxClientBundleSize,
      projectId: context.projectId,
      resourceId: context.resourceId,
    });

    if (upload === undefined) {
      throw HTTPError.status(501, "TailorKit Cloud upload client is not configured");
    }

    return upload;
  });

  app.post("/apps/publish", async (event) => {
    const context = requireHandlerContext(
      event.context.tailorkit as TailorKitHandlerContext | undefined,
    );
    const body = (await event.req.json().catch(() => ({}))) as { clientEntryUploadId?: string };

    if (!body.clientEntryUploadId) {
      throw HTTPError.status(400, "Missing client entry upload id");
    }

    const result = await platform?.tailorkit.publishVersion({
      clientEntryUploadId: body.clientEntryUploadId,
      projectId: context.projectId,
      resourceId: context.resourceId,
    });
    if (result === undefined) {
      throw HTTPError.status(501, "TailorKit Cloud upload client is not configured");
    }

    return result;
  });

  app.get("/apps/:appId/client.js", async (event) => {
    const context = requireHandlerContext(
      event.context.tailorkit as TailorKitHandlerContext | undefined,
    );
    const appId = getRouterParam(event, "appId", { decode: true });

    if (!appId) {
      throw HTTPError.status(404, "App not found");
    }

    const clientUrl = await platform?.tailorkit.getActiveClient({
      appId,
      projectId: context.projectId,
      resourceId: context.resourceId,
    });

    if (clientUrl === undefined) {
      throw HTTPError.status(501, "TailorKit Cloud app client is not configured");
    }

    return Response.redirect(clientUrl, 302);
  });

  return {
    $internal: { schema: options.schema },
    fetch: (request) => app.fetch(request),
    handler: (request, context) =>
      app.request(request, undefined, {
        tailorkit: context,
      }),
  };
}
