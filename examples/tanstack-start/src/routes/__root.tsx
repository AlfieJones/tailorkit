import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { BarChart3, Building2, Handshake, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import tailor from "#/lib/tailorkit";
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

const navItems = [
  { icon: BarChart3, label: "Overview", to: "/" },
  { icon: Users, label: "Customers", to: "/customers" },
  { icon: Handshake, label: "Deals", to: "/deals" },
] as const;

function AppShell() {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const appsSnapshot = tailor.useApps();
  const apps = appsSnapshot.apps;
  const activeApp = useMemo(
    () => apps.find((app) => app.id === activeAppId) ?? null,
    [activeAppId, apps],
  );

  useEffect(() => {
    if (activeAppId && !apps.some((app) => app.id === activeAppId)) {
      setActiveAppId(null);
    }
  }, [activeAppId, apps]);

  return (
    <tailor.ScreenMatch context={{}} pattern="/" screen="/">
      <div className="min-h-screen bg-muted/28">
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block">
          <div className="flex h-16 items-center gap-2 border-b px-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm">Northwind CRM</p>
              <p className="text-muted-foreground text-xs">Sales workspace</p>
            </div>
          </div>
          <nav className="space-y-1 p-3" aria-label="Primary">
            {navItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-accent text-foreground" }}
                className="flex h-9 items-center gap-2 rounded-md px-3 font-medium text-muted-foreground text-sm hover:bg-accent/70 hover:text-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className={activeApp ? "pr-12 lg:pl-64 xl:pr-[22rem]" : "pr-12 lg:pl-64"}>
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur lg:hidden">
            <div className="flex h-14 items-center gap-2 px-4">
              <Building2 className="size-5" aria-hidden="true" />
              <span className="font-semibold text-sm">Northwind CRM</span>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Primary">
              {navItems.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  activeProps={{ className: "bg-accent text-foreground" }}
                  className="flex h-8 shrink-0 items-center rounded-md px-3 font-medium text-muted-foreground text-sm hover:bg-accent/70 hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
        <AppRail
          activeAppId={activeAppId}
          apps={apps}
          errorMessage={appsSnapshot.error?.message}
          status={appsSnapshot.status}
          onSelectApp={(appId) => {
            setActiveAppId((currentAppId) => (currentAppId === appId ? null : appId));
          }}
        />
        {activeApp ? <AppPanel app={activeApp} onClose={() => setActiveAppId(null)} /> : null}
      </div>
    </tailor.ScreenMatch>
  );
}

function AppRail({
  activeAppId,
  apps,
  errorMessage,
  status,
  onSelectApp,
}: {
  activeAppId: string | null;
  apps: ReturnType<typeof tailor.getApps>;
  errorMessage?: string;
  status: "error" | "idle" | "loading" | "ready";
  onSelectApp: (appId: string) => void;
}) {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-12 flex-col items-center gap-2 border-l bg-background px-1 py-3">
      {apps.map((app) => {
        const label = app.name ?? app.id;
        const isActive = activeAppId === app.id;

        return (
          <button
            aria-pressed={isActive}
            className={
              isActive
                ? "flex size-9 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-xs"
                : "flex size-9 items-center justify-center rounded-md border bg-background font-semibold text-muted-foreground text-xs hover:bg-accent hover:text-foreground"
            }
            key={app.id}
            onClick={() => onSelectApp(app.id)}
            title={label}
            type="button"
          >
            {getAppInitials(label)}
          </button>
        );
      })}
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
  const label =
    status === "error"
      ? (errorMessage ?? "Unable to load apps")
      : status === "ready"
        ? "No apps available"
        : "Loading apps";
  const text = status === "error" ? "!" : status === "ready" ? "-" : "...";

  return (
    <div
      className={
        status === "error"
          ? "flex size-9 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 font-semibold text-destructive text-xs"
          : "flex size-9 items-center justify-center rounded-md border bg-muted font-semibold text-muted-foreground text-xs"
      }
      title={label}
    >
      {text}
    </div>
  );
}

function AppPanel({
  app,
  onClose,
}: {
  app: ReturnType<typeof tailor.getApps>[number];
  onClose: () => void;
}) {
  const label = app.name ?? app.id;

  return (
    <aside className="fixed inset-y-0 right-12 z-20 flex w-[20rem] max-w-[calc(100vw-3rem)] flex-col border-l bg-background shadow-lg">
      <header className="flex h-12 items-center justify-between border-b px-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{label}</p>
          {app.description ? (
            <p className="truncate text-muted-foreground text-xs">{app.description}</p>
          ) : null}
        </div>
        <button
          aria-label="Close app panel"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={onClose}
          type="button"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-muted/28">
        <tailor.Screen app={app} />
      </div>
    </aside>
  );
}

function getAppInitials(label: string) {
  const initials = label
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "A";
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
