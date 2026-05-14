import { ORPCError, os } from "@orpc/server";
import { devDelayMiddleware } from "@tailorkit/api-utils/dev-delay";
import { createRatelimiter, ratelimitMiddleware } from "@tailorkit/api-utils/rate-limiting";
import type { Context } from "./context";
import { db } from "@tailorkit/db";

const rateLimiter = createRatelimiter({ maxRequests: 100, window: 1000 });

export const o = os.$context<Context>().$route({
  inputStructure: "detailed",
  outputStructure: "detailed",
});

export const protectedRouter = o
  .use(devDelayMiddleware)
  .use(ratelimitMiddleware(rateLimiter, ({ context }) => context.organization.id));

export const requireApp = o.middleware(
  async ({ context, next }, input: { appId: string; resourceId: string }) => {
    const app = await db.query.app.findFirst({
      where: { id: input.appId, projectId: context.project.id, resourceId: input.resourceId },
    });

    if (!app) {
      throw new ORPCError("NOT_FOUND");
    }

    return next({ context: { ...context, app } });
  },
);
