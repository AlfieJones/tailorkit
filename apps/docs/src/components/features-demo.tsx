import { clsx } from "clsx";
import { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  Mail,
  X,
  LayoutGrid,
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
} from "lucide-react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";

type ActiveApp = "billing" | "analytics" | "email";

const DEMO_APPS = [
  {
    id: "billing" as const,
    icon: CreditCard,
    label: "Billing",
    iconBg: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-700/40",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    headerBg: "bg-yellow-500 dark:bg-yellow-600",
    logoBg: "bg-yellow-600 dark:bg-yellow-500",
    annotation: "Third-party data embedded natively — no context switch needed",
  },
  {
    id: "analytics" as const,
    icon: TrendingUp,
    label: "Analytics",
    iconBg: "bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-700/40",
    iconColor: "text-green-600 dark:text-green-500",
    headerBg: "bg-green-500 dark:bg-green-600",
    logoBg: "bg-green-600 dark:bg-green-500",
    annotation: "New pages & dashboards built on your existing API data",
  },
  {
    id: "email" as const,
    icon: Mail,
    label: "Email",
    iconBg: "bg-orange-100 border-orange-200 dark:bg-orange-900/40 dark:border-orange-700/40",
    iconColor: "text-orange-500 dark:text-orange-400",
    headerBg: "bg-orange-500 dark:bg-orange-600",
    logoBg: "bg-orange-600 dark:bg-orange-500",
    annotation: "Ship features your app doesn't support yet",
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Analytics", icon: BarChart2 },
  { label: "Settings", icon: Settings },
];

const FEATURE_COMMENT_COPY: Record<ActiveApp, string> = {
  billing: "Customer-specific billing platform",
  analytics: "Product metrics built from your API data",
  email: "Extra workflows users can install themselves",
};

// ─── Panels ───────────────────────────────────────────────────────────────────

function PanelHeader({
  app,
  note,
  onClose,
}: {
  app: (typeof DEMO_APPS)[number];
  note?: string;
  onClose: () => void;
}) {
  const Icon = app.icon;
  return (
    <>
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-2.5 text-white shrink-0",
          app.headerBg,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={clsx(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md shadow-sm shadow-black/10 ring-1 ring-white/25",
              app.logoBg,
            )}
          >
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
          </span>
          <span className="text-xs font-semibold truncate">{app.label}</span>
        </div>
        <button
          aria-label={`Close ${app.label}`}
          onClick={onClose}
          className="cursor-pointer opacity-70 hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {note && (
        <div className="border-b border-border bg-muted/30 px-4 py-2.5 shrink-0">
          <p className="text-[11px] font-medium leading-snug text-muted-foreground">{note}</p>
        </div>
      )}
    </>
  );
}

