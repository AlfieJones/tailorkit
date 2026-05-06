export interface TailorKitTheme {
  breakpoints?: Record<string, string | null>;
  tokens?: {
    background?: Record<string, string>;
    border?: Record<string, string>;
    borderColor?: Record<string, string>;
    radius?: Record<string, string>;
    space?: Record<string, string>;
  };
}

export const defaultBreakpoints = {
  base: null,
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const defaultSpace = {
  none: "0rem",
  "2xs": "0.125rem",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4.5rem",
} as const;

export const defaultRadius = {
  none: "0rem",
  "2xs": "0.125rem",
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
} as const;

export const resolveTheme = (theme: TailorKitTheme | undefined): TailorKitTheme => ({
  breakpoints: theme?.breakpoints ?? defaultBreakpoints,
  tokens: {
    ...theme?.tokens,
    radius: theme?.tokens?.radius ?? defaultRadius,
    space: theme?.tokens?.space ?? defaultSpace,
  },
});
