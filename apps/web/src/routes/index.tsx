import { createFileRoute, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";

const sessionCookieNames = ["tailorkit.session_token", "tailorkit-dev.session_token"] as const;

const getActiveOrgId = createIsomorphicFn()
  .server(() => getCookie("active-org-id"))
  .client(() => sessionStorage.getItem("active-org-id") ?? "");

const clearSessionCookies = createIsomorphicFn()
  .server(() => {
    sessionCookieNames.forEach((name) =>
      deleteCookie(name, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );

    deleteCookie("active-org-id", {
      path: "/",
      sameSite: "lax",
    });
  })
  .client(() => {});

export const Route = createFileRoute("/")({
  component: () => null,
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.user.getSession.queryOptions(),
    );

    if (!session.session) {
      await clearSessionCookies();

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
