import { Button } from "@tailorkit/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowDown,
  ArrowRight,
  Braces,
  Check,
  Code2,
  Database,
  FileText,
  KeyRound,
  LayoutTemplate,
  LockKeyhole,
  MessageSquareText,
  Palette,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "#components/footer";
import { baseOptions } from "#lib/layout.shared";

export const Route = createFileRoute("/home2")({
  component: HomeTwoPage,
  head: () => ({
    meta: [
      {
        content:
          "TailorKit is the TypeScript framework for adding secure, host-rendered app extensions to your SaaS.",
        name: "description",
      },
      { title: "TailorKit — The extension framework for SaaS" },
    ],
  }),
});

const schemaSnippet = `const tailorKit = createTailorKit({
  components: { Button, Table, ...primitives() },
  screens: { "/customers/:customerId": customerScreen },
  actions: { customers: { updateStatus, createNote } },
});`;

const appSnippet = `const screen = createScreen("/customers/:customerId", {
  component: RenewalPlan,
});`;

const hostControls = [
  {
    description: "Publish only the route context an extension needs for the current screen.",
    icon: Database,
    title: "Data context",
  },
  {
    description: "Expose the components, slots, and theme tokens that match your product.",
    icon: Palette,
    title: "UI surface",
  },
  {
    description: "Keep privileged work behind typed, authenticated server actions.",
    icon: KeyRound,
    title: "Trusted actions",
  },
] as const;

const runtimeSteps = [
  {
    description: "Define screens, components, tokens, context, and actions in your host app.",
    icon: Braces,
    number: "01",
    title: "Define a contract",
  },
  {
    description: "TailorKit generates typed bindings that an app developer imports and composes.",
    icon: Code2,
    number: "02",
    title: "Build independently",
  },
  {
    description: "App code executes in an opaque-origin iframe with an internal worker.",
    icon: LockKeyhole,
    number: "03",
    title: "Isolate app code",
  },
  {
    description: "Your application renders the approved UI and validates every action request.",
    icon: LayoutTemplate,
    number: "04",
    title: "Render in the host",
  },
] as const;

function HomeTwoPage() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="min-h-screen bg-sidebar text-foreground">
        <div className="mx-auto w-full max-w-[90rem] border-x border-border bg-background">
          <Hero />
          <Definition />
          <Examples />
          <Runtime />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 pb-0 pt-14 sm:px-10 sm:pt-16 lg:px-14 lg:pt-20 xl:px-20">
        <Eyebrow>TypeScript framework for SaaS extensions</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(3rem,5.6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
          Add a secure app platform to your SaaS.
        </h1>
        <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-foreground/62 sm:text-xl sm:leading-9">
          TailorKit lets you expose a small, typed extension surface—your screens, components,
          context, and server actions—so users, partners, or AI agents can build custom features
          <span className="text-foreground"> without getting access to your app internals.</span>
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            size="lg"
            render={<Link to="/docs/installation">Read the installation guide</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            render={
              <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                Talk to a founder
                <ArrowRight aria-hidden="true" />
              </a>
            }
          />
        </div>
      </div>
      <ArchitectureDiagram />
    </section>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="mx-auto mt-12 max-w-7xl px-6 sm:px-10 lg:mt-14 lg:px-14 xl:px-20">
      <div className="overflow-hidden rounded-t-xl border border-border bg-sidebar/35">
        <div className="border-b border-border px-5 py-4 sm:flex sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Workflow aria-hidden="true" className="size-4 text-primary" />
            How a TailorKit app reaches your product
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40 sm:mt-0">
            Your host stays in control
          </p>
        </div>
        <div className="grid divide-y divide-border lg:grid-cols-[1.15fr_auto_1fr_auto_1fr] lg:divide-x lg:divide-y-0">
          <DiagramNode
            detail="You define the allowed components, current screen context, and server actions."
            eyebrow="Your SaaS"
            icon={Server}
            title="Host contract"
          >
            <CodeBlock code={schemaSnippet} label="src/lib/tailorkit.ts" />
          </DiagramNode>
          <DiagramArrow label="Generate bindings" />
          <DiagramNode
            detail="An extension imports generated types and describes UI with your approved primitives."
            eyebrow="Separate app"
            icon={Code2}
            title="App code"
          >
            <CodeBlock code={appSnippet} label="src/screens/renewal-plan.tsx" />
          </DiagramNode>
          <DiagramArrow label="Serialized UI + events" />
          <DiagramNode
            detail="TailorKit isolates app code. Your React app renders the real components and handles actions."
            eyebrow="Back in your SaaS"
            icon={LayoutTemplate}
            title="Native product UI"
          >
            <div className="mt-6 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-medium">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                </span>
                Renewal plan
                <span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300">
                  Host rendered
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat label="Renewal" value="24 Sep" />
                <MiniStat label="Health" value="At risk" warn />
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-border px-2 py-2 text-[10px] text-foreground/62">
                <Check aria-hidden="true" className="size-3 text-primary" />
                Share usage summary
              </div>
            </div>
          </DiagramNode>
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-primary/[0.045] px-5 py-3 text-xs leading-5 text-foreground/60 sm:px-6">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
          App code never gets direct access to the host DOM, browser APIs, authentication state, or
          your database.
        </div>
      </div>
    </div>
  );
}

