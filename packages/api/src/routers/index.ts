import type { RouterClient } from "@orpc/server";

import { userRouter } from "./user";
import { orgRouter } from "./org";
import { projectRouter } from "./project";

export const appRouter = {
  user: userRouter,
  org: orgRouter,
  project: projectRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
