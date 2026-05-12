import type { TailorKitTheme } from "tailorkit";

export type DemoAppId = "messages" | "todo";

export const shadcnTokenNames = [
  "radius",
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "info",
  "info-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "border",
  "input",
  "ring",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export type ShadcnThemeTokens = Record<(typeof shadcnTokenNames)[number], string>;

export interface DemoEmbedConfig {
  customerLabel: string;
  defaultOpen: boolean;
  pushPage: boolean;
  railBorder: boolean;
  width: number;
}

export interface DemoHandoff {
  embedConfig: DemoEmbedConfig;
  selectedApp: DemoAppId;
  tailorkitTheme: TailorKitTheme;
}

const defaultShadcnTokens = {
  radius: "0.625rem",
  background: "#0b0b0d",
  foreground: "#f4f4f5",
  card: "#0f1012",
  "card-foreground": "#f4f4f5",
  popover: "#0b0b0d",
  "popover-foreground": "#f4f4f5",
  primary: "#ffffff",
  "primary-foreground": "#050506",
  secondary: "#161618",
  "secondary-foreground": "#f4f4f5",
  muted: "#111113",
  "muted-foreground": "#8b8b93",
  accent: "#161618",
  "accent-foreground": "#f4f4f5",
  destructive: "#ef4444",
  "destructive-foreground": "#ffffff",
  info: "#3b82f6",
  "info-foreground": "#ffffff",
  success: "#22c55e",
  "success-foreground": "#050506",
  warning: "#f59e0b",
  "warning-foreground": "#050506",
  border: "#242428",
  input: "#161618",
  ring: "#ffffff",
  sidebar: "#050506",
  "sidebar-foreground": "#f4f4f5",
  "sidebar-primary": "#ffffff",
  "sidebar-primary-foreground": "#050506",
  "sidebar-accent": "#111113",
  "sidebar-accent-foreground": "#f4f4f5",
  "sidebar-border": "#242428",
  "sidebar-ring": "#ffffff",
} satisfies ShadcnThemeTokens;

export const defaultTheme: TailorKitTheme = {
  tokens: {
    shadcn: defaultShadcnTokens,
  } as TailorKitTheme["tokens"] & { shadcn: ShadcnThemeTokens },
};

export const defaultEmbedConfig: DemoEmbedConfig = {
  customerLabel: "KYBER",
  defaultOpen: true,
  pushPage: true,
  railBorder: true,
  width: 360,
};

export const createHandoff = (
  tailorkitTheme: TailorKitTheme,
  embedConfig: DemoEmbedConfig,
  selectedApp: DemoAppId = "todo",
): DemoHandoff => ({
  embedConfig,
  selectedApp,
  tailorkitTheme,
});

export const mergeTheme = (
  base: TailorKitTheme,
  patch: Partial<TailorKitTheme>,
): TailorKitTheme => ({
  ...base,
  ...patch,
  tokens: {
    shadcn: {
      ...getShadcnTokens(base),
      ...getShadcnTokens(patch),
    },
  } as TailorKitTheme["tokens"] & { shadcn: ShadcnThemeTokens },
});

export const getShadcnTokens = (theme: Partial<TailorKitTheme> | undefined): ShadcnThemeTokens => {
  const tokenGroups = theme?.tokens as { shadcn?: Partial<ShadcnThemeTokens> } | undefined;
  return { ...defaultShadcnTokens, ...tokenGroups?.shadcn };
};

export const toCssVars = (theme: TailorKitTheme): Record<string, string> => {
  const tokens = getShadcnTokens(theme);
  return Object.fromEntries(shadcnTokenNames.map((name) => [`--${name}`, tokens[name]]));
};

export const withPrimitiveThemeTokens = (theme: TailorKitTheme): TailorKitTheme => {
  const tokens = getShadcnTokens(theme);
  return {
    ...theme,
    tokens: {
      ...theme.tokens,
      background: {
        accent: "var(--primary)",
        default: "var(--background)",
        muted: "var(--muted)",
      },
      borderColor: {
        default: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      radius: {
        none: "0rem",
        xs: `calc(${tokens.radius} - 4px)`,
        sm: `calc(${tokens.radius} - 2px)`,
        md: tokens.radius,
        lg: tokens.radius,
        xl: `calc(${tokens.radius} + 4px)`,
      },
      space: {
        none: "0rem",
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      textColor: {
        default: "var(--foreground)",
        inverse: "var(--primary-foreground)",
        muted: "var(--muted-foreground)",
      },
    },
  };
};

export const encodeState = (handoff: DemoHandoff): string =>
  globalThis.btoa(encodeURIComponent(JSON.stringify(handoff)));

export const decodeState = (value: string | null): DemoHandoff | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(globalThis.atob(value))) as DemoHandoff;
  } catch {
    return null;
  }
};
