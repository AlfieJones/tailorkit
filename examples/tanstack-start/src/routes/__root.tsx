import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { BarChart3, Building2, Handshake, LogOut, UserRound, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";

import { authClient } from "#/lib/auth-client";
import tailorClient from "#/lib/tailorkit-client";
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
  const appsSnapshot = tailorClient.useApps();
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
    <tailorClient.ScreenMatch context={{}} pattern="/" screen="/">
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
              <div className="ml-auto">
                <AccountMenu />
              </div>
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
            <div className="mb-6 hidden justify-end lg:flex">
              <AccountMenu />
            </div>
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
    </tailorClient.ScreenMatch>
  );
}

function AccountMenu() {
  const session = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (session.isPending) {
    return (
      <div className="flex h-9 items-center rounded-md border bg-background px-3 text-muted-foreground text-sm">
        Loading
      </div>
    );
  }

  if (session.data) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 shadow-xs">
        <div className="flex size-7 items-center justify-center rounded-md bg-accent text-muted-foreground">
          <UserRound className="size-4" aria-hidden="true" />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate font-medium text-xs">{session.data.user.name}</p>
          <p className="truncate text-muted-foreground text-xs">{session.data.user.email}</p>
        </div>
        <button
          aria-label="Sign out"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => void authClient.signOut()}
          type="button"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 font-medium text-sm shadow-xs hover:bg-accent"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <UserRound className="size-4" aria-hidden="true" />
        Account
      </button>
      {isOpen ? <AuthForm /> : null}
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, name, password })
        : await authClient.signIn.email({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message ?? "Authentication failed");
      return;
    }

    setMessage(mode === "sign-up" ? "Account created" : "Signed in");
  }

  return (
    <form
      className="absolute right-0 top-11 z-40 w-[20rem] max-w-[calc(100vw-2rem)] rounded-lg border bg-background p-3 shadow-lg"
      onSubmit={(event) => void onSubmit(event)}
    >
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <button
          className={
            mode === "sign-in"
              ? "h-8 rounded-sm bg-background font-medium text-sm shadow-xs"
              : "h-8 rounded-sm text-muted-foreground text-sm hover:text-foreground"
          }
          onClick={() => setMode("sign-in")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={
            mode === "sign-up"
              ? "h-8 rounded-sm bg-background font-medium text-sm shadow-xs"
              : "h-8 rounded-sm text-muted-foreground text-sm hover:text-foreground"
          }
          onClick={() => setMode("sign-up")}
          type="button"
        >
          Sign up
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {mode === "sign-up" ? (
          <label className="block">
            <span className="font-medium text-xs">Name</span>
            <input
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        ) : null}
        <label className="block">
          <span className="font-medium text-xs">Email</span>
          <input
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block">
          <span className="font-medium text-xs">Password</span>
          <input
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
      </div>
      {message ? <p className="mt-3 text-muted-foreground text-xs">{message}</p> : null}
      <button
        className="mt-3 flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting && "Working"}
        {!isSubmitting && mode === "sign-up" && "Create account"}
        {!isSubmitting && mode !== "sign-up" && "Sign in"}
      </button>
    </form>
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
  apps: ReturnType<typeof tailorClient.getApps>;
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
  app: ReturnType<typeof tailorClient.getApps>[number];
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
      <div className="min-h-0 flex-1 overflow-auto bg-muted/28 p-4">
        <tailorClient.Screen app={app} />
      </div>
    </aside>
  );
}

function getAppInitials(label: string) {
  const initials = label
    .split(/[\s-]+/u)
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
