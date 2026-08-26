import { Button } from "@tailorkit/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowDown, ArrowRight, Braces, LayoutTemplate, LockKeyhole } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Footer } from "#components/footer";
import { LineShadowText } from "#components/line-shadow";
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

function HomeTwoPage() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="min-h-screen bg-sidebar text-foreground">
        <div className="mx-auto w-full max-w-6xl border-x border-border bg-background">
          <Hero />
          <ContractDiagram />
          <BuildModes />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}

function Hero() {
  const theme = useTheme();
  const [shadowColor, setShadowColor] = useState("white");

  useEffect(() => {
    setShadowColor(theme.resolvedTheme === "light" ? "black" : "white");
  }, [theme.resolvedTheme]);

  return (
    <section className="border-b border-border px-6 py-24 text-center sm:px-10 sm:py-28 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-balance font-display text-[clamp(3rem,7.5vw,5.75rem)] font-semibold leading-[0.93] tracking-[-0.065em]">
          Let users build the features they want with{" "}
          <LineShadowText className="whitespace-nowrap text-primary" shadowColor={shadowColor}>
            AI.
          </LineShadowText>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-foreground/62 sm:text-xl sm:leading-8">
          TailorKit lets users, AI, and partners build extensions inside your SaaS. Those extensions
          run in a sandbox and use the components, data, and actions you choose to expose.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            render={
              <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                Talk to a founder
              </a>
            }
          />
          <Button size="lg" variant="outline" render={<Link to="/docs">Read the docs</Link>} />
        </div>
      </div>
    </section>
  );
}

function ContractDiagram() {
  return (
    <section className="border-b border-border px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What TailorKit does</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
            A safe way to run extensions inside your SaaS.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
            Users, AI, and partners build apps independently. You decide what those apps can use,
            and your product always renders the final interface.
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-border text-left">
          <div className="flex flex-col gap-2 border-b border-border bg-sidebar/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              [ How an extension reaches your product ]
            </p>
            <p className="text-sm text-foreground/56 sm:max-w-sm sm:text-right">
              Your SaaS owns the data, permissions, and final rendering path.
            </p>
          </div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)_4.5rem_minmax(0,1fr)]">
            <article className="p-6">
              <StageLabel icon={Braces} number="01" title="Your SaaS" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                You choose the building blocks.
              </h3>
              <p className="mt-3 text-sm leading-6 text-foreground/58">
                Publish only the context, components, and server actions that belong on a screen.
              </p>
              <div className="mt-5 space-y-3 border border-border bg-sidebar/30 p-4 font-mono text-[10px] text-foreground/68">
                <p className="text-primary">/customers/:customerId</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="border border-border bg-background px-2 py-1">Button</span>
                  <span className="border border-border bg-background px-2 py-1">Badge</span>
                  <span className="border border-border bg-background px-2 py-1">Table</span>
                </div>
                <p>actions: createNote, updateStatus</p>
              </div>
            </article>

            <FlowArrow label="Your contract" />

            <article className="border-y border-border bg-primary/[0.045] p-6 lg:border-y-0">
              <StageLabel icon={LockKeyhole} number="02" title="TailorKit sandbox" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">Apps build separately.</h3>
              <p className="mt-3 text-sm leading-6 text-foreground/58">
                User prompts, AI-generated features, and partner apps run outside your main thread.
              </p>
              <div className="mt-5 border border-primary/30 bg-background p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
                  User request
                </p>
                <p className="mt-2 text-sm font-medium">“Add a renewal checklist.”</p>
                <div className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-foreground/56">
                  Opaque-origin iframe + worker
                </div>
              </div>
            </article>

            <FlowArrow label="Structured UI + events" />

            <article className="p-6">
              <StageLabel icon={LayoutTemplate} number="03" title="Your product" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                Your UI renders natively.
              </h3>
              <p className="mt-3 text-sm leading-6 text-foreground/58">
                The host renders real components and validates every requested action.
              </p>
              <div className="mt-5 overflow-hidden border border-border bg-sidebar/30">
                <div className="border-b border-border bg-background px-3 py-2 font-mono text-[9px] text-foreground/48">
                  Customers / Acme, Inc.
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Renewal checklist</p>
                    <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
                      At risk
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-[10px] text-foreground/58">
                    <p className="border-l-2 border-primary pl-2">Share usage summary</p>
                    <p className="border-l-2 border-border pl-2">Schedule renewal review</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <p className="border-t border-border bg-sidebar/30 px-5 py-4 text-center text-sm leading-6 text-foreground/58 sm:px-6">
            Extensions can only use what your app publishes. They never get direct access to your
            DOM, auth state, browser APIs, or database.
          </p>
        </div>
      </div>
    </section>
  );
}

function StageLabel({
  icon: Icon,
  number,
  title,
}: {
  icon: typeof Braces;
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-primary">
        <Icon aria-hidden="true" className="size-4" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]">{title}</p>
      </div>
      <p className="font-mono text-[10px] tracking-[0.16em] text-foreground/38">{number}</p>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-y border-border p-3 text-center lg:border-y-0">
      <ArrowRight aria-hidden="true" className="hidden size-4 text-primary lg:block" />
      <ArrowDown aria-hidden="true" className="size-4 text-primary lg:hidden" />
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground/44">{label}</p>
    </div>
  );
}

function BuildModes() {
  return (
    <section className="border-b border-border px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Eyebrow>Two ways to extend</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
            One-off features and reusable apps.
          </h2>
        </div>
        <div className="mt-10 grid overflow-hidden border border-border md:grid-cols-2">
          <article className="border-b border-border p-6 md:border-b-0 md:border-r">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              For users
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Ask AI for a feature.</h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-foreground/58">
              A user describes the workflow they need. TailorKit AI builds a focused feature for
              their workspace, using the product surface you provide.
            </p>
            <p className="mt-5 border-l-2 border-primary pl-3 text-sm text-foreground/72">
              “Create a renewal checklist for my accounts.”
            </p>
          </article>
          <article className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              For partners and product teams
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              Ship an app others can install.
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-foreground/58">
              Developers build against the same contract and distribute a reusable integration or
              workflow to the customers that need it.
            </p>
            <p className="mt-5 border-l-2 border-primary pl-3 text-sm text-foreground/72">
              “Connect our ERP and show renewal status.”
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Start with one screen</Eyebrow>
        <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
          Make one part of your product extensible.
        </h2>
        <p className="mt-5 text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
          Publish a small contract for the route, components, and actions that make the most sense
          to open up first.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<a href="/docs/installation">Read the installation guide</a>} />
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

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}