function DiagramNode({
  children,
  detail,
  eyebrow,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  detail: string;
  eyebrow: string;
  icon: typeof Server;
  title: string;
}) {
  return (
    <div className="min-w-0 bg-background p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/38">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 text-sm font-semibold">{title}</h2>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-foreground/56">{detail}</p>
      {children}
    </div>
  );
}

function DiagramArrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 bg-sidebar/60 px-4 py-3 text-center lg:w-12 lg:flex-col lg:px-2">
      <ArrowDown aria-hidden="true" className="size-4 text-primary lg:hidden" />
      <ArrowRight aria-hidden="true" className="hidden size-4 text-primary lg:block" />
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground/38 lg:[writing-mode:vertical-rl]">
        {label}
      </span>
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-foreground/[0.035]">
      <div className="border-b border-border px-3 py-2 font-mono text-[9px] text-foreground/42">
        {label}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-5 text-foreground/72 sm:text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MiniStat({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-md border border-border p-2">
      <p className="text-[9px] uppercase tracking-wider text-foreground/38">{label}</p>
      <p className={`mt-1 text-xs font-medium ${warn ? "text-amber-700 dark:text-amber-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Definition() {
  return (
    <section className="border-b border-border">
      <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
        <div className="px-6 py-16 sm:px-10 lg:px-14 lg:py-24 xl:px-20">
          <Eyebrow>One sentence</Eyebrow>
          <h2 className="mt-5 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Build a controlled extension surface into your product.
          </h2>
        </div>
        <div className="border-t border-border px-6 py-16 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-24 xl:px-20">
          <p className="max-w-3xl text-pretty text-xl leading-9 text-foreground/65 sm:text-2xl sm:leading-10">
            TailorKit is for teams that want users to create product-specific workflows without
            turning every customer request into core product work. You define the safe boundary;
            extensions operate inside it.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {hostControls.map(({ description, icon: Icon, title }) => (
              <div className="bg-background p-5" key={title}>
                <Icon aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-5 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/52">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Examples() {
  return (
    <section className="border-b border-border bg-sidebar/35 px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <SectionIntro
        eyebrow="What users can build"
        title="Specific product workflows, without a fork of your product."
      >
        A TailorKit app is not a separate dashboard. It is a focused feature installed into a screen
        your host already owns, using the components and actions you choose to expose.
      </SectionIntro>
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <ExtensionExample
          action="customers.createNote"
          icon={MessageSquareText}
          path="/customers/:customerId"
          title="Feedback triage"
        >
          A customer-success team turns account feedback into an owned queue, without waiting for a
          bespoke feature in the core product.
        </ExtensionExample>
        <ExtensionExample
          action="tasks.create"
          icon={FileText}
          path="/customers/:customerId"
          title="Renewal plan"
        >
          A partner adds its own renewal checklist to your customer view while the host still
          controls data access and permission checks.
        </ExtensionExample>
      </div>
    </section>
  );
}

function ExtensionExample({
  action,
  children,
  icon: Icon,
  path,
  title,
}: {
  action: string;
  children: ReactNode;
  icon: typeof FileText;
  path: string;
  title: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 font-mono text-[10px] text-foreground/42">Installed at {path}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="max-w-xl text-sm leading-6 text-foreground/60">{children}</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          <div className="bg-sidebar/50 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground/38">
              Reads context
            </p>
            <p className="mt-2 text-xs text-foreground/70">customer · account health · team</p>
          </div>
          <div className="bg-sidebar/50 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground/38">
              Requests action
            </p>
            <p className="mt-2 font-mono text-xs text-primary">{action}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Runtime() {
  return (
    <section className="border-b border-border px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <SectionIntro eyebrow="The runtime model" title="You keep the hard boundaries.">
        TailorKit treats app code as untrusted by default. It does not run on your main thread or
        manipulate your DOM directly; it works through the contract you publish.
      </SectionIntro>
      <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {runtimeSteps.map(({ description, icon: Icon, number, title }) => (
          <div className="bg-background p-6" key={number}>
            <span className="font-mono text-[10px] tracking-widest text-foreground/32">
              {number}
            </span>
            <Icon aria-hidden="true" className="mt-9 size-5 text-primary" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground/52">{description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.045] px-5 py-4 text-sm leading-6 text-foreground/62 sm:flex-row sm:items-center">
        <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <span>
          The host remains responsible for authentication, authorization, validation, and final
          rendering. The sandbox is an additional layer, not a substitute for those controls.
        </span>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <Eyebrow>Start small</Eyebrow>
        <h2 className="mt-6 text-balance font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          Define one screen. Let your product become extensible from there.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
          Start by publishing a small, explicit contract. We can help you identify the right screen
          and capability boundary for a first extension.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            render={<Link to="/docs/installation">Read the installation guide</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            render={
              <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                Talk to a founder
                <ArrowRight aria-hidden="true" />
              </a>
            }
          />
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
        {children}
      </p>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}
