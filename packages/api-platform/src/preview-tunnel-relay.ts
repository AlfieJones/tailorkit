import { randomUUID } from "node:crypto";
import { maxAssetBytes } from "@tailorkit/asset-delivery";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";

const requestTimeoutMs = 25_000;
const maxInFlightRequestsPerSession = 8;
const maxEncodedPreviewResponseBytes = 4 * Math.ceil(maxAssetBytes / 3);
const responseChannelPattern = "preview-tunnel:responses:*";
const eventChannel = (sessionId: string) => `preview-tunnel:events:${sessionId}`;

export interface PreviewAssetRequest {
  id: string;
  method: "GET" | "HEAD";
  path: string;
  type: "request";
}

export interface PreviewAssetResponse {
  body: string;
  contentType: string;
  etag?: string;
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

function getRedis() {
  const kv = getKV();
  if (!kv || kv.type !== "redis") {
    throw new Error("Preview tunnels require KV_PROVIDER=redis.");
  }
  return kv.engine;
}

const requestChannel = (sessionId: string) => `preview-tunnel:requests:${sessionId}`;
const responseChannel = (requestId: string) => `preview-tunnel:responses:${requestId}`;

const pendingResponses = new Map<string, (response: PreviewAssetResponse) => void>();
const inFlightRequests = new Map<string, number>();
let responseSubscriber: ReturnType<typeof getRedis> | undefined;
let responseSubscriberReady: Promise<void> | undefined;

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
    (response.etag === undefined ||
      (typeof response.etag === "string" &&
        response.etag.length <= 128 &&
        !/[\r\n]/u.test(response.etag))) &&
    typeof response.body === "string" &&
    response.body.length <= maxEncodedPreviewResponseBytes &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(response.body)
  );
}

async function getResponseSubscriber() {
  if (!responseSubscriber) {
    const subscriber = getRedis().duplicate();
    subscriber.on("pmessage", (_pattern: string, _channel: string, message: string) => {
      try {
        const response = JSON.parse(message) as unknown;
        if (isPreviewAssetResponse(response)) {
          pendingResponses.get(response.id)?.(response);
        }
      } catch {
        // Ignore malformed transport messages.
      }
    });
    responseSubscriber = subscriber;
    responseSubscriberReady = subscriber.psubscribe(responseChannelPattern).then(() => {});
  }
  await responseSubscriberReady;
  return responseSubscriber;
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
  if (!kv || kv.type !== "redis") {
    throw new Error("Preview tunnels require KV_PROVIDER=redis.");
  }
  const connection = await createPreviewTunnelPresence(kv).get(sessionId);
  if (!connection) {
    return null;
  }

  const release = acquireRequestSlot(sessionId);
  const requestId = randomUUID();
  try {
    await getResponseSubscriber();
    const response = await new Promise<PreviewAssetResponse | null>((resolve) => {
      const timeout = setTimeout(() => {
        pendingResponses.delete(requestId);
        resolve(null);
      }, requestTimeoutMs);
      pendingResponses.set(requestId, (value) => {
        clearTimeout(timeout);
        pendingResponses.delete(requestId);
        resolve(value);
      });
      void getRedis().publish(
        requestChannel(sessionId),
        JSON.stringify({
          connectionId: connection.connectionId,
          id: requestId,
          method,
          path,
          type: "request",
        } satisfies PreviewAssetRequest & { connectionId: string }),
      );
    });
    return response;
  } finally {
    release();
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
  return () => Promise.resolve(subscriber.disconnect());
}

export async function publishPreviewAssetResponse(response: PreviewAssetResponse): Promise<void> {
  if (!isPreviewAssetResponse(response)) {
    throw new TypeError("Invalid preview tunnel response.");
  }
  await getRedis().publish(responseChannel(response.id), JSON.stringify(response));
}

export async function publishPreviewEvent(
  sessionId: string,
  type: "build" | "ended",
): Promise<void> {
  await getRedis().publish(eventChannel(sessionId), JSON.stringify({ type }));
}

export async function subscribePreviewEvents(
  sessionId: string,
  send: (type: "build" | "ended") => void,
): Promise<() => Promise<void>> {
  const subscriber = getRedis().duplicate();
  const channel = eventChannel(sessionId);
  subscriber.on("message", (_channel: string, message: string) => {
    try {
      const value = JSON.parse(message) as { type?: unknown };
      if (value.type === "build" || value.type === "ended") {
        send(value.type);
      }
    } catch {
      // Ignore malformed transport messages.
    }
  });
  await subscriber.subscribe(channel);
  return () => {
    subscriber.disconnect();
    return Promise.resolve();
  };
}
