import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import { getQueryClient, orpc } from "./lib/orpc";

export const getRouter = () => {
  const queryClient = getQueryClient();

  const router = createRouter({
    context: { queryClient, orpc },
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: NotFound,
  });

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
