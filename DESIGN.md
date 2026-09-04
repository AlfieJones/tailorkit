---
version: alpha
name: Citrus
description: A bright lime-chartreuse shadcn/ui theme — electric green primary, teal secondary, and fresh energetic punch by StyleGlide.
colors:
  background: "#fafafa"
  foreground: "#262626"
  card: "#ffffff"
  primary: "#b8e954"
  primary-foreground: "#000000"
  secondary: "#45807a"
  secondary-foreground: "#ffffff"
  muted: "#f5f5f5"
  muted-foreground: "#525252"
  accent: "#f5f5f5"
  accent-foreground: "#262626"
  destructive: "#141414"
  border: "#e5e5e5"
  input: "#d4d4d4"
  ring: "#b8e954"
  sidebar: "#ffffff"
  sidebar-foreground: "#262626"
  sidebar-primary: "#b8e954"
  sidebar-accent: "#fafafa"
  chart-1: "#b8e954"
  chart-2: "#45807a"
  chart-3: "#a2e400"
  chart-4: "#6ab99b"
  chart-5: "#b8e954"
  dark-background: "#0a0a0a"
  dark-foreground: "#e5e5e5"
  dark-card: "#171717"
  dark-primary: "#b8e954"
  dark-secondary: "#45807a"
  dark-muted: "#262626"
  dark-muted-foreground: "#d4d4d4"
  dark-accent: "#262626"
  dark-border: "#262626"
  dark-sidebar: "#171717"
typography:
  display:
    fontFamily: Host Grotesk
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Host Grotesk
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Host Grotesk
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: Onest
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Onest
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  serif:
    fontFamily: Lora
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: ui-monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  section: 64px
  gutter: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 24px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
---

# Citrus

A premade shadcn/ui theme by StyleGlide. Install tokens with `npx shadcn@latest add @shadcnblocks/theme/citrus`, then keep this DESIGN.md in the project root (or `.agents/`) so coding agents stay on-brand.

## Overview

Citrus bursts with the energy of a fresh lime squeeze: near-white canvas, dark crisp text, and an electric lime-chartreuse primary (`#b8e954`) that demands attention. Paired with a deep teal secondary (`#45807a`), the palette evokes tropical freshness and natural vitality. This is not a subtle pastel green — it's a high-energy, high-visibility accent that makes CTAs impossible to miss.

The system is **energetic, fresh, and bold**. It suits fitness apps, health and wellness platforms, eco-friendly products, creative agencies, and any brand that wants to signal vitality and forward momentum. The achromatic structural chrome keeps the interface readable while the lime provides electric punctuation.

Emotional targets: alive, fresh, confident — never corporate muted, never pastel delicate, never heavy industrial.

## Colors

The palette pairs an **electric lime primary** with a **deep teal secondary** on an **achromatic neutral stage**.

- **Primary (`#b8e954`):** Lime chartreuse — primary buttons, active states, and brand highlights. Dark (black) text on lime for readability. Persists in both light and dark modes.
- **Secondary (`#45807a`):** Deep teal — secondary CTAs, supporting brand moments, chart counterpoints. White text on teal for contrast.
- **Muted (`#f5f5f5`):** Light gray for quiet chrome — table headers, skeletons, background wells.
- **Foreground (`#262626`):** Near-black — body text. Dark and grounded against the light canvas.
- **Background (`#fafafa`):** Near-white canvas — clean, neutral stage.
- **Card (`#ffffff`):** Pure white for elevated content panels.
- **Border (`#e5e5e5`):** Neutral gray separators — subtle, no color tint.
- **Ring (`#b8e954`):** Lime focus ring — matches primary for a vivid active state.
- **Destructive (`#141414`):** Near-black in light mode (unconventional — danger is signaled by contrast and context rather than red). Dark mode uses standard red (`#f14444`).

Dark mode drops to true black canvas (`#0a0a0a`) where the lime glows even brighter. The electric contrast of chartreuse on black is the dark-mode signature.

