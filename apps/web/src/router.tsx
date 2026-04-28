import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import "./index.css";
import { routeTree } from "./routeTree.gen";
import { orpc, getQueryClient } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = getQueryClient();

  const router = createRouter({
    context: { orpc, queryClient },
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
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
