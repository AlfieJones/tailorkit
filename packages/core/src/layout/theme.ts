export interface LayoutTheme {
  breakpoints?: Record<string, string>;
  space?: Record<string, string>;
  radius?: Record<string, string>;
  border?: Record<string, string>;
  colors?: {
    background?: Record<string, string>;
    border?: Record<string, string>;
  };
}

export function createTheme(config: LayoutTheme): LayoutTheme {
  return config;
}
