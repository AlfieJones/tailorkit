import { createFileRoute } from "@tanstack/react-router";

import { AccountLayout } from "@/components/account-layout";

export const Route = createFileRoute("/(app)/account/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return <AccountLayout />;
}
