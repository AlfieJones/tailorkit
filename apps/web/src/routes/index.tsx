import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearActiveOrg, getActiveOrg } from "#lib/active-org";

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

    const activeOrg = await getActiveOrg();
    const orgs = await context.queryClient
      .ensureQueryData(context.orpc.user.getOrgs.queryOptions())
      .catch(async (error: unknown) => {
        if (!activeOrg) {
          throw error;
        }

        await clearActiveOrg();
        // Retry with a fresh request after removing the saved selection. If the
        // query still fails without it, surface the error instead of looping.
        throw redirect({ to: "/", replace: true, reloadDocument: true });
      });

    // The cookie stores a slug; accept IDs saved by older clients as well.
    const selectedOrg = orgs.find((org) => org.slug === activeOrg || org.id === activeOrg);
    if (activeOrg && !selectedOrg) {
      await clearActiveOrg();
    }
    const org = selectedOrg ?? orgs[0];
    if (org?.slug) {
      throw redirect({ params: { orgSlug: org.slug }, to: "/$orgSlug/~/projects" });
    }

    throw redirect({ to: "/onboarding" });
  },
});
