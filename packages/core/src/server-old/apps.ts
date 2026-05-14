import type { PublicTailorKitApp, TailorKitServerApp } from "./types";

export function toPublicApp(app: TailorKitServerApp, basePath: string): PublicTailorKitApp {
  const publicApp: PublicTailorKitApp = {
    description: app.description,
    id: app.id,
    name: app.name,
  };

  if (app.clientUrl) {
    publicApp.clientPath = `${basePath}/apps/${encodeURIComponent(app.id)}/client.js`;
  } else if (app.clientPath) {
    publicApp.clientPath = app.clientPath;
  }

  return publicApp;
}

export function normalizeBasePath(basePath: string): string {
  const prefixed = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return prefixed.length > 1 ? prefixed.replace(/\/+$/u, "") : prefixed;
}
