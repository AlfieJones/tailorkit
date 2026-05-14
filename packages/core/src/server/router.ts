import type { RouterClient } from "@orpc/server";
import { actionRouter } from "./routes/actions";
import { appRouter } from "./routes/apps";
import { deploymentRouter } from "./routes/deployments";

export const tailorkitRouter = {
  actions: actionRouter,
  apps: appRouter,
  deployments: deploymentRouter,
};

export type TailorKitRouter = typeof tailorkitRouter;
export type TailorKitRouterClient = RouterClient<TailorKitRouter>;
