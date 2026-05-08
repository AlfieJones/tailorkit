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
    annotation: "Third-party data embedded natively — no context switch needed",
  },
  {
    id: "analytics" as const,
    icon: TrendingUp,
    label: "Analytics",
    iconBg: "bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-700/40",
    iconColor: "text-green-600 dark:text-green-500",
    headerBg: "bg-green-500 dark:bg-green-600",
    annotation: "New pages & dashboards built on your existing API data",
  },
  {
    id: "email" as const,
    icon: Mail,
    label: "Email",
    iconBg: "bg-orange-100 border-orange-200 dark:bg-orange-900/40 dark:border-orange-700/40",
    iconColor: "text-orange-500 dark:text-orange-400",
    headerBg: "bg-orange-500 dark:bg-orange-600",
    annotation: "Ship features your app doesn't support yet",
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Analytics", icon: BarChart2 },
  { label: "Settings", icon: Settings },
];

// ─── Panels ───────────────────────────────────────────────────────────────────

function PanelHeader({ app, onClose }: { app: (typeof DEMO_APPS)[number]; onClose: () => void }) {
  const Icon = app.icon;
  return (
    <div
      className={clsx(
        "flex items-center justify-between px-4 py-2.5 text-white shrink-0",
        app.headerBg,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">{app.label}</span>
      </div>
      <button onClick={onClose} className="cursor-pointer opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function BillingPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[0]} onClose={onClose} />
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

function AnalyticsPanel({ onClose }: { onClose: () => void }) {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[1]} onClose={onClose} />
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

function EmailPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader app={DEMO_APPS[2]} onClose={onClose} />
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

export function FeaturesDemo({ isMobile }: { isMobile: boolean }) {
  const [activeApp, setActiveApp] = useState<ActiveApp | null>("billing");
  const toggleApp = (id: ActiveApp) => setActiveApp((prev) => (prev === id ? null : id));
  const panelWidth = isMobile ? 200 : 260;

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={clsx(
          "border-r border-border bg-card flex flex-col shrink-0",
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
          <div className="flex items-center gap-0.5 border border-border rounded-xl px-1 py-1 shrink-0">
            {DEMO_APPS.map((app) => {
              const Icon = app.icon;
              const isActive = activeApp === app.id;
              return (
                <m.button
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shrink-0 border transition-all",
                    app.iconBg,
                    app.iconColor,
                    isActive && "ring-1 ring-primary/50 ring-offset-1 ring-offset-card",
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={app.label}
                >
                  <Icon className="w-3 h-3" />
                </m.button>
              );
            })}
            <div className="w-px h-4 bg-border mx-0.5" />
            {/* Add app button with tooltip */}
            <div className="relative group/add">
              <button className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <LayoutGrid className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-popover border border-border rounded-md text-[11px] text-popover-foreground whitespace-nowrap opacity-0 group-hover/add:opacity-100 transition-opacity pointer-events-none shadow-sm z-50">
                Add new app
              </div>
            </div>
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
      <m.div
        className="overflow-hidden shrink-0"
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
                {activeApp === "billing" && <BillingPanel onClose={() => setActiveApp(null)} />}
                {activeApp === "analytics" && <AnalyticsPanel onClose={() => setActiveApp(null)} />}
                {activeApp === "email" && <EmailPanel onClose={() => setActiveApp(null)} />}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>

      {/* Annotations overlay */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* SVG arrows — preserveAspectRatio="none" maps coords to % of container */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {/* Arrow 1: from text (~48,18) curving to the app pill (~70,10) */}
            <path
              d="M 48 18 C 52 22, 62 16, 68 10"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              opacity="0.45"
              className="text-foreground"
              fill="none"
            />
            {/* Arrowhead 1 — manual fork at (68,10), tangent ~(5,-4) */}
            <path
              d="M 65.6 10.6 L 68 10 L 66.9 12.2"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.45"
              className="text-foreground"
              fill="none"
            />

            {/* Arrow 2 + arrowhead, shown per active app */}
            <AnimatePresence>
              {activeApp && (
                <m.g
                  key={activeApp}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Arrow from text (~43,62) curving to panel (~77,50) */}
                  <path
                    d="M 43 62 C 52 60, 66 55, 76 50"
                    stroke="currentColor"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    opacity="0.45"
                    className="text-foreground"
                    fill="none"
                  />
                  {/* Arrowhead 2 — manual fork at (76,50), tangent ~(8,-4) */}
                  <path
                    d="M 73.5 50.1 L 76 50 L 74.5 52"
                    stroke="currentColor"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.45"
                    className="text-foreground"
                    fill="none"
                  />
                </m.g>
              )}
            </AnimatePresence>
          </svg>

          {/* Annotation 1: app selector pill */}
          <m.div
            className="absolute"
            style={{
              top: "4%",
              left: "28%",
              transform: "rotate(-3deg)",
              fontFamily: "'Caveat', cursive",
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <p className="text-[17px] leading-tight text-foreground/65">Your app ecosystem</p>
            <p className="text-[14px] leading-tight text-foreground/45">
              same design · safe sandbox
            </p>
          </m.div>

          {/* Annotation 2: side panel, changes per active app */}
          <AnimatePresence mode="wait">
            {activeApp && (
              <m.div
                key={activeApp}
                className="absolute"
                style={{
                  top: "46%",
                  left: "18%",
                  transform: "rotate(2deg)",
                  fontFamily: "'Caveat', cursive",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[16px] leading-snug text-foreground/65 max-w-[150px]">
                  {DEMO_APPS.find((a) => a.id === activeApp)?.annotation}
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
