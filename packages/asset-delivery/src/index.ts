const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const assetPath = new RegExp(`^/p/(${uuid})/a/(${uuid})/d/(${uuid})/client\\.js$`, "u");
const teamIdPattern = /^[a-z0-9][a-z0-9-]{12}[a-z0-9]$/u;
const nodeAssetPath = /^\/api\/assets\/t\/([^/]+)(\/p\/.*)$/u;
const methods = new Set(["GET", "HEAD", "OPTIONS"]);

export const maxAssetBytes = 1024 * 1024;

export interface AssetIdentity {
  appId: string;
  deploymentId: string;
  key: string;
  projectId: string;
  publicTeamId: string;
}

function createIdentity(publicTeamId: string, pathname: string): AssetIdentity | undefined {
  const match = assetPath.exec(pathname);
  if (!teamIdPattern.test(publicTeamId) || !match) {
    return;
  }
  const [, projectId, appId, deploymentId] = match;
  if (!projectId || !appId || !deploymentId) {
    return;
  }
  return {
    appId,
    deploymentId,
    key: `teams/${publicTeamId}/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`,
    projectId,
    publicTeamId,
  };
}

export function parseHostedAssetRequest(
  request: Request,
  assetDomain: string,
): AssetIdentity | undefined {
  const url = new URL(request.url);
  const suffix = `.${assetDomain}`;
  if (url.protocol !== "https:" || url.port || url.search || !url.hostname.endsWith(suffix)) {
    return;
  }
  return createIdentity(url.hostname.slice(0, -suffix.length), url.pathname);
}

export function parseNodeAssetRequest(request: Request): AssetIdentity | undefined {
  const url = new URL(request.url);
  if (url.search) {
    return;
  }
  const match = nodeAssetPath.exec(url.pathname);
  if (!match) {
    return;
  }
  const [, publicTeamId, assetPathname] = match;
  if (!publicTeamId || !assetPathname) {
    return;
  }
  return createIdentity(publicTeamId, assetPathname);
}

export function isAssetMethod(method: string): boolean {
  return methods.has(method);
}

export function isValidAssetSize(size: number | undefined): size is number {
  return size !== undefined && size >= 1 && size <= maxAssetBytes;
}

export function assetFailure(status: number): Response {
  return new Response(null, {
    status,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
}

export function assetPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export function assetHeaders(input: { contentLength: number; etag?: string }): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(input.contentLength),
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Content-Type": "application/javascript; charset=utf-8",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  if (input.etag) {
    headers.set("ETag", input.etag);
  }
  return headers;
}
