import { clsx } from "clsx";
import { BarChart2, CreditCard, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import { useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";

type ActivePage = "reports" | "billing";

const CORE_NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Analytics", icon: BarChart2 },
  { label: "Settings", icon: Settings },
];

const CUSTOM_PAGES = [
  {
    id: "reports" as const,
    label: "Reports",
    icon: FileText,
    eyebrow: "Custom page",
  },
  {
    id: "billing" as const,
    label: "Billing Center",
    icon: CreditCard,
    eyebrow: "Custom page",
  },
];

function ReportsPage() {
  const bars = [52, 78, 46, 88, 68, 96, 72, 84];

  return (
    <div className="flex h-full flex-col gap-3 p-3 lg:p-4">
      <div className="grid shrink-0 grid-cols-3 gap-2">
        {[
          ["Revenue", "$48.2k"],
          ["Pipeline", "$128k"],
          ["Activation", "64%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <p className="mb-1 text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Weekly performance</p>
          <span className="text-[11px] text-muted-foreground">Updated today</span>
        </div>
        <div className="flex h-24 items-end gap-1.5">
          {bars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary/35"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-dashed border-border">
        <div className="grid grid-cols-[1fr_5rem] border-b border-border/60 bg-muted/30 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Segment</span>
          <span className="text-xs font-medium text-muted-foreground">Growth</span>
        </div>
        {[
          ["Enterprise accounts", "+18%"],
          ["Self-serve teams", "+12%"],
          ["Partner referrals", "+9%"],
        ].map(([segment, growth]) => (
          <div
            key={segment}
            className="grid grid-cols-[1fr_5rem] border-b border-border/40 px-4 py-2.5 last:border-0"
          >
            <span className="truncate text-xs text-foreground/80">{segment}</span>
            <span className="text-xs font-medium text-foreground">{growth}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingCenterPage() {
  return (
    <div className="flex h-full flex-col gap-3 p-3 lg:p-4">
      <div className="rounded-lg border border-border p-4">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          Current plan
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold leading-none text-foreground">Business</p>
            <p className="mt-1 text-xs text-muted-foreground">$299 / month · renews May 15</p>
          </div>
          <button className="shrink-0 cursor-pointer rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent">
            Change plan
          </button>
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2">
        <div className="rounded-lg border border-border p-3">
          <p className="mb-1 text-[11px] text-muted-foreground">Seats</p>
          <p className="text-sm font-bold text-foreground">24 of 30</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="mb-1 text-[11px] text-muted-foreground">Usage</p>
          <p className="text-sm font-bold text-foreground">78%</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-dashed border-border">
        <div className="grid grid-cols-[1fr_5rem] border-b border-border/60 bg-muted/30 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Invoice</span>
          <span className="text-xs font-medium text-muted-foreground">Amount</span>
        </div>
        {[
          ["May 2026", "$299"],
          ["Apr 2026", "$299"],
          ["Mar 2026", "$249"],
        ].map(([invoice, amount]) => (
          <div
            key={invoice}
            className="grid grid-cols-[1fr_5rem] border-b border-border/40 px-4 py-2.5 last:border-0"
          >
            <span className="text-xs text-foreground/80">{invoice}</span>
            <span className="text-xs font-medium text-foreground">{amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PagesDemo({ isMobile }: { isMobile: boolean }) {
  const [activePage, setActivePage] = useState<ActivePage>("reports");
  const activePageMeta = CUSTOM_PAGES.find((page) => page.id === activePage) ?? CUSTOM_PAGES[0];

  return (
    <div className="relative flex h-full overflow-hidden">
      <div
        className={clsx(
          "relative z-0 flex shrink-0 flex-col border-r border-border bg-card",
          isMobile ? "w-12" : "w-44",
        )}
      >
        <div className="flex flex-1 flex-col gap-0.5 p-2">
          {CORE_NAV_ITEMS.map(({ label, icon: Icon }, i) => (
            <div
              key={label}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-2 py-2",
                i === 0 ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <Icon
                className={clsx(
                  "h-3.5 w-3.5 shrink-0",
                  i === 0 ? "text-foreground" : "text-muted-foreground",
                )}
              />
              {!isMobile && (
                <span
                  className={clsx(
                    "truncate text-xs",
                    i === 0 ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              )}
            </div>
          ))}

          <div className="my-2 border-t border-border" />

          {!isMobile && (
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
              Extensions
            </p>
          )}
          {CUSTOM_PAGES.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                className={clsx(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                onClick={() => setActivePage(id)}
              >
                <Icon
                  className={clsx(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {!isMobile && <span className="truncate text-xs font-medium">{label}</span>}
              </button>
            );
          })}
        </div>
        <div className="border-t border-border p-2.5">
          <div className="flex items-center gap-2 px-1">
            <div className="h-5 w-5 shrink-0 rounded-full border border-border bg-muted" />
            {!isMobile && <span className="text-xs text-muted-foreground">Admin</span>}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-card">
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{activePageMeta.label}</p>
            {!isMobile && (
              <p className="truncate text-[11px] text-muted-foreground">{activePageMeta.eyebrow}</p>
            )}
          </div>
          <span className="rounded-full border border-border bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">
            Hosted
          </span>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={activePage}
            className="min-h-0 flex-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            {activePage === "reports" ? <ReportsPage /> : <BillingCenterPage />}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
