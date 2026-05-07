export interface TailorKitTheme {
  breakpoints?: Record<string, string | null>;
  tokens?: {
    background?: Record<string, string>;
    border?: Record<string, string>;
    borderColor?: Record<string, string>;
    overflow?: Record<string, string>;
    overflowWrap?: Record<string, string>;
    radius?: Record<string, string>;
    size?: Record<string, string>;
    space?: Record<string, string>;
    textAlign?: Record<string, string>;
    textOverflow?: Record<string, string>;
    textTransform?: Record<string, string>;
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

export const defaultBorder = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
  double: "double",
} as const;

export const defaultOverflow = {
  visible: "visible",
  hidden: "hidden",
  clip: "clip",
  scroll: "scroll",
  auto: "auto",
} as const;

export const defaultOverflowWrap = {
  normal: "normal",
  breakWord: "break-word",
  anywhere: "anywhere",
} as const;

export const defaultSize = {
  "0": "0px",
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "2/4": "50%",
  "3/4": "75%",
  "1/5": "20%",
  "2/5": "40%",
  "3/5": "60%",
  "4/5": "80%",
  "1/6": "16.666667%",
  "2/6": "33.333333%",
  "3/6": "50%",
  "4/6": "66.666667%",
  "5/6": "83.333333%",
  "1/12": "8.333333%",
  "2/12": "16.666667%",
  "3/12": "25%",
  "4/12": "33.333333%",
  "5/12": "41.666667%",
  "6/12": "50%",
  "7/12": "58.333333%",
  "8/12": "66.666667%",
  "9/12": "75%",
  "10/12": "83.333333%",
  "11/12": "91.666667%",
  full: "100%",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
} as const;

export const defaultTextAlign = {
  left: "left",
  right: "right",
  start: "start",
  end: "end",
  center: "center",
  justify: "justify",
} as const;

export const defaultTextOverflow = {
  clip: "clip",
  ellipsis: "ellipsis",
} as const;

export const defaultTextTransform = {
  capitalize: "capitalize",
  uppercase: "uppercase",
  lowercase: "lowercase",
  none: "none",
} as const;

export const resolveTheme = (theme: TailorKitTheme | undefined): TailorKitTheme => ({
  breakpoints: theme?.breakpoints ?? defaultBreakpoints,
  tokens: {
    ...theme?.tokens,
    border: theme?.tokens?.border ?? defaultBorder,
    overflow: theme?.tokens?.overflow ?? defaultOverflow,
    overflowWrap: theme?.tokens?.overflowWrap ?? defaultOverflowWrap,
    radius: theme?.tokens?.radius ?? defaultRadius,
    size: theme?.tokens?.size ?? defaultSize,
    space: theme?.tokens?.space ?? defaultSpace,
    textAlign: theme?.tokens?.textAlign ?? defaultTextAlign,
    textOverflow: theme?.tokens?.textOverflow ?? defaultTextOverflow,
    textTransform: theme?.tokens?.textTransform ?? defaultTextTransform,
  },
});
