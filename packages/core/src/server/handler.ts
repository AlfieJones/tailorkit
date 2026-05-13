import { getRouterParam, H3, HTTPError } from "h3";
import type { ComponentDefinition, ScreenDefinition } from "../schema";
import { loadApps, normalizeBasePath, toPublicApp } from "./apps";
import { proxyAppAsset } from "./assets";
import type { TailorKitServer, TailorKitServerOptions } from "./types";

export function createTailorKitServer<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition>,
>(options: TailorKitServerOptions<TComponents, TScreens>): TailorKitServer {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");
  const app = new H3();

  app.get("/apps", async () => {
    const apps = await loadApps(options.apps);

    return apps.map((app) => toPublicApp(app, basePath));
  });

  app.get("/apps/:appId/client.js", async (event) => {
    const appId = getRouterParam(event, "appId", { decode: true });
    const apps = await loadApps(options.apps);
    const app = apps.find((candidate) => candidate.id === appId);

    if (!app) {
      throw HTTPError.status(404, "App not found");
    }

    if (!app.clientUrl) {
      throw HTTPError.status(404, "App does not define a proxied clientUrl");
    }

    return proxyAppAsset(app.clientUrl);
  });

  return {
    handler: app.handler,
  };
}
