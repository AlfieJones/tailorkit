import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { Logo } from "@tailorkit/ui/logo";

import { NavbarAuth } from "#components/navbar-auth";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    nav: {
      transparentMode: "top",
      // JSX supported
      title: (
        <span className="flex items-center space-x-2">
          <Logo className="size-[1em]" />
          <span>TailorKit</span>
        </span>
      ),
      url: "/home",
    },
    themeSwitch: { enabled: false },
    searchToggle: { enabled: false },
    links: [
      {
        text: "Docs",
        url: "/docs",
        type: "main",
      },
      {
        type: "custom",
        children: <NavbarAuth />,
        secondary: true,
      },
    ],
  };
}
