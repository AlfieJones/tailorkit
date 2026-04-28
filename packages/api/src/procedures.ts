import { ORPCError, os } from "@orpc/server";
import { auth } from "@tailorkit/auth";
import { db } from "@tailorkit/db";
import { env } from "@tailorkit/env/server";
import { ratelimitMiddleware } from "./rate-limiting";
import type { Context } from "./context";
import type { ac } from "@tailorkit/auth/lib/permissions";

export const o = os.$context<Context>().errors({
  UNAUTHORIZED: {},
  NOT_FOUND: {},
  FORBIDDEN: {},
  BAD_REQUEST: {},
  TOO_MANY_REQUESTS: {},
});

const timingMiddleware = o.middleware(async ({ path, next }) => {
  const start = Date.now();

  if (env.NODE_ENV === "development") {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[ORPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = o.use(timingMiddleware).use(ratelimitMiddleware);

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session || !context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: context.session,
      user: context.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

type OrgPermissions = Partial<{
  [K in keyof (typeof ac)["statements"]]: (typeof ac)["statements"][K][number][];
}>;

/**
 * Resolves an org from `orgSlug` or `orgId` and adds it to context.
 * Optionally checks permissions — if omitted, only the org lookup is performed.
 *
 * Map the input when your procedure's shape differs from the middleware's expected input.
 *
 * @example
 * // resolve only
 * protectedProcedure
 *   .input(z.object({ orgSlug: z.string() }))
 *   .use(requireOrg())
 *   .handler(async ({ context }) => context.org)
 *
 * // with permission check + input mapping
 * protectedProcedure
 *   .input(z.object({ slug: z.string() }))
 *   .use(requireOrg({ member: ["invite"] }), input => ({ orgSlug: input.slug }))
 *   .handler(async ({ context }) => context.org)
 */
export function requireOrg(permissions?: OrgPermissions) {
  return o.middleware(async ({ context, next }, input: { orgSlug: string } | { orgId: string }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const org = await ("orgSlug" in input
      ? db.query.organization.findFirst({
          where: { slug: input.orgSlug, members: { userId: context.user.id } },
        })
      : db.query.organization.findFirst({
          where: { id: input.orgId, members: { userId: context.user.id } },
        }));

    if (!org) {
      throw new ORPCError("NOT_FOUND");
    }

    if (permissions) {
      const result = await auth.api.hasPermission({
        headers: context.headers,
        body: {
          organizationId: org.id,
          permissions,
        },
      });

      if (!result.success) {
        throw new ORPCError("FORBIDDEN");
      }
    }

    return next({ context: { org } });
  });
}
