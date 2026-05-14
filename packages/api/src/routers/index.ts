import type { RouterClient } from "@orpc/server";

import { userRouter } from "./user";
import { orgRouter } from "./org";
import { projectRouter } from "./project";
import { hostedAppRouter } from "./app";
import { tailorkitRouter } from "./tailorkit";

export const appRouter = {
  app: hostedAppRouter,
  user: userRouter,
  org: orgRouter,
  project: projectRouter,
  tailorkit: tailorkitRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
