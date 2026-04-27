import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)")({
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.user.getSession.queryOptions(),
    );

    if (!session.session || !session.user) {
      throw redirect({ to: "/login" });
    }
  },
});
