import { createORPCClient, isDefinedError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { createRouterClient } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppError } from "@tailorkit/api";
import { createContext } from "@tailorkit/api";
import { appRouter } from "@tailorkit/api/routers/index";
import { toastManager } from "@tailorkit/ui/components/toast";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const serializer = new StandardRPCJsonSerializer();

const createQueryClient = (isBrowser: boolean) =>
  new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
        shouldDehydrateQuery: () => true,
        shouldRedactErrors: () => false,
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta);
        },
      },
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        // TODO improve this to retry requets with timeouts or too many tries etc
        retry: (count, error: AppError) =>
          isBrowser &&
          !(isDefinedError(error) && error.status >= 400 && error.status < 500) &&
          count < 3,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isBrowser) {
          toastManager.add({
            actionProps: {
              children: "retry",
              onClick: query.invalidate,
            },
            description: error.message,
            title: "Something went wrong",
            type: "error",
          });
        }
      },
    }),
  });

let browserQueryClient: QueryClient | undefined;
export const getQueryClient = createIsomorphicFn()
  .server(() => createQueryClient(false))
  .client(() => {
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient(true);
    }
    return browserQueryClient;
  });

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: () => createContext({ request: getRequest() }),
    }),
  )
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      url: `${window.location.origin}/api/rpc`,
    });

    return createORPCClient(link);
  });

export const client: RouterClient<typeof appRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
