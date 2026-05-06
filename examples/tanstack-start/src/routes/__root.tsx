import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { BarChart3, Building2, Handshake, Users } from "lucide-react";

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
  return (
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
      <div className="lg:pl-64">
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
    </div>
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
