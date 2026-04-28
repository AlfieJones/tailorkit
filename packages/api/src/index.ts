import type { InferClientErrorUnion } from "@orpc/client";
import { appRouter } from "./routers/index";
import type { AppRouter, AppRouterClient } from "./routers/index";
import type { RouterClient } from "@orpc/server";

type AppError = InferClientErrorUnion<RouterClient<AppRouter>>;
export { appRouter, type AppRouter, type AppRouterClient, type AppError };
export { createContext } from "./context";
