import { eventIterator, EventPublisher, os } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import z from "zod";
import { publishPreviewAssetResponse, subscribePreviewTunnel } from "./preview-tunnel-relay";
import type { PreviewAssetRequest } from "./preview-tunnel-relay";

export interface PreviewTunnelContext {
  activate: () => void;
  connectionId: string;
  deactivate: () => void;
  sessionId: string;
}

const previewAssetRequest = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u),
  method: z.enum(["GET", "HEAD"]),
  path: z.string().regex(/^\/(?!\/|\\)[^\\]*$/u),
  type: z.literal("request"),
});

const previewAssetResponse = z.object({
  body: z.string(),
  contentType: z.string(),
  etag: z.string().optional(),
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u),
  status: z.int().min(100).max(599),
  type: z.literal("response"),
});

const o = os.$context<PreviewTunnelContext>();

const connect = o.output(eventIterator(previewAssetRequest)).handler(async function* connect({
  context,
}) {
  const requests = new EventPublisher<{ request: PreviewAssetRequest }>();
  const unsubscribe = await subscribePreviewTunnel(
    context.sessionId,
    context.connectionId,
    (request) => requests.publish("request", request),
  );
  context.activate();

  try {
    yield* requests.subscribe("request");
  } finally {
    context.deactivate();
    await unsubscribe();
  }
});

const respond = o
  .input(previewAssetResponse)
  .handler(({ input }) => publishPreviewAssetResponse(input));

export const previewTunnelRouter = { connect, respond };
export type PreviewTunnelRouterClient = RouterClient<typeof previewTunnelRouter>;
