import { Button } from "@tailorkit/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
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
  ShieldCheck,
  Sparkles,
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
        <Eyebrow>Secure, native product extensions</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(3rem,5.6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
          Turn user requests into safe, native product features.
        </h1>
        <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-foreground/62 sm:text-xl sm:leading-9">
          TailorKit runs AI- or user-generated code in a sandbox, then renders its UI with the
          components already in your app. Users get tailored workflows; you keep control of data,
          permissions, and the final interface.
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
      <OutcomePreview />
    </section>
  );
}

function OutcomePreview() {
  return (
    <div className="mx-auto mt-12 max-w-7xl px-6 sm:px-10 lg:mt-14 lg:px-14 xl:px-20">
      <div className="overflow-hidden rounded-t-xl border border-border bg-sidebar/35">
        <div className="border-b border-border px-5 py-4 sm:flex sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles aria-hidden="true" className="size-4 text-primary" />
            The end result
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40 sm:mt-0">
            A user-built feature, inside your product
          </p>
        </div>
        <div className="grid divide-y divide-border lg:grid-cols-[17rem_auto_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
          <div className="flex flex-col justify-center bg-background p-5 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/40">
              A user or AI asks
            </p>
            <p className="mt-4 text-xl font-medium leading-8 tracking-tight">
              “Add a renewal checklist to every customer page.”
            </p>
            <p className="mt-4 text-sm leading-6 text-foreground/52">
              They describe the workflow they need. TailorKit turns it into an extension for the
              screen you choose.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 bg-sidebar/60 px-4 py-3 lg:w-16 lg:flex-col lg:px-2">
            <ArrowRight aria-hidden="true" className="size-4 rotate-90 text-primary lg:rotate-0" />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground/38 lg:[writing-mode:vertical-rl]">
              TailorKit
            </span>
          </div>
          <div className="min-w-0 bg-background p-5 sm:p-7">
            <div className="overflow-hidden rounded-lg border border-border bg-sidebar/45">
              <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2.5">
                <span className="size-2 rounded-full bg-foreground/15" />
                <span className="size-2 rounded-full bg-foreground/15" />
                <span className="size-2 rounded-full bg-foreground/15" />
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/36">
                  Your product / customers / acme
                </span>
              </div>
              <div className="grid min-h-[14rem] grid-cols-[3.75rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)]">
                <aside className="border-r border-border bg-sidebar/55 p-2 sm:p-3">
                  <div className="mb-5 flex size-6 items-center justify-center rounded bg-foreground text-[10px] font-semibold text-background sm:mb-7">
                    A
                  </div>
                  <div className="space-y-1.5 text-[10px] text-foreground/42 sm:text-xs">
                    <p className="rounded px-2 py-1.5">Overview</p>
                    <p className="rounded bg-primary/10 px-2 py-1.5 text-primary">Customers</p>
                    <p className="hidden rounded px-2 py-1.5 sm:block">Reports</p>
                  </div>
                </aside>
                <div className="min-w-0 p-3 sm:p-5">
                  <p className="text-[10px] text-foreground/42">Customers / Acme, Inc.</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                    Customer account
                  </h2>
                  <div className="mt-4 rounded-lg border border-primary/25 bg-primary/[0.045] p-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Check aria-hidden="true" className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold">Renewal plan</p>
                        <p className="text-[10px] text-foreground/46">
                          A native-looking product extension
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 border-t border-primary/15 pt-3 text-[11px] text-foreground/67 sm:text-xs">
                      <p className="flex items-center gap-2">
                        <Check className="size-3 text-primary" /> Book sponsor review
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="size-3 rounded border border-border" /> Share usage summary
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border bg-primary/[0.045] px-5 py-3 text-xs leading-5 text-foreground/60 sm:px-6">
          <FeaturePromise>Sandboxed user and AI code</FeaturePromise>
          <FeaturePromise>Uses your existing components</FeaturePromise>
          <FeaturePromise>Only approved data and actions</FeaturePromise>
        </div>
      </div>
    </div>
  );
}

function FeaturePromise({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
      {children}
    </span>
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
