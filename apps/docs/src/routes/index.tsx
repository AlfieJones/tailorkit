import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <Features />
        <CallToAction />
      </main>
    </HomeLayout>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-fd-border overflow-hidden">
      {/* Wireframe grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-fd-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-fd-foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36">
        <div className="inline-flex items-center gap-2 border border-dashed border-fd-border rounded-full px-3 py-1 text-xs text-fd-muted-foreground mb-8 font-mono">
          <span className="size-1.5 rounded-full bg-fd-primary inline-block" />
          Open source · TypeScript-first
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-fd-foreground max-w-3xl leading-tight">
          Let users build extensions{" "}
          <span className="relative inline-block">
            <span className="relative z-10">inside your app.</span>
            <span className="absolute inset-x-0 bottom-1 h-[0.15em] bg-fd-primary/30 z-0" />
          </span>
        </h1>

        <p className="mt-6 text-lg text-fd-muted-foreground max-w-xl leading-relaxed">
          TailorKit is a framework for embedding sandboxed apps inside your product. Extensions get
          your design system, typed context, and independent deploys — without owning your router.
        </p>

        <div className="mt-10 flex items-center gap-4 flex-wrap">
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-fd-primary text-fd-primary-foreground text-sm font-medium hover:bg-fd-primary/90 transition-colors"
          >
            Get started
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/alfiejones/tailorkit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-fd-border text-fd-foreground text-sm font-medium hover:bg-fd-accent transition-colors"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Architecture demo */}
        <div className="mt-20">
          <ArchitectureDemo />
        </div>
      </div>
    </section>
  );
}

function ArchitectureDemo() {
  return (
    <div className="relative grid md:grid-cols-[1fr_1.1fr] gap-3">
      {/* Left — running app */}
      <AppWindow />
      {/* Right — code editor */}
      <EditorWindow />
    </div>
  );
}