function BillingPanel({ note, onClose }: { note?: string; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[0]} note={note} onClose={onClose} />
      <div className="flex-1 p-3 bg-card flex flex-col gap-3 overflow-hidden">
        <div className="border border-border rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Current Plan
            </span>
          </div>
          <p className="text-foreground font-bold text-base leading-none">Pro</p>
          <p className="text-muted-foreground text-xs mt-1">$99 / month</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">MRR</p>
            <p className="text-foreground text-sm font-bold">$99</p>
          </div>
          <div className="border border-border rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Customer since</p>
            <p className="text-foreground text-sm font-bold">Jan '25</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Next invoice</p>
          <p className="text-foreground text-sm font-medium">May 15, 2026</p>
        </div>
        <div className="mt-auto">
          <button className="w-full border border-border bg-card hover:bg-accent text-foreground text-xs font-medium rounded-md py-2 transition-colors cursor-pointer">
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel({ note, onClose }: { note?: string; onClose: () => void }) {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[1]} note={note} onClose={onClose} />
      <div className="flex-1 p-3 bg-card flex flex-col gap-3 overflow-hidden">
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Sessions</p>
            <p className="text-foreground text-base font-bold">89</p>
          </div>
          <div className="border border-border rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Events</p>
            <p className="text-foreground text-base font-bold">1,247</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-2">Daily sessions · last 7 days</p>
          <div className="flex items-end gap-1 h-12">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-green-400/50 rounded-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground/60">Mon</span>
            <span className="text-[10px] text-muted-foreground/60">Sun</span>
          </div>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1.5">Top page</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground font-medium">/dashboard</span>
            <span className="text-[11px] text-muted-foreground">342 views</span>
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full border border-border bg-card hover:bg-accent text-foreground text-xs font-medium rounded-md py-2 transition-colors cursor-pointer">
            Full Report
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailPanel({ note, onClose }: { note?: string; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[2]} note={note} onClose={onClose} />
      <div className="flex-1 p-3 bg-card flex flex-col gap-3 overflow-hidden">
        <div className="border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">To</p>
          <p className="text-xs text-foreground font-medium">alfred@acmecorp.com</p>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Subject</p>
          <p className="text-xs text-foreground font-medium">Following up on your account</p>
        </div>
        <div className="flex-1 border border-border rounded-lg p-3 flex flex-col min-h-0">
          <p className="text-[11px] text-muted-foreground mb-1.5">Message</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hi Alfred, just wanted to check in on how things are going with your Pro plan...
          </p>
        </div>
        <button className="w-full border border-border bg-card hover:bg-accent text-foreground text-xs font-medium rounded-md py-2 transition-colors cursor-pointer">
          Send Email
        </button>
      </div>
    </div>
  );
}

// ─── Main demo ────────────────────────────────────────────────────────────────

function FeaturePanelContent({
  activeApp,
  note,
  onClose,
}: {
  activeApp: ActiveApp;
  note?: string;
  onClose: () => void;
}) {
  const panelProps = { note, onClose };

  if (activeApp === "billing") {
    return <BillingPanel {...panelProps} />;
  }
  if (activeApp === "analytics") {
    return <AnalyticsPanel {...panelProps} />;
  }
  return <EmailPanel {...panelProps} />;
}

