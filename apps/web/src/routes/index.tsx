import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearActiveOrg, getActiveOrgSlug } from "#lib/active-org";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.user.getSession.queryOptions(),
    );

    if (!session.session) {
      throw redirect({
        replace: true,
        search: { email: undefined, return_to: undefined },
        to: "/login",
      });
    }

    const orgs = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrgs.queryOptions(),
    );

    const activeOrgSlug = getActiveOrgSlug();
    const activeOrg = orgs.find((org) => org.slug === activeOrgSlug);
    if (activeOrgSlug && !activeOrg) {
      await clearActiveOrg();
    }

    const org = activeOrg ?? orgs[0];
    if (org?.slug) {
      throw redirect({ params: { orgSlug: org.slug }, to: "/$orgSlug/~/projects" });
    }

    throw redirect({ to: "/onboarding" });
  },
});
