import type { RouterClient } from "@orpc/server";

import { userRouter } from "./user";

export const appRouter = {
  user: userRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
