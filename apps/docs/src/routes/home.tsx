import { ImageDithering } from "@paper-design/shaders-react";
import { Button } from "@tailorkit/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "@tailorkit/ui/popover";
import { Slider } from "@tailorkit/ui/slider";
import { Switch } from "@tailorkit/ui/switch";
import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Footer } from "#components/footer";
import { HomeCTA } from "#components/home-cta";
import { LineShadowText } from "#components/line-shadow";
import { PlatformFeatures } from "#components/platform-features";
import { baseOptions } from "#lib/layout.shared";

const chameleonHues = [165, 26, 217, 252, 295];
const transparentColor = "rgba(0, 0, 0, 0)";
const darkInkColor = "#c8bdf7";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: homeHead,
});

export function homeHead() {
  return {
    links: [{ href: "https://tailorkit.dev/", rel: "canonical" }],
  };
}

export function HomePage() {
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
    <HomeLayout {...baseOptions()}>
      <main className="min-h-screen bg-sidebar">
        <div className="mx-auto w-full max-w-7xl border-x border-border bg-background text-foreground">
          <section className="relative flex h-[calc(100svh-4rem)] min-h-[900px] w-full max-h-[980px] overflow-hidden sm:min-h-[860px] md:h-[calc(100svh-6.5rem)]">
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
                    TailorKit gives your SaaS an{" "}
                    <span className="text-foreground">app ecosystem</span>, with{" "}
                    <span className="text-foreground">hosting</span>,{" "}
                    <span className="text-foreground">sandboxing</span>, and{" "}
                    <span className="text-foreground">agentic builders</span> so customers and
                    partners can easily extend your product using your{" "}
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

              <HeroFooter />
            </div>

            <ChameleonDither
              autoHue={autoHue}
              hue={currentHue}
              showCowboyHat={showCowboyHat}
              showMonocle={showMonocle}
            />
          </section>
          <PlatformFeatures />
          <SectionSeparator />
          <HomeCTA />
          <SectionSeparator />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}

function ChameleonDither({
  autoHue,
  hue,
  showCowboyHat,
  showMonocle,
}: {
  autoHue: boolean;
  hue: number;
  showCowboyHat: boolean;
  showMonocle: boolean;
}) {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const isDarkTheme = isDark === true;
  const backgroundColor = transparentColor;
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
              width={1254}
              height={1254}
              image="/docs/chameleon-branch.webp"
              colorBack={backgroundColor}
              colorFront={isDarkTheme ? darkInkColor : "#111111"}
              colorHighlight="#a191f1"
              originalColors={false}
              inverted={false}
              type="2x2"
              size={1.25}
              colorSteps={1}
              fit="contain"
              style={{
                backgroundColor: "transparent",
                height: "100%",
                width: "100%",
              }}
            />
            <ImageDithering
              className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen"
              width={1254}
              height={1254}
              image="/docs/chameleon-no-branch.webp"
              colorBack={backgroundColor}
              colorFront={colorFront}
              colorHighlight="#a191f1"
              originalColors={false}
              inverted={false}
              type="2x2"
              size={1.5}
              colorSteps={1}
              fit="contain"
              style={{
                backgroundColor: "transparent",
                height: "100%",
                width: "100%",
              }}
            />
            {showCowboyHat ? (
              <ImageDithering
                className="absolute inset-0 opacity-100 mix-blend-multiply dark:mix-blend-screen"
                width={1254}
                height={1254}
                image="/docs/chameleon-cowboy-hat.webp"
                colorBack={backgroundColor}
                colorFront={isDarkTheme ? "#d2a56f" : "#8a5524"}
                colorHighlight={isDarkTheme ? "#f0d0a3" : "#c47b32"}
                originalColors={false}
                inverted={true}
                type="8x8"
                size={1}
                colorSteps={1}
                fit="contain"
                style={{
                  backgroundColor: "transparent",
                  height: "100%",
                  width: "100%",
                }}
              />
            ) : null}
            {showMonocle ? (
              <ImageDithering
                className="absolute inset-0 opacity-80 mix-blend-multiply dark:mix-blend-screen"
                width={1254}
                height={1254}
                image="/docs/chameleon-monocle.webp"
                colorBack={backgroundColor}
                colorFront={isDarkTheme ? "#d8d8d8" : "#111111"}
                colorHighlight={isDarkTheme ? "#f2f2f2" : "#111111"}
                originalColors={false}
                inverted={true}
                type="2x2"
                size={1.5}
                colorSteps={1}
                fit="contain"
                style={{
                  backgroundColor: "transparent",
                  height: "100%",
                  width: "100%",
                }}
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
            <label className="flex items-center justify-between gap-4 text-sm text-foreground/70">
              <span>Monocle</span>
              <Switch checked={showMonocle} onCheckedChange={onMonocleChange} />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm text-foreground/70">
              <span>Cowboy hat</span>
              <Switch checked={showCowboyHat} onCheckedChange={onCowboyHatChange} />
            </label>
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
              <label className="flex items-center gap-2 text-sm text-foreground/70">
                <Switch checked={autoHue} onCheckedChange={onAutoHueChange} />
                Auto
              </label>
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
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x];

  return `#${[r, g, b]
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
