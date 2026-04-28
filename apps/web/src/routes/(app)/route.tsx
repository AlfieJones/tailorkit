import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)")({
  loader: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.user.getSession.queryOptions(),
    );
    if (!session.session) {
      throw redirect({
        search: { email: undefined, return_to: location.pathname },
        to: "/login",
      });
    }
  },
});
