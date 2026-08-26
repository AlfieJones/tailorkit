import { Bot, Braces, Cloud, Component, GitFork, LockKeyhole, Plug, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProductFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const productFeatures: ProductFeature[] = [
  {
    title: "Extend your app",
    description:
      "Let customers add the features and workflows they need to the product they already use.",
    icon: Sparkles,
  },
  {
    title: "Partner integrations",
    description:
      "Give third parties a supported way to build and publish integrations for your platform.",
    icon: Plug,
  },
  {
    title: "Build features with AI",
    description:
      "Turn a plain-language idea into a working extension built from your product primitives.",
    icon: Bot,
  },
  {
    title: "Native product UI",
    description:
      "Render extensions with your components so every new feature looks and feels built in.",
    icon: Component,
  },
  {
    title: "Open source",
    description:
      "Adopt, inspect, and extend an AGPL-licensed framework without betting on a black box.",
    icon: GitFork,
  },
  {
    title: "Sandboxed runtime",
    description:
      "Run third-party and AI-generated code safely, away from your core application runtime.",
    icon: LockKeyhole,
  },
  {
    title: "Framework agnostic",
    description:
      "Use a framework-neutral extension protocol, with an official React adapter available today.",
    icon: Braces,
  },
  {
    title: "Managed infrastructure",
    description:
      "Deploy extensions through our CDN today, with per-app backend services on the roadmap.",
    icon: Cloud,
  },
];
