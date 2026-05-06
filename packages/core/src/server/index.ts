export interface TailorKitServerApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}

export interface TailorKitServerOptions {
  apps?: TailorKitServerApp[] | (() => Promise<TailorKitServerApp[]> | TailorKitServerApp[]);
  basePath?: string;
}

export interface TailorKitServer {
  handler: (request: Request) => Promise<Response>;
}

interface PublicTailorKitApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}

export function createTailorKitServer(options: TailorKitServerOptions = {}): TailorKitServer {
  const basePath = normalizeBasePath(options.basePath ?? "/api/tailorkit");

  return {
    handler: async (request) => {
      const url = new URL(request.url);
      const pathname = trimBasePath(url.pathname, basePath);

      if (request.method !== "GET") {
        return json({ error: "Method not allowed" }, { status: 405 });
      }

      if (pathname === "/apps") {
        const apps = await loadApps(options.apps);

        return json(apps.map((app) => toPublicApp(app, basePath)));
      }

      const assetMatch = /^\/apps\/([^/]+)\/client\.js$/.exec(pathname);
      if (assetMatch) {
        const appId = decodeURIComponent(assetMatch[1] ?? "");
        const apps = await loadApps(options.apps);
        const app = apps.find((candidate) => candidate.id === appId);

        if (!app) {
          return json({ error: "App not found" }, { status: 404 });
        }

        if (!app.clientUrl) {
          return json({ error: "App does not define a proxied clientUrl" }, { status: 404 });
        }

        return proxyAppAsset(app.clientUrl);
      }

      return json({ error: "Not found" }, { status: 404 });
    },
  };
}

async function loadApps(
  apps: TailorKitServerOptions["apps"],
): Promise<readonly TailorKitServerApp[]> {
  if (apps === undefined) {
    return [];
  }

  return typeof apps === "function" ? apps() : apps;
}

function toPublicApp(app: TailorKitServerApp, basePath: string): PublicTailorKitApp {
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

async function proxyAppAsset(clientUrl: string): Promise<Response> {
  const upstream = await fetch(clientUrl);
  const headers = new Headers(upstream.headers);

  headers.set("cache-control", upstream.ok ? "no-store" : "no-cache");
  headers.set("content-type", headers.get("content-type") ?? "text/javascript; charset=utf-8");

  return new Response(upstream.body, {
    headers,
    status: upstream.status,
    statusText: upstream.statusText,
  });
}

function trimBasePath(pathname: string, basePath: string): string {
  if (pathname === basePath) {
    return "/";
  }

  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length);
  }

  return pathname;
}

function normalizeBasePath(basePath: string): string {
  const prefixed = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return prefixed.length > 1 ? prefixed.replace(/\/+$/, "") : prefixed;
}

function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}
