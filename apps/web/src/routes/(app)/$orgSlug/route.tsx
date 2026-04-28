import { createFileRoute, notFound } from "@tanstack/react-router";
export const Route = createFileRoute("/(app)/$orgSlug")({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrg.queryOptions({ input: { orgSlug: params.orgSlug } }),
    );
    if (!org) {
      throw notFound();
    }
  },
});
