import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug/")({
  loader: ({ params }) => {
    throw redirect({
      params: { orgSlug: params.orgSlug, projectSlug: params.projectSlug },
      to: "/$orgSlug/$projectSlug/apps",
    });
  },
});
