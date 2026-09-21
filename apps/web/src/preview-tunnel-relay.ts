import { randomUUID } from "node:crypto";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";

const requestTimeoutMs = 25_000;

export interface PreviewAssetRequest {
  id: string;
  method: "GET" | "HEAD";
  path: string;
  type: "request";
}

export interface PreviewAssetResponse {
  body: string;
  headers: Record<string, string>;
  id: string;
  status: number;
  type: "response";
}

function getRedis() {
  const kv = getKV();
  if (!kv || kv.type !== "redis") {
    throw new Error("Preview tunnels require KV_PROVIDER=redis.");
  }
  return kv.engine;
}

const requestChannel = (sessionId: string) => `preview-tunnel:requests:${sessionId}`;
const responseChannel = (requestId: string) => `preview-tunnel:responses:${requestId}`;

export async function requestPreviewAsset(
  sessionId: string,
  path: string,
  method: "GET" | "HEAD",
): Promise<PreviewAssetResponse | null> {
  const kv = getKV();
  if (!kv || kv.type !== "redis") {
    throw new Error("Preview tunnels require KV_PROVIDER=redis.");
  }
  const connection = await createPreviewTunnelPresence(kv).get(sessionId);
  if (!connection) {
    return null;
  }

  const requestId = randomUUID();
  const subscriber = getRedis().duplicate();
  const channel = responseChannel(requestId);
  try {
    const response = await new Promise<PreviewAssetResponse | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), requestTimeoutMs);
      subscriber.on("message", (_channel: string, message: string) => {
        try {
          const value = JSON.parse(message) as PreviewAssetResponse;
          if (value.type === "response" && value.id === requestId) {
            clearTimeout(timeout);
            resolve(value);
          }
        } catch {
          // Ignore malformed transport messages.
        }
      });
      void subscriber.subscribe(channel).then(() =>
        getRedis().publish(
          requestChannel(sessionId),
          JSON.stringify({
            connectionId: connection.connectionId,
            id: requestId,
            method,
            path,
            type: "request",
          } satisfies PreviewAssetRequest & { connectionId: string }),
        ),
      );
    });
    return response;
  } finally {
    subscriber.disconnect();
  }
}

export async function subscribePreviewTunnel(
  sessionId: string,
  connectionId: string,
  send: (request: PreviewAssetRequest) => void,
): Promise<() => void> {
  const subscriber = getRedis().duplicate();
  const channel = requestChannel(sessionId);
  subscriber.on("message", (_channel: string, message: string) => {
    try {
      const value = JSON.parse(message) as PreviewAssetRequest & { connectionId?: string };
      if (value.type === "request" && value.connectionId === connectionId) {
        send(value);
      }
    } catch {
      // Ignore malformed transport messages.
    }
  });
  await subscriber.subscribe(channel);
  return () => subscriber.disconnect();
}

export async function publishPreviewAssetResponse(response: PreviewAssetResponse): Promise<void> {
  await getRedis().publish(responseChannel(response.id), JSON.stringify(response));
}
