import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { AuthScreen } from "#components/auth";
import { TailorKitShell } from "#components/tailorkit-shell";
import { useAuthSession } from "#lib/auth-client";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TailorKit CRM",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: AppShell,
});

function AppShell() {
  const session = useAuthSession();

  if (session.isPending) {
    return;
  }

  if (!session.data) {
    return <AuthScreen />;
  }

  return (
    <TailorKitShell signOut={() => session.signOut()} user={session.data.user}>
      <Outlet />
    </TailorKitShell>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
