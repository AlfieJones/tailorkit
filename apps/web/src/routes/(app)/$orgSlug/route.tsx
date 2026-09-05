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
        if (!(await getActiveOrg())) {
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
