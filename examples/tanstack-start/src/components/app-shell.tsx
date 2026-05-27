import type { DemoUser } from "@examples/shared";
import { Link } from "@tanstack/react-router";
import { AppPanel as TailorAppPanel, AppRail as TailorAppRail } from "tailorkit/react";
import { Avatar, AvatarFallback, AvatarImage } from "@tailorkit/ui/avatar";
import { Badge } from "@tailorkit/ui/badge";
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
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import tailorClient from "#lib/tailorkit-client";

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
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isAppPanelOpen, setIsAppPanelOpen] = useState(false);
  const appsSnapshot = tailorClient.useApps();
  const apps = appsSnapshot.apps;
  const activeApp = useMemo(
    () => apps.find((app) => app.id === activeAppId) ?? null,
    [activeAppId, apps],
  );

  useEffect(() => {
    if (activeAppId && !apps.some((app) => app.id === activeAppId)) {
      setActiveAppId(null);
      setIsAppPanelOpen(false);
    }
  }, [activeAppId, apps]);

  return (
    <tailorClient.ScreenMatch
      context={{
        user,
      }}
      screen="/"
    >
      <TailorAppPanel.Root
        apps={apps}
        onOpenChange={setIsAppPanelOpen}
        onValueChange={setActiveAppId}
        open={isAppPanelOpen}
        openMode="select"
        tailor={tailorClient}
        value={activeAppId}
      >
        <SidebarProvider className="bg-muted/28">
          <AppSidebar signOut={signOut} user={user} />
          <SidebarInset className={isAppPanelOpen && activeApp ? "me-[21rem]" : "me-12"}>
            <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
          </SidebarInset>
          <AppRailPreview
            apps={apps}
            errorMessage={appsSnapshot.error?.message}
            status={appsSnapshot.status}
          />
          <AppPanelPreview app={isAppPanelOpen ? activeApp : null} />
        </SidebarProvider>
      </TailorAppPanel.Root>
    </tailorClient.ScreenMatch>
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

function AppRailPreview({
  apps,
  errorMessage,
  status,
}: {
  apps: ReturnType<typeof tailorClient.getApps>;
  errorMessage?: string;
  status: "error" | "idle" | "loading" | "ready";
}) {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-12 flex-col items-center gap-2 border-l bg-background px-1 py-3">
      <TailorAppRail.List className="flex flex-col items-center gap-2">
        {apps.map((app) => {
          const label = app.name ?? app.id;

          return (
            <TailorAppRail.Item app={app} key={app.id}>
              <TailorAppRail.Trigger
                className="inline-flex size-10 items-center justify-center rounded-md border border-input bg-background font-medium text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground"
                title={label}
              >
                {getInitials(label)}
              </TailorAppRail.Trigger>
            </TailorAppRail.Item>
          );
        })}
      </TailorAppRail.List>
      {apps.length === 0 ? <AppRailStatus errorMessage={errorMessage} status={status} /> : null}
    </aside>
  );
}

function AppRailStatus({
  errorMessage,
  status,
}: {
  errorMessage?: string;
  status: "error" | "idle" | "loading" | "ready";
}) {
  let label = "Loading apps";
  let text = "...";

  if (status === "error") {
    label = errorMessage ?? "Unable to load apps";
    text = "!";
  } else if (status === "ready") {
    label = "No apps available";
    text = "-";
  }

  return (
    <Badge
      aria-label={label}
      className="size-8 rounded-lg"
      size="lg"
      title={label}
      variant={getAppRailStatusVariant(status)}
    >
      {text}
    </Badge>
  );
}

function getAppRailStatusVariant(status: "error" | "idle" | "loading" | "ready") {
  if (status === "error") {
    return "error";
  }

  if (status === "loading") {
    return "info";
  }

  return "outline";
}

function AppPanelPreview({ app }: { app: ReturnType<typeof tailorClient.getApps>[number] | null }) {
  if (!app) {
    return null;
  }

  return (
    <TailorAppPanel.Content className="fixed inset-y-0 right-12 z-20 flex w-80 flex-col border-l bg-background">
      <TailorAppPanel.Header className="flex items-center justify-between border-b p-3">
        <div className="min-w-0">
          <TailorAppPanel.Title className="truncate font-medium text-sm" />
          {app.description ? (
            <p className="truncate text-muted-foreground text-xs">{app.description}</p>
          ) : null}
        </div>
        <TailorAppPanel.Close
          aria-label="Close app panel"
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" />
        </TailorAppPanel.Close>
      </TailorAppPanel.Header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <TailorAppPanel.Screen />
      </div>
    </TailorAppPanel.Content>
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
