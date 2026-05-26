import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const getActiveOrgId = createIsomorphicFn()
  .server(() => getCookie("active-org-id"))
  .client(() => sessionStorage.getItem("active-org-id") ?? "");

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

    const orgId = getActiveOrgId();
    const org = orgs.find((org) => org.id === orgId) || orgs[0];
    if (org?.slug) {
      throw redirect({ params: { orgSlug: org.slug }, to: "/$orgSlug/~/projects" });
    }

    throw redirect({ to: "/onboarding" });
  },
});
