import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
  ssr: false,
  preload: false,
  beforeLoad: ({ context }) =>
    authClient.signOut().finally(() => {
      context.queryClient.clear();
      console.log("logging out");
      throw redirect({
        to: "/login",
        replace: true,
        search: { email: undefined, return_to: undefined },
      });
    }),
});
