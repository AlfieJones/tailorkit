import type { RouterClient } from "@orpc/server";

import { appRouter } from "./routes/apps";
import { deploymentRouter } from "./routes/deployments";

export const platformRouter = {
  apps: appRouter,
  deployments: deploymentRouter,
};

export type PlatformRouter = typeof platformRouter;
export type PlatformRouterClient = RouterClient<PlatformRouter>;
