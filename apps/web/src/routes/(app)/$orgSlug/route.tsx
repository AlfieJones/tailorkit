import { createFileRoute, redirect } from "@tanstack/react-router";

import { NotFound } from "#components/not-found";
import { clearActiveOrg } from "#lib/active-org";

export const Route = createFileRoute("/(app)/$orgSlug")({
  errorComponent: NotFound,
  notFoundComponent: NotFound,
  loader: async ({ context, params }) => {
    const orgs = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrgs.queryOptions(),
    );
    if (!orgs.some((org) => org.slug === params.orgSlug)) {
      await clearActiveOrg();
      throw redirect({ to: orgs.length === 0 ? "/account/request-organization" : "/" });
    }

    const org = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrg.queryOptions({ input: { orgSlug: params.orgSlug } }),
    );
    if (!org) {
      throw redirect({ to: "/" });
    }
  },
});
