import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// biome-ignore lint/correctness/noUnusedVariables: used in JSX descriptions
function B({ children }: { children: ReactNode }) {
  return <span className="text-foreground font-semibold">{children}</span>;
}

const FEATURES = [
  {
    id: "ai-builder",
    label: "AI Builder",
    tag: "AI BUILDER",
    heading: "Generate entire features with AI",
    description: (
      <>
        Customers and partners <B>describe what they need</B>. The AI builder turns that into a{" "}
        <B>fully working, installed extension</B>, using your real design system and APIs from day
        one. No boilerplate, no blank canvas.
      </>
    ),
  },
  {
    id: "design-system",
    label: "Shared Design System",
    tag: "SHARED DESIGN SYSTEM",
    heading: "Every extension looks like your product",
    description: (
      <>
        Builders get your <B>colours, components, and tokens</B> out of the box. There's nothing
        custom to ship. Extensions <B>inherit your brand automatically</B> and stay in sync as you
        evolve it.
      </>
    ),
  },
  {
    id: "secure-runtime",
    label: "Secure Runtime",
    tag: "SECURE RUNTIME",
    heading: "Third-party code that can't hurt you",
    description: (
      <>
        Extension code runs inside an <B>isolated web worker</B>, with UI events and rendering{" "}
        <B>proxied through your host app</B>. The extension can build real product experiences
        without running inside your main application runtime.
      </>
    ),
  },
  {
    id: "managed-hosting",
    label: "Managed Hosting",
    tag: "MANAGED HOSTING",
    heading: "Zero-ops deployment, globally",
    description: (
      <>
        Extensions are deployed and served by TailorKit through our <B>global CDN</B>. No hosting
        pipeline, asset serving, or release infrastructure for you or your builders to manage.
      </>
    ),
  },
] as const;

export function PlatformFeatures() {
  const [activeId, setActiveId] = useState<string>(FEATURES[0].id);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    FEATURES.forEach((feature) => {
      const el = sectionRefs.current[feature.id];
      if (!el) {
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(feature.id);
          }
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="border-b border-border">
      <div className="flex min-h-full">
        {/* Nav column — full height so border-r runs the whole way */}
        <div className="hidden lg:block w-72 flex-shrink-0 border-r border-border">
          <nav className="sticky top-16 flex flex-col gap-1 py-12 px-10">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => scrollTo(f.id)}
                className={clsx(
                  "relative flex items-center py-3 text-left transition-all duration-200",
                  activeId === f.id
                    ? "text-foreground font-semibold text-base"
                    : "text-muted-foreground hover:text-foreground/70 text-sm",
                )}
              >
                {activeId === f.id && (
                  <span className="absolute -left-10 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-primary" />
                )}
                {f.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="flex flex-1 flex-col">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              ref={(el) => {
                sectionRefs.current[feature.id] = el;
              }}
              className={clsx(
                "flex flex-col gap-5 px-8 py-14 lg:px-16 lg:py-20 items-center text-center lg:items-start lg:text-left",
                i < FEATURES.length - 1 && "border-b border-border",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {feature.tag}
              </p>
              <h3 className="text-2xl font-semibold leading-snug text-foreground lg:text-3xl max-w-lg">
                {feature.heading}
              </h3>
              <p className="text-base leading-relaxed text-foreground/60 max-w-xl">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
