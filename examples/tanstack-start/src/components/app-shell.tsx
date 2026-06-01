import type { DemoUser } from "@examples/shared";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@tailorkit/ui/avatar";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@tailorkit/ui/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tailorkit/ui/sidebar";
import { ThemeToggle } from "@tailorkit/ui/theme-toggle";
import { BarChart3, Building2, Handshake, LogOut, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import tailorClient from "#lib/tailorkit-client";
import { Button } from "@tailorkit/ui/components/button";

const navItems = [
  { icon: BarChart3, label: "Overview", to: "/" },
  { icon: Users, label: "Customers", to: "/customers" },
  { icon: Handshake, label: "Deals", to: "/deals" },
] as const;

export function AppShell({
  children,
  signOut,
  user,
}: {
  children: ReactNode;
  signOut: () => Promise<void>;
  user: DemoUser;
}) {
  const { data: apps = [] } = tailorClient.useApps();

  return (
    <tailorClient.Root apps={apps}>
      <SidebarProvider>
        <tailorClient.ScreenMatch
          context={{
            user,
          }}
          screen="/"
        >
          <AppSidebar signOut={signOut} user={user} />
          <SidebarInset className="me-12 group-data-[state=open]/tailorkit:me-[21rem]">
            <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
          </SidebarInset>
        </tailorClient.ScreenMatch>
        <AppScreenPreview />
        <AppListPreview apps={apps} />
      </SidebarProvider>
    </tailorClient.Root>
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

function UserMenu({ signOut, user }: { signOut: () => Promise<void>; user: DemoUser }) {
  return (
    <div className="min-w-0 flex-1">
      <Menu>
        <MenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-accent">
          <Avatar>
            <AvatarImage alt={user.name} src={user.profileImageUrl} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate font-medium text-sm">{user.name}</span>
            <span className="block truncate text-muted-foreground text-xs">{user.email}</span>
          </span>
        </MenuTrigger>
        <MenuPopup align="start" className="w-56" side="top">
          <MenuItem onClick={() => void signOut()} variant="destructive">
            <LogOut aria-hidden="true" />
            Sign out
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}

function useThemeMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextIsDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }, []);

  function toggleTheme() {
    setIsDark((currentIsDark) => {
      const nextIsDark = !currentIsDark;

      document.documentElement.classList.toggle("dark", nextIsDark);
      window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");

      return nextIsDark;
    });
  }

  return { isDark, toggleTheme };
}

function AppListPreview({
  apps,
}: {
  apps: NonNullable<ReturnType<typeof tailorClient.useApps>["data"]>;
}) {
  return (
    <aside className="pr-2">
      <tailorClient.AppList
        orientation="vertical"
        className="flex flex-col items-center gap-2 justify-center h-full"
      >
        {apps.map((app) => {
          const label = app.name ?? app.id;

          return (
            <tailorClient.AppTrigger
              app={app}
              key={app.id}
              title={label}
              render={<Button variant="outline" />}
            >
              {getInitials(label)}
            </tailorClient.AppTrigger>
          );
        })}
      </tailorClient.AppList>
    </aside>
  );
}

function AppScreenPreview() {
  return (
    <tailorClient.AppScreen>
      <tailorClient.AppHeader className="flex items-center justify-end border-b p-3">
        <tailorClient.AppScreenClose
          aria-label="Close app panel"
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" />
        </tailorClient.AppScreenClose>
      </tailorClient.AppHeader>
      <tailorClient.AppContent className="min-h-0 flex-1 overflow-auto p-4" />
    </tailorClient.AppScreen>
  );
}

function getInitials(label: string) {
  const initials = label
    .split(/[\s-]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "A";
}
