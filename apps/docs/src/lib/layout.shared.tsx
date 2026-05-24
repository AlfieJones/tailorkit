import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { Logo } from "@tailorkit/ui/logo";

import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    nav: {
      // JSX supported
      title: (
        <span className="flex items-center space-x-2">
          <Logo className="size-[1em]" />
          <span>TailorKit</span>
        </span>
      ),
      url: "/home",
    },
    links: [
      {
        text: "Docs",
        url: "/docs",
        type: "main",
      },
    ],
  };
}
