import { createFileRoute } from "@tanstack/react-router";

import { AccountLayout } from "#components/account-layout";

export const Route = createFileRoute("/(app)/account/profile")({
  component: ProfileLayout,
});

function ProfileLayout() {
  return <AccountLayout />;
}
