import { authClient } from "#lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
  ssr: false,
  preload: false,
  component: LogoutPage,
  beforeLoad: async ({ context }) => {
    await authClient.signOut().catch((error) => {
      console.error(error);
    });

    context.queryClient.clear();
    throw redirect({
      replace: true,
      search: { email: undefined, return_to: undefined },
      to: "/login",
    });
  },
});

function LogoutPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-6">
      <p className="text-muted-foreground text-sm">Signing out...</p>
    </main>
  );
}
