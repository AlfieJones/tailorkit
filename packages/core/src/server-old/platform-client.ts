import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

type HeaderInput = ConstructorParameters<typeof Headers>[0];

export interface PlatformApp {
  description?: string | null;
  id: string;
  name?: string | null;
}

export interface TailorKitPlatformClient {
  tailorkit: {
    createVersion: (input: {
      manifest?: unknown;
      maxBytes: number;
      projectId: string;
      resourceId: string;
    }) => Promise<{
      clientEntryUploadId?: string;
      headers?: Record<string, string>;
      id: string;
      maxBytes?: number;
      uploadUrl: string;
    }>;
    getActiveClient: (input: {
      appId: string;
      projectId: string;
      resourceId: string;
    }) => Promise<string>;
    listApps: (input: { projectId: string; resourceId: string }) => Promise<readonly PlatformApp[]>;
    publishVersion: (input: {
      clientEntryUploadId: string;
      projectId: string;
      resourceId: string;
    }) => Promise<unknown>;
  };
}

export interface TailorKitPlatformOptions {
  fetch?: typeof fetch;
  headers?: HeaderInput | (() => HeaderInput | Promise<HeaderInput>);
  rpcUrl: string;
}

export function createTailorKitPlatformClient(
  options: TailorKitPlatformOptions,
): TailorKitPlatformClient {
  const link = new RPCLink({
    async fetch(url, init) {
      const headers = await (typeof options.headers === "function"
        ? options.headers()
        : options.headers);
      const mergedHeaders = new Headers(headers);
      new Headers((init as { headers?: HeaderInput } | undefined)?.headers).forEach(
        (value, key) => {
          mergedHeaders.set(key, value);
        },
      );
      return (options.fetch ?? fetch)(url, {
        ...init,
        headers: mergedHeaders,
      });
    },
    url: options.rpcUrl,
  });

  return createORPCClient(link) as unknown as TailorKitPlatformClient;
}
