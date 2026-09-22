import { randomUUID } from "node:crypto";
import { maxAssetBytes } from "@tailorkit/asset-delivery";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";
import type { Unsubscribe } from "@tailorkit/kv";

const requestTimeoutMs = 25_000;
const maxInFlightRequestsPerSession = 8;
const maxEncodedPreviewResponseBytes = 4 * Math.ceil(maxAssetBytes / 3);

export interface PreviewAssetRequest {
  id: string;
  method: "GET" | "HEAD";
  path: string;
  type: "request";
}

export interface PreviewAssetResponse {
  body: string;
  contentType: string;
  id: string;
  status: number;
  type: "response";
}

export class PreviewTunnelOverloadedError extends Error {
  constructor() {
    super("Preview tunnel is busy.");
    this.name = "PreviewTunnelOverloadedError";
  }
}

const requestChannel = (sessionId: string) => `preview-tunnel:requests:${sessionId}`;
const responseChannel = (requestId: string) => `preview-tunnel:responses:${requestId}`;

const inFlightRequests = new Map<string, number>();

function isPreviewAssetResponse(value: unknown): value is PreviewAssetResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const response = value as Partial<PreviewAssetResponse>;
  return (
    response.type === "response" &&
    typeof response.id === "string" &&
    /^[a-zA-Z0-9_-]{1,128}$/u.test(response.id) &&
    typeof response.status === "number" &&
    Number.isInteger(response.status) &&
    response.status >= 100 &&
    response.status <= 599 &&
    typeof response.contentType === "string" &&
    response.contentType.length > 0 &&
    response.contentType.length <= 255 &&
    !/[\r\n]/u.test(response.contentType) &&
    typeof response.body === "string" &&
    response.body.length <= maxEncodedPreviewResponseBytes &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(response.body)
  );
}

function acquireRequestSlot(sessionId: string): () => void {
  const count = inFlightRequests.get(sessionId) ?? 0;
  if (count >= maxInFlightRequestsPerSession) {
    throw new PreviewTunnelOverloadedError();
  }
  inFlightRequests.set(sessionId, count + 1);
  return () => {
    if (count === 0) {
      inFlightRequests.delete(sessionId);
    } else {
      inFlightRequests.set(sessionId, count);
    }
  };
}

export async function requestPreviewAsset(
  sessionId: string,
  path: string,
  method: "GET" | "HEAD",
): Promise<PreviewAssetResponse | null> {
  const kv = getKV();
  if (!kv) {
    throw new Error("Preview tunnels require a configured KV provider.");
  }
  const connection = await createPreviewTunnelPresence(kv).get(sessionId);
  if (!connection) {
    return null;
  }

  const release = acquireRequestSlot(sessionId);
  const requestId = randomUUID();
  try {
    let resolveResponse: (value: PreviewAssetResponse | null) => void;
    const response = new Promise<PreviewAssetResponse | null>((resolve) => {
      resolveResponse = resolve;
    });
    const unsubscribe = await kv.subscribe(responseChannel(requestId), (message) => {
      try {
        const value = JSON.parse(message) as unknown;
        if (isPreviewAssetResponse(value) && value.id === requestId) {
          resolveResponse(value);
        }
      } catch {
        // Ignore malformed transport messages.
      }
    });
    const timeout = setTimeout(() => resolveResponse(null), requestTimeoutMs);

    try {
      return await Promise.race([
        response,
        kv
          .publish(
            requestChannel(sessionId),
            JSON.stringify({
              connectionId: connection.connectionId,
              id: requestId,
              method,
              path,
              type: "request",
            } satisfies PreviewAssetRequest & { connectionId: string }),
          )
          .then(() => response),
      ]);
    } finally {
      clearTimeout(timeout);
      void unsubscribe().catch(() => {
        // A best-effort subscriber teardown must not change the preview result.
      });
    }
  } finally {
    release();
  }
}

export async function subscribePreviewTunnel(
  sessionId: string,
  connectionId: string,
  send: (request: PreviewAssetRequest) => void,
): Promise<Unsubscribe> {
  const kv = getKV();
  if (!kv) {
    throw new Error("Preview tunnels require a configured KV provider.");
  }
  const channel = requestChannel(sessionId);
  const unsubscribe = await kv.subscribe(channel, (message) => {
    try {
      const value = JSON.parse(message) as PreviewAssetRequest & { connectionId?: string };
      if (value.type === "request" && value.connectionId === connectionId) {
        send(value);
      }
    } catch {
      // Ignore malformed transport messages.
    }
  });
  return unsubscribe;
}

export async function publishPreviewAssetResponse(response: PreviewAssetResponse): Promise<void> {
  if (!isPreviewAssetResponse(response)) {
    throw new TypeError("Invalid preview tunnel response.");
  }
  const kv = getKV();
  if (!kv) {
    throw new Error("Preview tunnels require a configured KV provider.");
  }
  await kv.publish(responseChannel(response.id), JSON.stringify(response));
}
