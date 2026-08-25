import { Button } from "@tailorkit/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  CircleCheck,
  Code2,
  Database,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Footer } from "#components/footer";
import { baseOptions } from "#lib/layout.shared";

export const Route = createFileRoute("/home2")({
  component: HomeTwoPage,
  head: () => ({
    meta: [
      {
        content:
          "TailorKit is secure infrastructure for adding a user-built app ecosystem to your SaaS product.",
        name: "description",
      },
      { title: "TailorKit — App ecosystem infrastructure for SaaS" },
    ],
  }),
});

const definitionPoints = [
  {
    description: "You choose where apps appear and the context each screen receives.",
    icon: Workflow,
    title: "Your routes and data",
  },
  {
    description: "Apps compose the real components and tokens your product already uses.",
    icon: Palette,
    title: "Your design system",
  },
  {
    description: "Sensitive work stays behind typed, authenticated actions on your server.",
    icon: ShieldCheck,
    title: "Your permissions",
  },
] as const;

const capabilities = [
  {
    description:
      "Customers and partners can turn a specific workflow into a working extension instead of waiting on your roadmap.",
    icon: Sparkles,
    title: "A builder for the long tail",
  },
  {
    description:
      "A typed schema defines the screens, components, theme tokens, context, and actions every app can use.",
    icon: Braces,
    title: "A contract, not a blank canvas",
  },
  {
    description:
      "App code runs away from your main thread and describes UI. Your React app renders the final interface.",
    icon: LockKeyhole,
    title: "A deliberately narrow runtime",
  },
] as const;

