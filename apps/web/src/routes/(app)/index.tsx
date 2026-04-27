import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const getActiveOrgId = createIsomorphicFn()
  .server(() => getCookie("active-org-id"))
  .client(() => sessionStorage.getItem("active-org-id") ?? "");

export const Route = createFileRoute("/(app)/")({
  component: () => null,
  loader: async ({ context }) => {
    const [session, orgs] = await Promise.allSettled([
      context.queryClient.ensureQueryData(context.orpc.user.getSession.queryOptions()),
      context.queryClient.ensureQueryData(context.orpc.user.getOrgs.queryOptions()),
    ]);

    if (session.status === "rejected") {
      throw new Error("Something went wrong", { cause: session.reason });
    } else if (!!session.value.user || !!session.value.session) {
      throw redirect({ to: "/login" });
    }

    if (orgs.status === "rejected") {
      throw new Error("Something went wrong", { cause: orgs.reason });
    }

    const orgId = getActiveOrgId();
    const org = orgs.value.find((org) => org.id === orgId) || orgs.value[0];
    if (org) {
      throw redirect({ params: { orgSlug: org.id }, to: "/$orgSlug" });
    }

    throw redirect({ to: "/settings" });
  },
});
