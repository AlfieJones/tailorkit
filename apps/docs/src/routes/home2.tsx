import { Button } from "@tailorkit/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Footer } from "#components/footer";
import { LineShadowText } from "#components/line-shadow";
import { baseOptions } from "#lib/layout.shared";

const contractSteps = [
  {
    description:
      "Choose the screen context, components, theme tokens, and server actions an extension may use.",
    number: "01",
    points: ["Screen context and data", "Your components and styles", "Typed server actions"],
    title: "Expose your product surface",
  },
  {
    description:
      "Users, AI, and partner developers build against that contract. The app code runs in an opaque-origin iframe with an internal worker.",
    number: "02",
    points: ["AI-generated user features", "Partner-built apps", "No host DOM or browser APIs"],
    title: "Build in a sandbox",
  },
  {
    description:
      "TailorKit sends structured UI and event requests back. Your SaaS renders the approved components and validates every action.",
    number: "03",
    points: ["Your design system", "Your auth and permissions", "Host-validated actions"],
    title: "Render with your UI",
  },
] as const;

const guarantees = [
  {
    description:
      "Extensions compose the components and tokens you expose, so they feel native from the first click.",
    title: "Renders your components",
  },
  {
    description:
      "Only the screen context and typed server actions you publish are available to an extension.",
    title: "Receives only what you share",
  },
  {
    description:
      "Untrusted code stays outside your main thread and cannot directly reach your DOM, auth, or database.",
    title: "Stays outside the host",
  },
] as const;

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
          TailorKit gives your SaaS an app ecosystem, with hosting, sandboxing, and agentic builders
          so customers and partners can extend your product using your design system.
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
          <Eyebrow>Native UI, sandboxed code</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
            Extensions look like part of your product.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
            They describe UI with the components and tokens you expose. Their code runs in a
            sandbox, never inside your product&apos;s DOM.
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-border text-left">
          <div className="flex flex-col gap-2 border-b border-border bg-sidebar/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              [ From contract to native UI ]
            </p>
            <p className="text-sm text-foreground/56 sm:max-w-sm sm:text-right">
              Your SaaS owns the data, permissions, and final rendering path.
            </p>
          </div>
          <div className="grid md:grid-cols-3">
            {contractSteps.map(({ description, number, points, title }) => (
              <article
                className="border-b border-border p-6 last:border-b-0 md:border-b-0 md:not-last:border-r"
                key={number}
              >
                <p className="font-mono text-[10px] tracking-[0.16em] text-primary">{number}</p>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/58">{description}</p>
                <ul className="mt-5 space-y-2 border-l border-primary/45 pl-3 text-xs leading-5 text-foreground/68">
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-6 text-foreground/52">
          The host only receives structured UI and event requests. App code never gets direct access
          to the host DOM, browser APIs, authentication state, or your database.
        </p>
        <div className="mt-8 grid overflow-hidden border border-border text-left md:grid-cols-3">
          {guarantees.map(({ description, title }) => (
            <article
              className="border-b border-border p-5 last:border-b-0 md:border-b-0 md:not-last:border-r"
              key={title}
            >
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/58">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
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
