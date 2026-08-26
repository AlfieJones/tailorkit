import { ImageDithering } from "@paper-design/shaders-react";
import { Button } from "@tailorkit/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "@tailorkit/ui/popover";
import { Slider } from "@tailorkit/ui/slider";
import { Switch } from "@tailorkit/ui/switch";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowRight,
  Braces,
  Code2,
  Database,
  KeyRound,
  LayoutTemplate,
  LockKeyhole,
  MessageSquareText,
  Palette,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Footer } from "#components/footer";
import { LineShadowText } from "#components/line-shadow";
import { baseOptions } from "#lib/layout.shared";

const chameleonHues = [165, 26, 217, 252, 295];
const transparentColor = "rgba(0, 0, 0, 0)";
const darkInkColor = "#c8bdf7";

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
        <div className="mx-auto w-full max-w-7xl border-x border-border bg-background">
          <ChameleonHero />
          <ProductPaths />
          <NativeAndSafe />
          <Runtime />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}

function ChameleonHero() {
  const [hue, setHue] = useState(165);
  const [hueIndex, setHueIndex] = useState(0);
  const [autoHue, setAutoHue] = useState(true);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [showCowboyHat, setShowCowboyHat] = useState(false);
  const [showMonocle, setShowMonocle] = useState(false);
  const theme = useTheme();
  const [shadowColor, setShadowColor] = useState("white");
  const currentHue = autoHue ? chameleonHues[hueIndex] : hue;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHueIndex((current) => (current + 1) % chameleonHues.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setShadowColor(theme.resolvedTheme === "light" ? "black" : "white");
  }, [theme.resolvedTheme]);

  return (
    <section className="relative flex h-[calc(100svh-4rem)] min-h-[900px] w-full max-h-[980px] overflow-hidden border-b border-border sm:min-h-[860px] md:h-[calc(100svh-6.5rem)]">
      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-8 sm:px-10 lg:px-16 lg:pt-10">
        <div className="flex flex-1 flex-col gap-8 pb-10 md:pb-16 lg:gap-10">
          <div className="max-w-[64rem] pt-6 sm:pt-8 lg:pt-10">
            <h1 className="text-balance font-display text-[clamp(2.55rem,12.5vw,3.6rem)] font-bold leading-[0.94] tracking-tight text-foreground sm:text-[4.1rem] md:text-[4.55rem] lg:text-[4.9rem] xl:text-[4.95rem]">
              <span className="block">Let users build</span>
              <span className="block">
                the features they want{" "}
                <LineShadowText
                  className="whitespace-nowrap text-primary"
                  shadowColor={shadowColor}
                >
                  with AI
                </LineShadowText>
              </span>
            </h1>
          </div>

          <div className="relative z-20 max-w-[34rem]">
            <p className="max-w-[34rem] text-pretty text-lg leading-snug text-foreground/60 sm:text-xl md:text-[1.35rem]">
              TailorKit gives your SaaS an <span className="text-foreground">app ecosystem</span>,
              with <span className="text-foreground">hosting</span>,{" "}
              <span className="text-foreground">sandboxing</span>, and{" "}
              <span className="text-foreground">agentic builders</span> so customers and partners
              can easily extend your product using your{" "}
              <span className="text-foreground">design system</span>.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button
                variant="default"
                render={
                  <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                    Talk to a Founder
                  </a>
                }
              />
              <Button variant="secondary" render={<Link to="/docs">Read the docs</Link>} />
            </div>
          </div>
        </div>
        <div className="relative z-20 mb-24 mt-auto flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[24rem] font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-foreground-muted sm:max-w-none lg:whitespace-nowrap">
            Make your software adapt like a chameleon to every user.
          </p>

          <ChameleonControls
            autoHue={autoHue}
            hue={currentHue}
            onAutoHueChange={setAutoHue}
            onCowboyHatChange={setShowCowboyHat}
            onHueChange={setHue}
            onMonocleChange={setShowMonocle}
            onOpenChange={setCustomizeOpen}
            open={customizeOpen}
            showCowboyHat={showCowboyHat}
            showMonocle={showMonocle}
          />
        </div>
      </div>

      <ChameleonDither hue={currentHue} showCowboyHat={showCowboyHat} showMonocle={showMonocle} />
      <HeroFooter />
    </section>
  );
}