## Typography

**Host Grotesk** is the display face for headlines and marketing. **Onest** is the body and UI workhorse. **Lora** is an optional serif. System **monospace** covers code.

- **Display / headlines:** Host Grotesk Bold, tight tracking. Technical but slightly playful — pairs well with the energetic palette.
- **Body:** Onest Regular at 16px with 1.6 line-height. Friendly and clean geometric sans.
- **Labels / UI chrome:** Onest Medium. Sentence case throughout.
- **Serif:** Lora for optional editorial moments — never in app chrome.
- **Mono:** System monospace for code blocks and technical fragments.

Avoid overly serious condensed fonts or decorative script faces. The typography should feel modern and approachable — matching the lime's energy without competing with it.

## Layout

Use a **clean energetic rhythm**: 8px base, confident whitespace, and clear visual hierarchy.

- Prefer a max-width content column (~1200px) with `2rem` horizontal gutters.
- Cards on white against the near-white canvas — subtle elevation via borders and shadows.
- Marketing pages: bold headline, lime CTA that draws the eye instantly, teal for secondary actions.
- App shells: white sidebar, white/off-white content pane. Lime appears sparingly for active states.
- Density: medium. The bold accent works best with breathing room — don't crowd lime elements together.

## Elevation & Depth

Depth is **standard and restrained** — shadows follow typical patterns at moderate opacity.

- Cards use light borders plus subtle shadows for clean elevation.
- Prefer flat design for most structural chrome; reserve shadows for interactive overlays.
- Avoid lime-colored or teal-colored shadows — keep elevation neutral.
- Dark mode: the lime primary provides its own "glow" effect against black — don't add extra colored ambient effects.

## Shapes

Corner radius is **moderate** — base `--radius` is `0.5rem` (8px).

- Buttons, inputs, and controls: ~8px (`rounded-lg`).
- Cards and large panels: ~12px (`rounded-xl`).
- Chips and small elements: 4–6px or pill-shaped where appropriate.
- The moderate radius keeps the interface clean without being either too sharp or too soft.

## Components

Built for the shadcn/ui token contract. Prefer semantic tokens (`bg-primary`, `text-muted-foreground`) over raw hex in component code.

- **Primary button:** Lime fill, black text. Electric and unmissable — one per view.
- **Secondary button:** Teal fill, white text. Cooler complement for alternate actions.
- **Outline / ghost:** Dark text on transparent; neutral gray border.
- **Cards:** White surface, gray border, moderate radius. Clean container.
- **Inputs:** Near-white or white fields, darker gray borders, lime focus ring.
- **Sidebar:** White shell, dark text. Active items get a lime accent or subtle lime-tinted background.
- **Charts:** Series order lime → teal → bright green → soft teal → lime. Nature-inspired palette.
- **Badges:** Lime fills for highlights, teal for secondary status, muted gray for neutral.

## Do's and Don'ts

**Do**

- Do let lime be the star — it's eye-catching enough to need no supporting warm accents.
- Do pair lime with deep teal for a natural, complementary secondary voice.
- Do keep all structural chrome achromatic (white, gray, near-black) — lime pops by contrast.
- Do use Host Grotesk for display and Onest for body — the type pairing matches the energy.
- Do embrace the lime-on-black dark mode — it's the theme's most dramatic expression.

**Don't**

- Don't use lime as a large-area fill (page backgrounds, sidebars) — it works as punctuation, not wallpaper.
- Don't add competing bright accents (orange, pink, yellow) — one electric color is enough.
- Don't warm the neutral grays to cream or sand — Citrus is cool-neutral with a green spark.
- Don't reduce the lime saturation to olive or sage — that strips the energy.
- Don't use lime for body text or small labels — it fails contrast on light backgrounds.
- Don't pair lime with too many other greens (forest, emerald, mint) — the teal secondary is sufficient.
