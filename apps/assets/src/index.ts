import {
  assetFailure,
  assetHeaders,
  assetPreflight,
  isAssetMethod,
  isValidAssetSize,
  parseHostedAssetRequest,
} from "@tailorkit/asset-delivery";

export default {
  async fetch(request, env) {
    if (new URL(request.url).protocol !== "https:") {
      return assetFailure(400);
    }
    const identity = parseHostedAssetRequest(request, env.ASSET_DOMAIN);
    if (!identity) {
      return assetFailure(404);
    }
    if (!isAssetMethod(request.method)) {
      return assetFailure(405);
    }
    if (request.method === "OPTIONS") {
      return assetPreflight();
    }

    try {
      if (request.method === "HEAD") {
        const object = await env.ASSETS.head(identity.key);
        if (!object || !isValidAssetSize(object.size)) {
          return assetFailure(404);
        }
        return new Response(null, {
          headers: assetHeaders({ contentLength: object.size, etag: object.httpEtag }),
        });
      }
      const object = await env.ASSETS.get(identity.key);
      if (!object || !isValidAssetSize(object.size)) {
        return assetFailure(404);
      }
      return new Response(object.body, {
        headers: assetHeaders({ contentLength: object.size, etag: object.httpEtag }),
      });
    } catch {
      console.error(
        JSON.stringify({
          message: "Asset delivery failed",
          hostname: new URL(request.url).hostname,
        }),
      );
      return assetFailure(503);
    }
  },
} satisfies ExportedHandler<Env>;
