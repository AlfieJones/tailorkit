import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import type { PreviewTunnelRouterClient } from "@tailorkit/api-platform/preview-tunnel";

/** Creates the typed oRPC client for an authenticated preview tunnel WebSocket. */
export function createPreviewTunnelClient(websocket: WebSocket): PreviewTunnelRouterClient {
  return createORPCClient(new RPCLink({ websocket })) as PreviewTunnelRouterClient;
}
