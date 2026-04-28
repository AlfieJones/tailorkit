import type { RouterClient } from "@orpc/server";

import { userRouter } from "./user";
import { orgRouter } from "./org";

export const appRouter = {
  user: userRouter,
  org: orgRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
