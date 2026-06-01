import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { AppShell as AuthenticatedAppShell } from "#components/app-shell";
import { AuthScreen } from "#components/auth";
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
    <AuthenticatedAppShell signOut={session.signOut} user={session.data.user}>
      <Outlet />
    </AuthenticatedAppShell>
  );
}

function AppSidebar({ signOut, user }: { signOut: () => Promise<void>; user: DemoUser }) {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Northwind CRM</p>
            <p className="text-muted-foreground text-xs">Sales workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map(({ icon: Icon, label, to }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  render={
                    <Link
                      to={to}
                      activeOptions={{ exact: to === "/" }}
                      activeProps={{ "data-active": true }}
                    />
                  }
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-1">
          <UserMenu signOut={signOut} user={user} />
          <ThemeToggle aria-pressed={isDark} onClick={toggleTheme} />
        </div>
      </SidebarFooter>
    </Sidebar>
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
