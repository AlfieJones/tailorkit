import { createFileRoute, notFound } from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";

export const Route = createFileRoute("/(app)/$orgSlug")({
  errorComponent: NotFound,
  notFoundComponent: NotFound,
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      context.orpc.user.getOrg.queryOptions({ input: { orgSlug: params.orgSlug } }),
    );
    if (!org) {
      throw notFound();
    }
  },
});
