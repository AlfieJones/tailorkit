import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/$orgSlug/~/(org)/settings")({
  component: () => <Outlet />,
});