function WindowChrome({
  title,
  badge,
  children,
  dark,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden border ${dark ? "border-white/10 bg-[#0e0e0e]" : "border-dashed border-fd-border bg-fd-background"}`}
    >
      {/* Title bar */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b ${dark ? "border-white/10 bg-white/5" : "border-dashed border-fd-border bg-fd-muted/20"}`}
      >
        <div className="flex gap-1.5 shrink-0">
          <span
            className={`size-2.5 rounded-full ${dark ? "bg-white/10" : "border border-fd-border"}`}
          />
          <span
            className={`size-2.5 rounded-full ${dark ? "bg-white/10" : "border border-fd-border"}`}
          />
          <span
            className={`size-2.5 rounded-full ${dark ? "bg-white/10" : "border border-fd-border"}`}
          />
        </div>
        <span
          className={`text-[11px] font-mono truncate ${dark ? "text-white/30" : "text-fd-muted-foreground"}`}
        >
          {title}
        </span>
        {badge && (
          <span className="ml-auto shrink-0 text-[10px] font-mono text-fd-primary bg-fd-primary/10 border border-fd-primary/20 rounded px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function AppWindow() {
  return (
    <WindowChrome title="acme-crm.app / contacts / sarah">
      {/* Minimal app chrome */}
      <div className="flex h-[340px]">
        {/* Sidebar */}
        <div className="w-[72px] shrink-0 border-r border-dashed border-fd-border p-2 space-y-1">
          {[28, 22, 26, 20, 24].map((w, i) => (
            <div
              key={i}
              className={`h-5 rounded border border-dashed border-fd-border flex items-center px-1.5 ${i === 1 ? "bg-fd-muted/60" : ""}`}
            >
              <div className="h-1.5 rounded-sm bg-fd-muted" style={{ width: `${w}px` }} />
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb / header */}
          <div className="border-b border-dashed border-fd-border px-3 py-2 flex items-center gap-2">
            <div className="h-1.5 w-10 rounded bg-fd-muted/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-fd-muted/40" />
            <div className="h-1.5 w-14 rounded bg-fd-muted" />
            <div className="h-5 w-14 rounded border border-dashed border-fd-border ml-auto flex items-center justify-center">
              <div className="h-1.5 w-9 rounded-sm bg-fd-muted" />
            </div>
          </div>

          <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {/* Contact hero */}
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full border border-dashed border-fd-border bg-fd-muted/20 shrink-0" />
              <div className="space-y-1">
                <div className="h-2.5 w-24 rounded bg-fd-foreground/15" />
                <div className="h-1.5 w-16 rounded bg-fd-muted/60" />
              </div>
            </div>

            {/* Field grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[32, 40, 28, 36].map((w, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="h-1.5 w-10 rounded bg-fd-muted/50" />
                  <div className="h-2 rounded bg-fd-muted" style={{ width: `${w + 16}px` }} />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-fd-border" />

            {/* Extension slot */}
            <div className="relative border-2 border-dashed border-fd-primary/40 rounded-lg bg-fd-primary/[0.03] p-2.5">
              <span className="absolute -top-[9px] left-2.5 bg-fd-background px-1 text-[9px] font-mono text-fd-primary font-medium tracking-wide">
                extension
              </span>

              {/* Rendered extension UI — matches what the code builds */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded bg-fd-primary/25" />
                  <div className="h-1.5 w-10 rounded bg-fd-muted/50 ml-auto" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-6 rounded border border-dashed border-fd-primary/30 bg-fd-primary/[0.06] flex items-center px-2 gap-1.5">
                    <div className="size-2.5 rounded-full border border-dashed border-fd-primary/40 shrink-0" />
                    <div className="h-1.5 flex-1 rounded bg-fd-primary/20" />
                  </div>
                  <div className="flex-1 h-6 rounded border border-dashed border-fd-primary/30 bg-fd-primary/[0.06] flex items-center px-2 gap-1.5">
                    <div className="size-2.5 rounded-full border border-dashed border-fd-primary/40 shrink-0" />
                    <div className="h-1.5 flex-1 rounded bg-fd-primary/20" />
                  </div>
                </div>
                <div className="h-6 w-24 rounded bg-fd-primary/20 border border-dashed border-fd-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

function EditorWindow() {
  const lines: { indent: number; tokens: { t: string; c: string }[] }[] = [
    {
      indent: 0,
      tokens: [
        { t: "import", c: "text-purple-400" },
        { t: " { h } ", c: "text-white/70" },
        { t: "from", c: "text-purple-400" },
        { t: ' "preact"', c: "text-amber-300" },
      ],
    },
    {
      indent: 0,
      tokens: [
        { t: "import", c: "text-purple-400" },
        { t: " { Button, Row } ", c: "text-white/70" },
        { t: "from", c: "text-purple-400" },
        { t: ' "#tailorkit"', c: "text-sky-300" },
      ],
    },
    { indent: 0, tokens: [] },
    {
      indent: 0,
      tokens: [
        { t: "export default function", c: "text-purple-400" },
        { t: " ContactScreen", c: "text-yellow-300" },
        { t: "({ context }) {", c: "text-white/70" },
      ],
    },
    {
      indent: 1,
      tokens: [
        { t: "return", c: "text-purple-400" },
        { t: " (", c: "text-white/70" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { t: "<", c: "text-white/40" },
        { t: "Row", c: "text-sky-300" },
        { t: " gap", c: "text-green-300" },
        { t: '="md"', c: "text-amber-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    {
      indent: 3,
      tokens: [
        { t: "<", c: "text-white/40" },
        { t: "Button", c: "text-sky-300" },
        { t: " variant", c: "text-green-300" },
        { t: '="primary"', c: "text-amber-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    { indent: 4, tokens: [{ t: "Send email", c: "text-white/60" }] },
    {
      indent: 3,
      tokens: [
        { t: "</", c: "text-white/40" },
        { t: "Button", c: "text-sky-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    {
      indent: 3,
      tokens: [
        { t: "<", c: "text-white/40" },
        { t: "Button", c: "text-sky-300" },
        { t: " variant", c: "text-green-300" },
        { t: '="secondary"', c: "text-amber-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    { indent: 4, tokens: [{ t: "Schedule call", c: "text-white/60" }] },
    {
      indent: 3,
      tokens: [
        { t: "</", c: "text-white/40" },
        { t: "Button", c: "text-sky-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { t: "</", c: "text-white/40" },
        { t: "Row", c: "text-sky-300" },
        { t: ">", c: "text-white/40" },
      ],
    },
    { indent: 1, tokens: [{ t: ")", c: "text-white/70" }] },
    { indent: 0, tokens: [{ t: "}", c: "text-white/70" }] },
  ];

  return (
    <WindowChrome title="my-extension / contact.tsx" badge="ships independently" dark>
      {/* Tab bar */}
      <div className="flex border-b border-white/10 text-[11px] font-mono">
        <div className="px-3 py-1.5 text-white/80 border-r border-white/10 bg-white/5 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-sky-400/70" />
          contact.tsx
        </div>
        <div className="px-3 py-1.5 text-white/25 border-r border-white/10 flex items-center gap-1.5">
          tailorkit.gen.ts
        </div>
      </div>

      {/* Code */}
      <div className="p-4 h-[296px] overflow-hidden">
        <pre className="text-[11px] leading-[1.65] font-mono">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 shrink-0 text-right text-white/15 mr-4 select-none">
                {i + 1}
              </span>
              <span>
                {"  ".repeat(line.indent)}
                {line.tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.tokens.map((tok, j) => (
                    <span key={j} className={tok.c}>
                      {tok.t}
                    </span>
                  ))
                )}
              </span>
            </div>
          ))}
        </pre>
      </div>

      {/* Status bar */}
      <div className="border-t border-white/10 px-3 py-1.5 flex items-center gap-3 bg-white/[0.03]">
        <span className="text-[10px] font-mono text-white/25">TypeScript</span>
        <span className="text-[10px] font-mono text-white/25">·</span>
        <span className="text-[10px] font-mono text-green-400/60">0 errors</span>
        <span className="text-[10px] font-mono text-white/25 ml-auto">
          context: Contact — fully typed
        </span>
      </div>
    </WindowChrome>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Define your extension points",
      description:
        "Wrap any part of your UI with ScreenMatch. Declare what context and components the slot exposes to installed apps.",
      code: `<tailor.ScreenMatch
  pattern="/contacts/:id"
  context={{ contact }}
  screen="/contact"
>
  <ContactPage />
</tailor.ScreenMatch>`,
    },
    {
      number: "02",
      title: "Apps build against your schema",
      description:
        "App developers get a generated TypeScript client with your components, typed context, and screen bindings. No host source access needed.",
      code: `// generated by tailorkit
export type ScreenProps<"/contact"> = {
  context: { contact: Contact }
}
export { Button, Stack, Text }`,
    },
    {
      number: "03",
      title: "Render sandboxed, ship independently",
      description:
        "Apps run in an isolated worker. The host renders the serialized view — no app JS runs in your main thread.",
      code: `const { apps } = tailor.useApps();

return apps.map((app) => (
  <tailor.Screen
    key={app.id}
    app={app}
  />
));`,
    },
  ];

  return (
    <section className="border-b border-fd-border">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold text-fd-foreground mt-3 mb-14">
          Three concepts. Full control.
        </h2>

        <div className="space-y-0 divide-y divide-dashed divide-fd-border border border-dashed border-fd-border rounded-xl overflow-hidden">
          {steps.map((step) => (
            <div key={step.number} className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:border-r border-dashed border-fd-border">
                <span className="text-[11px] font-mono text-fd-muted-foreground">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-fd-foreground mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="p-8 bg-fd-muted/20">
                <pre className="text-[11px] font-mono text-fd-foreground leading-relaxed whitespace-pre">
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} strokeDasharray="3 2" />
          <path d="M9 9h6M9 12h6M9 15h4" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      ),
      title: "Sandboxed execution",
      description:
        "App code runs in a worker. The main thread only receives a serialized React tree — no direct DOM access, no XSS surface.",
    },
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Your design system",
      description:
        "Apps import components from your generated package. The host renders them — extensions get your exact styles without shipping your bundle.",
    },
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Typed contract",
      description:
        "TailorKit generates a TypeScript schema from your screen definitions. Apps get autocomplete, type errors, and safe refactors.",
    },
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
          <path
            d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Independent deploys",
      description:
        "Apps are fetched at runtime from a registry. Ship app updates without touching the host. Roll back without a host deploy.",
    },
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Route-scoped context",
      description:
        "Each ScreenMatch declares exactly what data it exposes. Apps see only the context for their current screen — nothing more.",
    },
    {
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Host owns everything",
      description:
        "Routing, authentication, and data loading stay in your product. Apps can't intercept navigation or access stores they weren't given.",
    },
  ];

  return (
    <section className="border-b border-fd-border">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <SectionLabel>Features</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold text-fd-foreground mt-3 mb-14">
          Built for production extension points.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-fd-border border border-fd-border rounded-xl overflow-hidden">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-fd-background p-6 hover:bg-fd-muted/30 transition-colors"
            >
              <div className="text-fd-muted-foreground mb-4 p-2 border border-dashed border-fd-border rounded-lg w-fit">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-fd-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="border border-dashed border-fd-border rounded-xl p-12 text-center relative overflow-hidden">
          {/* Corner accents */}
          <span className="absolute top-3 left-3 text-fd-muted-foreground/30 font-mono text-xs select-none">
            ┌─
          </span>
          <span className="absolute top-3 right-3 text-fd-muted-foreground/30 font-mono text-xs select-none">
            ─┐
          </span>
          <span className="absolute bottom-3 left-3 text-fd-muted-foreground/30 font-mono text-xs select-none">
            └─
          </span>
          <span className="absolute bottom-3 right-3 text-fd-muted-foreground/30 font-mono text-xs select-none">
            ─┘
          </span>

          <h2 className="text-2xl md:text-3xl font-semibold text-fd-foreground mb-4">
            Ready to add extension points?
          </h2>
          <p className="text-fd-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            Follow the quickstart to add your first ScreenMatch in under 10 minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-fd-primary text-fd-primary-foreground text-sm font-medium hover:bg-fd-primary/90 transition-colors"
            >
              Read the docs
            </Link>
            <a
              href="https://github.com/alfiejones/tailorkit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-dashed border-fd-border text-fd-foreground text-sm font-medium hover:bg-fd-accent transition-colors font-mono"
            >
              npm install tailorkit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono text-fd-muted-foreground uppercase tracking-widest">
      {children}
    </span>
  );
}
