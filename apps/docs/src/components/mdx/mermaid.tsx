"use client";

import { use, useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return;
  }
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return cached as Promise<T>;
  }

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(cachePromise("mermaid", () => import("mermaid")));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    fontFamily: "inherit",
    darkMode: resolvedTheme === "dark",
    themeCSS: `
      .node rect,
      .node polygon,
      .node circle,
      .node ellipse {
        fill: var(--color-muted) !important;
        stroke: var(--color-border) !important;
      }

      .cluster rect {
        fill: var(--color-card) !important;
        stroke: var(--color-border) !important;
        rx: 0.5rem;
        ry: 0.5rem;
      }

      .nodeLabel,
      .label,
      .edgeLabel,
      .labelBkg {
        background-color: var(--color-muted) !important;
      }

      .edgeLabel p {
        background-color: var(--color-background) !important;
      }


       .edgePath path {
        stroke: var(--color-border) !important;
      }

      .arrowheadPath {
        fill: var(--color-border) !important;
      }
    `,
    theme: resolvedTheme === "dark" ? "dark" : "default",
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(id, chart.replaceAll("\\n", "\n")),
    ),
  );

  return (
    <div
      ref={(container) => {
        if (container) {
          bindFunctions?.(container);
        }
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