function HomeTwoPage() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="min-h-screen bg-sidebar text-foreground">
        <div className="mx-auto w-full max-w-[90rem] border-x border-border bg-background">
          <Hero />
          <ProductDefinition />
          <ExampleApps />
          <HowItWorks />
          <Capabilities />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_32%),radial-gradient(circle_at_12%_90%,color-mix(in_srgb,var(--color-amber-400)_9%,transparent),transparent_28%)]" />
      <div className="relative grid min-h-[720px] lg:grid-cols-[minmax(0,0.92fr)_minmax(34rem,1.08fr)]">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:px-14 xl:px-20">
          <Eyebrow>App ecosystem infrastructure for SaaS</Eyebrow>
          <h1 className="mt-7 max-w-[46rem] text-balance font-display text-[clamp(3.25rem,7vw,6.75rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            Let your product grow beyond your roadmap.
          </h1>
          <p className="mt-8 max-w-[39rem] text-pretty text-lg leading-8 text-foreground/62 sm:text-xl sm:leading-9">
            TailorKit lets customers, partners, and AI builders create apps inside your product—
            <span className="text-foreground">
              without handing over your data, interface, or trust boundary.
            </span>
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              render={
                <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                  Talk to a founder
                  <ArrowRight aria-hidden="true" />
                </a>
              }
            />
            <Button size="lg" variant="outline" render={<Link to="/docs">See how it works</Link>} />
          </div>
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/55">
            {["Host-rendered UI", "Sandboxed code", "Typed capabilities"].map((item) => (
              <span className="flex items-center gap-2" key={item}>
                <Check aria-hidden="true" className="size-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[34rem] items-center border-t border-border bg-foreground/[0.018] p-4 sm:p-8 lg:border-l lg:border-t-0 xl:p-12">
          <HostProductPreview />
        </div>
      </div>
    </section>
  );
}

function HostProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[45rem] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-foreground/8">
      <div className="flex h-11 items-center gap-2 border-b border-border bg-sidebar px-4">
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/38">
          Your product · Customer / Acme
        </span>
      </div>
      <div className="grid min-h-[31rem] grid-cols-[4rem_1fr] sm:grid-cols-[11rem_1fr]">
        <aside className="border-r border-border bg-sidebar/55 p-3 sm:p-4">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background">
              A
            </div>
            <span className="hidden text-sm font-semibold sm:block">Atlas</span>
          </div>
          <div className="space-y-2">
            {["Overview", "Customers", "Reports"].map((item, index) => (
              <div
                className={`h-8 rounded-md ${index === 1 ? "bg-primary/10 text-primary" : "text-foreground/42"} flex items-center justify-center text-xs sm:justify-start sm:px-3`}
                key={item}
              >
                <span className="sm:hidden">{item.slice(0, 1)}</span>
                <span className="hidden sm:block">{item}</span>
              </div>
            ))}
          </div>
        </aside>
        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
            <div>
              <div className="mb-2 h-2 w-20 rounded-full bg-foreground/10" />
              <p className="text-xl font-semibold tracking-tight">Acme, Inc.</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </div>
          <div className="mt-5 rounded-xl border border-primary/25 bg-primary/[0.045] p-4 shadow-sm shadow-primary/5 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles aria-hidden="true" className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Renewal planner</p>
                  <p className="text-xs text-foreground/48">A TailorKit app</p>
                </div>
              </div>
              <span className="rounded-md border border-primary/15 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-primary">
                Host rendered
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Renewal", "24 Sep"],
                ["Health", "At risk"],
                ["Owner", "Mina K."],
              ].map(([label, value], index) => (
                <div className="rounded-lg border border-border bg-background/85 p-3" key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/40">{label}</p>
                  <p
                    className={`mt-2 text-sm font-medium ${index === 1 ? "text-amber-700 dark:text-amber-300" : ""}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-border bg-background/85 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium">Suggested next steps</p>
                <span className="text-[10px] text-foreground/38">3 items</span>
              </div>
              {[
                "Confirm implementation goals",
                "Share usage summary",
                "Schedule sponsor review",
              ].map((item, index) => (
                <div
                  className="flex items-center gap-2.5 border-t border-border py-2 text-xs"
                  key={item}
                >
                  <span
                    className={`size-3.5 rounded border ${index === 0 ? "border-primary bg-primary" : "border-border"}`}
                  >
                    {index === 0 ? <Check className="size-3 text-primary-foreground" /> : null}
                  </span>
                  <span
                    className={
                      index === 0 ? "text-foreground/38 line-through" : "text-foreground/70"
                    }
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 rounded-full border border-border bg-background/95 px-3 py-1.5 text-[10px] shadow-lg backdrop-blur">
        App logic isolated · UI stays native
      </div>
    </div>
  );
}

function ProductDefinition() {
  return (
    <section className="grid border-b border-border lg:grid-cols-[0.82fr_1.18fr]">
      <div className="px-6 py-16 sm:px-10 lg:px-14 lg:py-24 xl:px-20">
        <Eyebrow>What TailorKit is</Eyebrow>
        <h2 className="mt-5 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
          A safe extension layer for your product.
        </h2>
      </div>
      <div className="border-t border-border px-6 py-16 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-24 xl:px-20">
        <p className="max-w-[48rem] text-pretty text-xl leading-9 text-foreground/65 sm:text-2xl sm:leading-10">
          TailorKit gives your SaaS an app ecosystem. Apps are built separately, run in a sandbox,
          and describe the interface they need.{" "}
          <span className="text-foreground">
            Your product still owns the page and renders every pixel.
          </span>
        </p>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {definitionPoints.map(({ description, icon: Icon, title }) => (
            <div className="bg-background p-5" key={title}>
              <Icon aria-hidden="true" className="size-5 text-primary" />
              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/52">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type ExampleId = "triage" | "brief";

function ExampleApps() {
  const [activeExample, setActiveExample] = useState<ExampleId>("triage");

  return (
    <section className="border-b border-border px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div>
          <Eyebrow>One product. Thousands of edge cases.</Eyebrow>
          <h2 className="mt-5 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Small apps can solve very specific problems.
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-foreground/58">
            A customer can build the workflow only they need. Because every app targets your typed
            schema, it uses the right data, actions, and interface from the start.
          </p>
          <div aria-label="Example app selector" className="mt-9 space-y-2">
            <ExampleButton
              active={activeExample === "triage"}
              description="Turn customer feedback into an owned queue."
              icon={MessageSquareText}
              onClick={() => setActiveExample("triage")}
              title="Feedback triage"
            />
            <ExampleButton
              active={activeExample === "brief"}
              description="Keep a live, structured brief on every account."
              icon={FileText}
              onClick={() => setActiveExample("brief")}
              title="Customer brief"
            />
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-sidebar/60 p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between px-1 py-1 text-[10px] uppercase tracking-[0.16em] text-foreground/38">
            <span>Live example</span>
            <span>Rendered with host components</span>
          </div>
          {activeExample === "triage" ? <TriageApp /> : <CustomerBriefApp />}
        </div>
      </div>
    </section>
  );
}

function ExampleButton({
  active,
  description,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: typeof FileText;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-primary/30 bg-primary/[0.055]"
          : "border-transparent hover:border-border hover:bg-sidebar/60"
      }`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-sidebar text-foreground/55"}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-foreground/48">{description}</span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className={`size-4 transition-transform ${active ? "translate-x-0 text-primary" : "-translate-x-1 text-foreground/25 group-hover:translate-x-0"}`}
      />
    </button>
  );
}

function AppFrame({
  children,
  name,
  icon: Icon,
}: {
  children: React.ReactNode;
  name: string;
  icon: typeof FileText;
}) {
  return (
    <div className="min-h-[31rem] overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-foreground/[0.04]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-[10px] text-foreground/42">Installed on /customers/:customerId</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-700 dark:text-emerald-300">
          Running
        </span>
      </div>
      {children}
    </div>
  );
}

function TriageApp() {
  const rows = [
    { label: "Export needs custom date ranges", owner: "Mina", priority: "High" },
    { label: "Add a saved report view", owner: "Jules", priority: "Medium" },
    { label: "Notify finance when plans change", owner: "Sam", priority: "Low" },
  ];

  return (
    <AppFrame icon={MessageSquareText} name="Feedback triage">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs text-foreground/45">Acme, Inc.</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">Open requests</h3>
          </div>
          <button
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-medium text-background"
            type="button"
          >
            <Plus aria-hidden="true" className="size-3.5" /> Add request
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          {rows.map((row, index) => (
            <div
              className={`grid gap-3 p-4 sm:grid-cols-[1fr_5rem_5rem] sm:items-center ${index > 0 ? "border-t border-border" : ""}`}
              key={row.label}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1.5 size-2 rounded-full bg-primary" />
                <span className="text-sm font-medium leading-5">{row.label}</span>
              </div>
              <span className="text-xs text-foreground/48">{row.owner}</span>
              <span
                className={`w-fit rounded-full px-2 py-1 text-[10px] ${priorityClassName(row.priority)}`}
              >
                {row.priority}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-foreground/38">
          Built by this customer. Uses your users, permissions, Button, and Table components.
        </p>
      </div>
    </AppFrame>
  );
}

function priorityClassName(priority: string) {
  if (priority === "High") {
    return "bg-red-500/10 text-red-700 dark:text-red-300";
  }

  if (priority === "Medium") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

function CustomerBriefApp() {
  return (
    <AppFrame icon={FileText} name="Customer brief">
      <div className="grid gap-5 p-4 sm:grid-cols-[1fr_12rem] sm:p-6">
        <div>
          <p className="text-xs text-foreground/45">Acme, Inc. / Account brief</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Expansion is tied to SSO rollout
          </h3>
          <div className="mt-6 space-y-5">
            {[
              [
                "Current priority",
                "Move the operations team from pilot to a full rollout before Q4.",
              ],
              [
                "What changed",
                "Security approved the architecture. Procurement needs a final usage estimate.",
              ],
              [
                "Next move",
                "Send a scoped rollout plan and connect their security lead with solutions.",
              ],
            ].map(([title, body]) => (
              <div key={title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/62">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-lg border border-border bg-sidebar/55 p-4">
          <p className="text-xs font-semibold">Key people</p>
          <div className="mt-4 space-y-4">
            {["Priya · Champion", "Ari · Security", "Jo · Procurement"].map((person, index) => (
              <div className="flex items-center gap-2" key={person}>
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-[10px] font-medium ${index === 0 ? "bg-primary/15 text-primary" : "bg-foreground/7 text-foreground/55"}`}
                >
                  {person[0]}
                </span>
                <span className="text-xs text-foreground/58">{person}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppFrame>
  );
}

function HowItWorks() {
  const steps = [
    {
      detail: "Screens · components · actions",
      icon: Code2,
      number: "01",
      title: "Define the contract",
    },
    { detail: "Generated, typed bindings", icon: Braces, number: "02", title: "Build the app" },
    {
      detail: "Opaque-origin iframe + worker",
      icon: LockKeyhole,
      number: "03",
      title: "Run it in a sandbox",
    },
    { detail: "Your React components", icon: Palette, number: "04", title: "Render it natively" },
  ] as const;

  return (
    <section className="border-b border-border bg-foreground/[0.018] px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <div className="mx-auto max-w-6xl text-center">
        <Eyebrow>How the boundary works</Eyebrow>
        <h2 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
          Apps describe. Your product decides.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-foreground/58">
          TailorKit connects independently built app logic to a narrow set of capabilities that you
          define. The app never needs direct access to your DOM, database, or private internals.
        </p>
      </div>
      <div className="mx-auto mt-14 grid max-w-6xl gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ detail, icon: Icon, number, title }) => (
          <div className="relative bg-background p-6 text-left" key={number}>
            <span className="font-mono text-[10px] tracking-widest text-foreground/32">
              {number}
            </span>
            <Icon aria-hidden="true" className="mt-10 size-5 text-primary" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-foreground/45">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-5 flex max-w-6xl items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.045] px-5 py-4 text-center text-sm text-foreground/60">
        <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
        The host remains the source of truth for authentication, authorization, validation, and
        rendering.
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="grid border-b border-border lg:grid-cols-[0.72fr_1.28fr]">
      <div className="px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <Eyebrow>Built for product teams</Eyebrow>
        <h2 className="mt-5 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
          Give builders room to create. Keep the edges firm.
        </h2>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-sidebar/50 px-3 py-1.5 text-xs text-foreground/52">
          <Database aria-hidden="true" className="size-3.5 text-primary" />
          Managed deployment and distribution included
        </div>
      </div>
      <div className="divide-y divide-border border-t border-border lg:border-l lg:border-t-0">
        {capabilities.map(({ description, icon: Icon, title }, index) => (
          <div
            className="grid gap-6 px-6 py-10 sm:grid-cols-[3rem_1fr] sm:px-10 lg:px-14 xl:px-20"
            key={title}
          >
            <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-sidebar/50 text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-foreground/28">0{index + 1}</span>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/55 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:px-10 lg:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_42%)]" />
      <div className="relative mx-auto max-w-4xl">
        <CircleCheck aria-hidden="true" className="mx-auto size-6 text-primary" />
        <h2 className="mt-7 text-balance font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
          Your product, made adaptable.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
          We work directly with early teams to design the right extension surface and get a first
          app running inside their product.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            render={
              <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                Talk to a founder
                <ArrowRight aria-hidden="true" />
              </a>
            }
          />
          <Button size="lg" variant="outline" render={<Link to="/docs">Explore the docs</Link>} />
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}
