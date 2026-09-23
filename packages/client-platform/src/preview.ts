import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";

export interface PreviewFileManifest {
  path: string;
  contentType: string;
  size: number;
  chunks: number;
  sha256: string;
}

export interface PreviewBuildManifest {
  files: PreviewFileManifest[];
}

export type PreviewEvent =
  | { type: "begin"; buildId: string; revision: number; manifest: PreviewBuildManifest }
  | { type: "chunk"; revision: number; fileIndex: number; chunkIndex: number; base64: string }
  | { type: "complete"; revision: number }
  | { type: "ended" };

export interface PreviewWebSocketClient {
  beginBuild(input: { manifest: PreviewBuildManifest }): Promise<{ buildId: string }>;
  uploadChunk(input: {
    buildId: string;
    fileIndex: number;
    chunkIndex: number;
    base64: string;
  }): Promise<{ accepted: true }>;
  commitBuild(input: { buildId: string }): Promise<{ revision: number }>;
  heartbeat(): Promise<{ accepted: true }>;
  subscribe(): Promise<AsyncIterable<PreviewEvent>>;
}

/** Typed client for the shared platform preview WebSocket. */
export function createPreviewWebSocketClient(websocket: WebSocket): PreviewWebSocketClient {
  return createORPCClient(new RPCLink({ websocket })) as unknown as PreviewWebSocketClient;
}