function ChameleonDither({
  hue,
  showCowboyHat,
  showMonocle,
}: {
  hue: number;
  showCowboyHat: boolean;
  showMonocle: boolean;
}) {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const isDarkTheme = isDark === true;
  const targetColor = hueToHex(hue, isDarkTheme);
  const [colorFront, setColorFront] = useState(targetColor);
  const colorFrontRef = useRef(targetColor);
  const hasResolvedThemeRef = useRef(false);

  useEffect(() => {
    if (isDark === null) {
      return;
    }

    if (!hasResolvedThemeRef.current) {
      colorFrontRef.current = targetColor;
      setColorFront(targetColor);
      hasResolvedThemeRef.current = true;
      return;
    }

    const startColor = colorFrontRef.current;
    const duration = 1800;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const mixedColor = mixHexColor(startColor, targetColor, eased);

      colorFrontRef.current = mixedColor;
      setColorFront(mixedColor);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [isDark, targetColor]);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    const observer = new MutationObserver(updateTheme);

    updateTheme();
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none absolute -right-[34vw] bottom-16 z-0 aspect-[16/12] w-[112vw] max-h-[720px] origin-bottom-right opacity-35 mix-blend-multiply dark:mix-blend-screen sm:-right-[28vw] sm:bottom-12 sm:w-[86vw] sm:opacity-45 md:-right-[20vw] md:-bottom-6 md:w-[66vw] md:opacity-60 lg:-right-[13vw] lg:bottom-14 lg:w-[52vw] lg:opacity-100 xl:-right-[10vw] xl:bottom-0 xl:w-[48vw] 2xl:-right-[8vw] 2xl:-bottom-8">
      <div className="relative h-full w-full">
        {isDark === null ? null : (
          <>
            <ImageDithering
              className="absolute inset-0"
              colorBack={transparentColor}
              colorFront={isDarkTheme ? darkInkColor : "#111111"}
              colorHighlight="#a191f1"
              colorSteps={1}
              fit="contain"
              height={1254}
              image="/docs/chameleon-branch.webp"
              inverted={false}
              originalColors={false}
              size={1.25}
              style={{ backgroundColor: "transparent", height: "100%", width: "100%" }}
              type="2x2"
              width={1254}
            />
            <ImageDithering
              className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen"
              colorBack={transparentColor}
              colorFront={colorFront}
              colorHighlight="#a191f1"
              colorSteps={1}
              fit="contain"
              height={1254}
              image="/docs/chameleon-no-branch.webp"
              inverted={false}
              originalColors={false}
              size={1.5}
              style={{ backgroundColor: "transparent", height: "100%", width: "100%" }}
              type="2x2"
              width={1254}
            />
            {showCowboyHat ? (
              <ImageDithering
                className="absolute inset-0 opacity-100 mix-blend-multiply dark:mix-blend-screen"
                colorBack={transparentColor}
                colorFront={isDarkTheme ? "#d2a56f" : "#8a5524"}
                colorHighlight={isDarkTheme ? "#f0d0a3" : "#c47b32"}
                colorSteps={1}
                fit="contain"
                height={1254}
                image="/docs/chameleon-cowboy-hat.webp"
                inverted={true}
                originalColors={false}
                size={1}
                style={{ backgroundColor: "transparent", height: "100%", width: "100%" }}
                type="8x8"
                width={1254}
              />
            ) : null}
            {showMonocle ? (
              <ImageDithering
                className="absolute inset-0 opacity-80 mix-blend-multiply dark:mix-blend-screen"
                colorBack={transparentColor}
                colorFront={isDarkTheme ? "#d8d8d8" : "#111111"}
                colorHighlight={isDarkTheme ? "#f2f2f2" : "#111111"}
                colorSteps={1}
                fit="contain"
                height={1254}
                image="/docs/chameleon-monocle.webp"
                inverted={true}
                originalColors={false}
                size={1.5}
                style={{ backgroundColor: "transparent", height: "100%", width: "100%" }}
                type="2x2"
                width={1254}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function ChameleonControls({
  autoHue,
  hue,
  onAutoHueChange,
  onCowboyHatChange,
  onHueChange,
  onMonocleChange,
  onOpenChange,
  open,
  showCowboyHat,
  showMonocle,
}: {
  autoHue: boolean;
  hue: number;
  onAutoHueChange: (checked: boolean) => void;
  onCowboyHatChange: (checked: boolean) => void;
  onHueChange: (value: number) => void;
  onMonocleChange: (checked: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  showCowboyHat: boolean;
  showMonocle: boolean;
}) {
  return (
    <div className="relative z-30 w-[min(26rem,100%)] shrink-0">
      <Popover onOpenChange={onOpenChange} open={open}>
        <Button variant="secondary" render={<PopoverTrigger>Customize</PopoverTrigger>} />
        <PopoverPopup
          align="end"
          className="w-[min(24rem,calc(100vw-3rem))]"
          side="top"
          sideOffset={12}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 text-sm text-foreground/70">
              <span>Monocle</span>
              <Switch
                aria-label="Monocle"
                checked={showMonocle}
                onCheckedChange={onMonocleChange}
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-sm text-foreground/70">
              <span>Cowboy hat</span>
              <Switch
                aria-label="Cowboy hat"
                checked={showCowboyHat}
                onCheckedChange={onCowboyHatChange}
              />
            </div>
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3">
              <span className="text-sm text-foreground/70">Hue</span>
              <Slider
                max={360}
                min={0}
                onValueChange={(value) => {
                  onAutoHueChange(false);
                  onHueChange(Array.isArray(value) ? value[0] : value);
                }}
                value={hue}
              />
              <span
                className="size-5 rounded-full border border-border"
                style={{ backgroundColor: hueToHex(hue, false) }}
              />
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Switch aria-label="Auto hue" checked={autoHue} onCheckedChange={onAutoHueChange} />
                Auto
              </div>
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  );
}

function mixHexColor(from: string, to: string, amount: number) {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);

  return `#${fromRgb
    .map((channel, index) =>
      Math.round(channel + (toRgb[index] - channel) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");

  return [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
}

function hueToHex(hue: number, isDark: boolean) {
  return hslToHex(hue, isDark ? 72 : 82, isDark ? 68 : 34);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: number[];
  if (hue < 60) {
    rgb = [c, x, 0];
  } else if (hue < 120) {
    rgb = [x, c, 0];
  } else if (hue < 180) {
    rgb = [0, c, x];
  } else if (hue < 240) {
    rgb = [0, x, c];
  } else if (hue < 300) {
    rgb = [x, 0, c];
  } else {
    rgb = [c, 0, x];
  }

  return `#${rgb
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function HeroFooter() {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 bg-background/95 backdrop-blur-sm"
      data-hero-separator
    >
      <SectionSeparator />
    </div>
  );
}

function SectionSeparator() {
  return (
    <div className="relative h-16 overflow-hidden border-y border-border bg-background">
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        <div className="h-px bg-border/35" />
        <div className="h-px bg-border/55" />
        <div className="h-px bg-border/75" />
        <div className="h-px bg-border/55" />
        <div className="h-px bg-border/35" />
      </div>
    </div>
  );
}

function ProductPaths() {
  return (
    <section className="border-b border-border px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionIntro
          eyebrow="[ Builder modes ]"
          title="One platform for user features and partner apps."
        >
          Users can ask AI to add a focused feature to their workspace. Product teams and partners
          can publish reusable apps against the same contract. Your SaaS owns the screen either way.
        </SectionIntro>
        <div className="overflow-hidden border border-border">
          <BuildPath
            detail="A user describes the workflow they need. TailorKit AI builds a focused feature for their workspace."
            eyebrow="For users"
            example="“Create a renewal checklist for my accounts.”"
            icon={Sparkles}
            number="01"
            outcome="A custom workflow, in the right screen"
            title="Ask AI for a feature"
          />
          <BuildPath
            detail="A partner or your own team builds against the same product surface, then ships an app other users can install."
            eyebrow="For partners and product teams"
            example="“Connect our ERP and show renewal status.”"
            icon={MessageSquareText}
            number="02"
            outcome="A reusable integration, distributed to many users"
            title="Ship an app to the ecosystem"
          />
        </div>
      </div>
    </section>
  );
}

function BuildPath({
  detail,
  eyebrow,
  example,
  icon: Icon,
  number,
  outcome,
  title,
}: {
  detail: string;
  eyebrow: string;
  example: string;
  icon: typeof Sparkles;
  number: string;
  outcome: string;
  title: string;
}) {
  return (
    <article className="grid bg-background not-last:border-b not-last:border-border sm:grid-cols-[5rem_minmax(0,1fr)_12rem]">
      <div className="flex min-h-20 items-start justify-between border-b border-border p-5 sm:min-h-full sm:flex-col sm:border-b-0 sm:border-r sm:p-6">
        <span className="font-mono text-[10px] tracking-[0.18em] text-foreground/40">{number}</span>
        <span className="flex size-8 items-center justify-center border border-border bg-sidebar text-primary">
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
      </div>
      <div className="border-b border-border p-5 sm:border-b-0 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/40">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/56">{detail}</p>
        <p className="mt-5 border-l-2 border-primary bg-sidebar/55 px-3 py-2 text-sm text-foreground/72">
          {example}
        </p>
      </div>
      <div className="border-primary/20 bg-primary/[0.045] p-5 sm:border-l sm:p-6">
        <p className="font-mono text-[9px] uppercase tracking-wider text-primary">Outcome</p>
        <p className="mt-2 text-xs leading-5 text-foreground/64">{outcome}</p>
      </div>
    </article>
  );
}

function NativeAndSafe() {
  return (
    <section className="border-b border-border px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <SectionIntro
        eyebrow="[ Native by default ]"
        title="Native extensions begin with a contract."
      >
        You decide what an extension can see, which components it may compose, and what it may ask
        your backend to do. That is why apps fit the product instead of sitting beside it.
      </SectionIntro>
      <div className="mt-12 grid overflow-hidden border border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
        {hostControls.map(({ description, icon: Icon, title }) => (
          <div
            className="border-b border-border bg-background p-6 last:border-b-0 sm:border-b-0"
            key={title}
          >
            <span className="flex size-10 items-center justify-center border border-border bg-sidebar text-primary">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-foreground/54">{description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 border border-border bg-sidebar/45 px-5 py-4 text-sm leading-6 text-foreground/62 sm:flex-row sm:items-center">
        <Palette aria-hidden="true" className="size-4 shrink-0 text-primary" />
        Your host renders the final interface using your design system, so every extension feels
        familiar from the first click.
      </div>
    </section>
  );
}

function Runtime() {
  return (
    <section className="border-b border-foreground bg-foreground px-6 py-20 text-background sm:px-10 lg:px-14 lg:py-28 xl:px-20">
      <SectionIntro
        inverse
        eyebrow="[ Secure runtime ]"
        title="Run unknown code without handing over your app."
      >
        TailorKit treats app code as untrusted by default. It does not run on your main thread or
        manipulate your DOM directly; it works through the contract you publish.
      </SectionIntro>
      <div className="mt-12 grid overflow-hidden border border-background/30 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-background/20">
        {runtimeSteps.map(({ description, icon: Icon, number, title }) => (
          <div
            className="border-b border-background/20 p-6 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0"
            key={number}
          >
            <span className="font-mono text-[10px] tracking-widest text-background/40">
              {number}
            </span>
            <Icon aria-hidden="true" className="mt-9 size-5 text-primary" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-background/60">{description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 border border-primary/35 bg-primary/15 px-5 py-4 text-sm leading-6 text-background/70 sm:flex-row sm:items-center">
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
    <section className="px-6 py-24 sm:px-10 lg:px-14 lg:py-32 xl:px-20">
      <div className="grid gap-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <Eyebrow>[ Start with one screen ]</Eyebrow>
        <div className="max-w-4xl">
          <h2 className="text-balance font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
            Make one part of your product extensible.
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-foreground/58 sm:text-lg">
            Publish a small, explicit contract for the right route, components, and actions. We can
            help you choose a useful first extension surface.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              render={<a href="/docs/installation">Read the installation guide</a>}
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
      </div>
    </section>
  );
}

function SectionIntro({
  children,
  eyebrow,
  inverse = false,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  inverse?: boolean;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p
        className={`mt-6 max-w-2xl text-pretty text-base leading-7 sm:text-lg ${
          inverse ? "text-background/65" : "text-foreground/58"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
        inverse ? "text-background/55" : "text-primary"
      }`}
    >
      {children}
    </p>
  );
}
