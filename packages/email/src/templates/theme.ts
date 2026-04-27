import type { TailwindConfig } from "@react-email/components";

const neutral = {
  100: "#f5f5f5",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  50: "#fafafa",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  950: "#0a0a0a",
} as const;

export const emailTheme = {
  color: {
    background: "#ffffff",
    border: "rgba(0, 0, 0, 0.08)",
    card: "#ffffff",
    codeBackground: "rgba(0, 0, 0, 0.04)",
    foreground: neutral[800],
    mutedForeground: neutral[500],
    subtleForeground: neutral[600],
  },
  darkColor: {
    background: "#0c0c0d",
    border: "rgba(255, 255, 255, 0.08)",
    card: "#121214",
    codeBackground: "rgba(255, 255, 255, 0.04)",
    foreground: neutral[100],
    mutedForeground: neutral[400],
    subtleForeground: neutral[300],
  },
  fontFamily: {
    mono: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
    sans: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  radius: {
    card: "8px",
  },
} as const;

export const emailTailwindConfig = {
  theme: {
    extend: {
      borderColor: {
        tk: emailTheme.color.border,
      },
      borderRadius: {
        tk: emailTheme.radius.card,
      },
      colors: {
        "tk-background": emailTheme.color.background,
        "tk-card": emailTheme.color.card,
        "tk-code": emailTheme.color.codeBackground,
        "tk-foreground": emailTheme.color.foreground,
        "tk-muted": emailTheme.color.mutedForeground,
        "tk-subtle": emailTheme.color.subtleForeground,
      },
      fontFamily: {
        mono: [emailTheme.fontFamily.mono],
        sans: [emailTheme.fontFamily.sans],
      },
    },
  },
} satisfies TailwindConfig;

export const emailColorSchemeCss = `
  :root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
  }

  @media (prefers-color-scheme: dark) {
    .tk-body {
      background-color: ${emailTheme.darkColor.background} !important;
      color: ${emailTheme.darkColor.foreground} !important;
    }

    .tk-card {
      background-color: ${emailTheme.darkColor.card} !important;
      border-color: ${emailTheme.darkColor.border} !important;
    }

    .tk-muted {
      color: ${emailTheme.darkColor.mutedForeground} !important;
    }

    .tk-subtle {
      color: ${emailTheme.darkColor.subtleForeground} !important;
    }

    .tk-code {
      background-color: ${emailTheme.darkColor.codeBackground} !important;
      border-color: ${emailTheme.darkColor.border} !important;
      color: ${emailTheme.darkColor.foreground} !important;
    }
  }
`;
