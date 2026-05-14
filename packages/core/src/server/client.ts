import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { TailorKitRouterClient } from "./router";

type HeaderInput = ConstructorParameters<typeof Headers>[0];

export interface TailorKitClientOptions {
  fetch?: typeof fetch;
  headers?: HeaderInput | (() => HeaderInput | Promise<HeaderInput>);
  url: string;
}

export function createTailorKitClient(options: TailorKitClientOptions): TailorKitRouterClient {
  const link = new RPCLink({
    async fetch(url, init) {
      const configuredHeaders = await (typeof options.headers === "function"
        ? options.headers()
        : options.headers);
      const headers = new Headers(configuredHeaders);
      new Headers((init as RequestInit | undefined)?.headers).forEach((value, key) => {
        headers.set(key, value);
      });

      return (options.fetch ?? fetch)(url, {
        ...init,
        headers,
      });
    },
    url: options.url,
  });

  return createORPCClient(link) as TailorKitRouterClient;
}
