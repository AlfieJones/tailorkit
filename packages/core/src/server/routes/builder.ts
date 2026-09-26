import { z } from "zod";
import {
  builderApps,
  builderCreateApp,
  builderPublish,
  builderRun,
} from "@tailorkit/client-platform/client";
import { getTailorKitScopeId, o, requireHostAuth } from "../procedures";

function origin(context: { request: Request }): string {
  return new URL(context.request.url).origin;
}

export const builderRouter = {
  apps: o.use(requireHostAuth).handler(({ context }) =>
    builderApps({
      client: context.platform,
      headers: context.platformHeaders,
      query: { scopeId: getTailorKitScopeId(context), origin: origin(context) },
      throwOnError: true,
    }),
  ),
  createApp: o
    .use(requireHostAuth)
    .input(
      z.object({ name: z.string().min(1).max(127), description: z.string().max(255).optional() }),
    )
    .handler(({ context, input }) =>
      builderCreateApp({
        body: { ...input, origin: origin(context), scopeId: getTailorKitScopeId(context) },
        client: context.platform,
        headers: context.platformHeaders,
        throwOnError: true,
      }),
    ),
  send: o
    .use(requireHostAuth)
    .input(
      z.object({
        appId: z.string(),
        prompt: z.string().trim().min(1).max(20_000),
        conversationId: z.string().uuid().optional(),
      }),
    )
    .handler(({ context, input }) =>
      builderRun({
        body: { ...input, origin: origin(context), scopeId: getTailorKitScopeId(context) },
        client: context.platform,
        headers: context.platformHeaders,
        throwOnError: true,
      }),
    ),
  publish: o
    .use(requireHostAuth)
    .input(z.object({ runId: z.string().uuid() }))
    .handler(({ context, input }) =>
      builderPublish({
        body: { origin: origin(context), scopeId: getTailorKitScopeId(context) },
        client: context.platform,
        headers: context.platformHeaders,
        path: { runId: input.runId },
        throwOnError: true,
      }),
    ),
};
