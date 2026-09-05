import { ORPCError } from "@orpc/client";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { clearActiveOrg, getActiveOrg } from "#lib/active-org";

import { NotFound } from "#components/not-found";

export const Route = createFileRoute("/(app)/$orgSlug")({
  errorComponent: NotFound,
  notFoundComponent: NotFound,
  loader: async ({ context, params }) => {
    const org = await context.queryClient
      .ensureQueryData(
        context.orpc.user.getOrg.queryOptions({ input: { orgSlug: params.orgSlug } }),
      )
      .catch(async (error: unknown) => {
        if (
          !(error instanceof ORPCError) ||
          error.code !== "NOT_FOUND" ||
          (await getActiveOrg()) !== params.orgSlug
        ) {
          throw error;
        }

        await clearActiveOrg();
        throw redirect({ to: "/", replace: true, reloadDocument: true });
      });
    if (!org) {
      throw notFound();
    }
  },
});
