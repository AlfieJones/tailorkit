import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/account")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/account") {
      throw Route.redirect({ to: "/account/settings" });
    }
  },
});