export function FeaturesDemo({ isMobile }: { isMobile: boolean }) {
  const [activeApp, setActiveApp] = useState<ActiveApp | null>("billing");
  const toggleApp = (id: ActiveApp) => setActiveApp((prev) => (prev === id ? null : id));
  const panelWidth = 260;
  const featureCommentCopy = activeApp ? FEATURE_COMMENT_COPY[activeApp] : null;

  return (
    <div className="relative flex h-full overflow-hidden">
      <AnimatePresence>
        {activeApp && (
          <m.div
            className="absolute inset-0 z-10 bg-background/15 backdrop-blur-[1.5px] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={clsx(
          "border-r border-border bg-card flex flex-col shrink-0 relative z-0",
          isMobile ? "w-12" : "w-44",
        )}
      >
        <div className="h-11 border-b border-border flex items-center px-3 gap-2.5 shrink-0">
          <div className="w-5 h-5 rounded bg-foreground/80 shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-background" />
          </div>
          {!isMobile && (
            <span className="text-xs font-semibold text-foreground/80 truncate">Your Platform</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5 p-2 flex-1">
          {NAV_ITEMS.map(({ label, icon: Icon }, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-center gap-2.5 px-2 py-2 rounded-md",
                i === 1 ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <Icon
                className={clsx(
                  "w-3.5 h-3.5 shrink-0",
                  i === 1 ? "text-foreground" : "text-muted-foreground",
                )}
              />
              {!isMobile && (
                <span
                  className={clsx(
                    "text-xs truncate",
                    i === 1 ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="p-2.5 border-t border-border">
          <div className="flex items-center gap-2 px-1">
            <div className="w-5 h-5 rounded-full bg-muted border border-border shrink-0" />
            {!isMobile && <span className="text-xs text-muted-foreground">Admin</span>}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar */}
        <div className="h-11 border-b border-border flex items-center px-3 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
            {!isMobile && (
              <>
                <span className="text-xs text-muted-foreground shrink-0">Customers</span>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <span className="text-xs text-foreground font-medium truncate">Alfred Jones</span>
              </>
            )}
          </div>

          {/* App icon pill */}
          <div className="relative flex items-center shrink-0 z-40">
            {DEMO_APPS.map((app) => {
              const Icon = app.icon;
              const isActive = activeApp === app.id;
              return (
                <m.button
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className={clsx(
                    "-ml-2 first:ml-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-2 border-border bg-muted shadow-sm transition-[box-shadow]",
                    app.iconColor,
                    isActive && "shadow-md",
                  )}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 520, damping: 24 }}
                  title={app.label}
                >
                  <Icon className="w-3 h-3" />
                </m.button>
              );
            })}
            <div className="mx-1.5 h-5 w-px bg-border" />
            {/* Add app button with tooltip */}
            <div className="relative group/add shrink-0">
              <m.button
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shrink-0 border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground hover:bg-accent transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 520, damping: 24 }}
              >
                <LayoutGrid className="w-3 h-3" />
              </m.button>
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-popover border border-border rounded-md text-[11px] text-popover-foreground whitespace-nowrap opacity-0 group-hover/add:opacity-100 transition-opacity pointer-events-none shadow-sm z-50">
                Add new app
              </div>
            </div>
            {!isMobile && <span className="sr-only">Switch between installed apps</span>}
          </div>
        </div>

        {/* Customer detail */}
        <div className="flex-1 p-3 lg:p-4 overflow-hidden flex flex-col gap-3">
          {/* Customer header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/60 shrink-0">
            <div className="w-9 h-9 rounded-full bg-muted/70 border border-border shrink-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">AJ</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-none mb-1">
                Alfred Jones
              </p>
              <p className="text-xs text-muted-foreground truncate">
                alfred@acmecorp.com · Pro Plan
              </p>
            </div>
          </div>

          {/* Activity table */}
          <div className="border border-dashed border-border rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="grid grid-cols-2 px-4 py-2 bg-muted/30 border-b border-border/60 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Event</span>
              <span className="text-xs text-muted-foreground font-medium">Date</span>
            </div>
            {[
              { event: "Logged in", date: "May 7" },
              { event: "Upgraded to Pro", date: "Apr 28" },
              { event: "Created workspace", date: "Jan 12" },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2 px-4 py-2.5 border-b border-border/40 last:border-0 items-center"
              >
                <span className="text-xs text-foreground/80">{row.event}</span>
                <span className="text-xs text-muted-foreground">{row.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side panel */}
      {isMobile ? (
        <AnimatePresence>
          {activeApp && (
            <m.div
              key="mobile-panel"
              className="absolute inset-y-0 right-0 z-50 w-[calc(100%-3rem)] max-w-[300px] overflow-hidden border-l border-border bg-card shadow-2xl shadow-black/15"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={activeApp}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="h-full"
                >
                  <FeaturePanelContent
                    activeApp={activeApp}
                    note={featureCommentCopy ?? undefined}
                    onClose={() => setActiveApp(null)}
                  />
                </m.div>
              </AnimatePresence>
            </m.div>
          )}
        </AnimatePresence>
      ) : (
        <m.div
          className="relative z-30 overflow-hidden shrink-0"
          initial={false}
          animate={{ width: activeApp ? panelWidth : 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          <div style={{ width: panelWidth }} className="h-full border-l border-border">
            <AnimatePresence mode="wait">
              {activeApp && (
                <m.div
                  key={activeApp}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="h-full"
                >
                  <FeaturePanelContent
                    activeApp={activeApp}
                    note={featureCommentCopy ?? undefined}
                    onClose={() => setActiveApp(null)}
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>
      )}
    </div>
  );
}
