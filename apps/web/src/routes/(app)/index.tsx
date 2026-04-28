import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const getActiveOrgId = createIsomorphicFn()
  .server(() => getCookie("active-org-id"))
  .client(() => sessionStorage.getItem("active-org-id") ?? "");

export const Route = createFileRoute("/(app)/")({
  component: () => null,
  loader: async ({ context }) => {
    const orgs = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrgs.queryOptions(),
    );

    const orgId = getActiveOrgId();
    const org = orgs.find((org) => org.id === orgId) || orgs[0];
    if (org) {
      throw redirect({ params: { orgSlug: org.slug }, to: "/$orgSlug" });
    }

    throw redirect({ to: "/onboarding" });
  },
});
