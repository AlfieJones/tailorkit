type BreakpointValue<T> = T | Record<string, T | undefined>;
type SpaceToken = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type RadiusToken = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type BackgroundToken = string;
type BorderToken = "solid" | "dashed" | "dotted" | "double";
type BorderColorToken = string;
type SizeToken =
  | "0"
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "2/4"
  | "3/4"
  | "1/5"
  | "2/5"
  | "3/5"
  | "4/5"
  | "1/6"
  | "2/6"
  | "3/6"
  | "4/6"
  | "5/6"
  | "1/12"
  | "2/12"
  | "3/12"
  | "4/12"
  | "5/12"
  | "6/12"
  | "7/12"
  | "8/12"
  | "9/12"
  | "10/12"
  | "11/12"
  | "full"
  | "min"
  | "max"
  | "fit";
type OverflowToken = "visible" | "hidden" | "clip" | "scroll" | "auto";
type OverflowWrapToken = "normal" | "breakWord" | "anywhere";
type TextAlignToken = "left" | "right" | "start" | "end" | "center" | "justify";
type TextColorToken = string;
type TextOverflowToken = "clip" | "ellipsis";
type TextTransformToken = "capitalize" | "uppercase" | "lowercase" | "none";

export interface BoxProps {
  /**
   * Background token from `theme.tokens.background`.
   *
   * The allowed values are generated from the host schema's background tokens.
   *
   * @remarks `background token | responsive`
   */
  background?: BreakpointValue<BackgroundToken>;
  /**
   * Border style token. Defaults include `solid`, `dashed`, `dotted`, and `double`.
   *
   * @remarks `border token | responsive`
   */
  border?: BreakpointValue<BorderToken>;
  /**
   * Border color token from `theme.tokens.borderColor`.
   *
   * The allowed values are generated from the host schema's border color tokens.
   *
   * @remarks `borderColor token | responsive`
   */
  borderColor?: BreakpointValue<BorderColorToken>;
  /**
   * Height token from `theme.tokens.size`.
   *
   * @remarks `size token | responsive`
   */
  height?: BreakpointValue<SizeToken>;
  /**
   * Margin token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  margin?: BreakpointValue<SpaceToken>;
  /**
   * Overflow behavior token.
   *
   * @remarks `overflow token | responsive`
   */
  overflow?: BreakpointValue<OverflowToken>;
  /**
   * Text wrapping token.
   *
   * @remarks `overflowWrap token | responsive`
   */
  overflowWrap?: BreakpointValue<OverflowWrapToken>;
  /**
   * Padding token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  padding?: BreakpointValue<SpaceToken>;
  /**
   * Corner radius token from `theme.tokens.radius`.
   *
   * @remarks `radius token | responsive`
   */
  radius?: BreakpointValue<RadiusToken>;
  /**
   * Text alignment token.
   *
   * @remarks `textAlign token | responsive`
   */
  textAlign?: BreakpointValue<TextAlignToken>;
  /**
   * Text color token from `theme.tokens.textColor`.
   *
   * The allowed values are generated from the host schema's text color tokens.
   *
   * @remarks `textColor token | responsive`
   */
  textColor?: BreakpointValue<TextColorToken>;
  /**
   * Text overflow token.
   *
   * @remarks `textOverflow token | responsive`
   */
  textOverflow?: BreakpointValue<TextOverflowToken>;
  /**
   * Text transform token.
   *
   * @remarks `textTransform token | responsive`
   */
  textTransform?: BreakpointValue<TextTransformToken>;
  /**
   * Width token from `theme.tokens.size`.
   *
   * @remarks `size token | responsive`
   */
  width?: BreakpointValue<SizeToken>;
}

export interface FlexProps extends BoxProps {
  /**
   * Cross-axis alignment.
   *
   * @remarks `alignment | responsive`
   */
  align?: BreakpointValue<"start" | "center" | "end" | "stretch">;
  /**
   * Flex direction.
   *
   * @remarks `direction | responsive`
   */
  direction?: BreakpointValue<"row" | "column">;
  /**
   * Gap token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  gap?: BreakpointValue<SpaceToken>;
  /**
   * Main-axis distribution.
   *
   * @remarks `justification | responsive`
   */
  justify?: BreakpointValue<"start" | "center" | "end" | "between">;
}

export interface GridProps extends BoxProps {
  /**
   * Number of grid columns.
   *
   * @remarks `columns | responsive`
   */
  columns?: BreakpointValue<1 | 2 | 3 | 4 | 6 | 12>;
  /**
   * Gap token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  gap?: BreakpointValue<SpaceToken>;
}

export interface InlineProps {
  /**
   * Background token from `theme.tokens.background`.
   *
   * The allowed values are generated from the host schema's background tokens.
   *
   * @remarks `background token | responsive`
   */
  background?: BreakpointValue<BackgroundToken>;
  /**
   * Border color token from `theme.tokens.borderColor`.
   *
   * The allowed values are generated from the host schema's border color tokens.
   *
   * @remarks `borderColor token | responsive`
   */
  borderColor?: BreakpointValue<BorderColorToken>;
  /**
   * Margin token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  margin?: BreakpointValue<SpaceToken>;
  /**
   * Text wrapping token.
   *
   * @remarks `overflowWrap token | responsive`
   */
  overflowWrap?: BreakpointValue<OverflowWrapToken>;
  /**
   * Padding token from `theme.tokens.space`.
   *
   * @remarks `space token | responsive`
   */
  padding?: BreakpointValue<SpaceToken>;
  /**
   * Corner radius token from `theme.tokens.radius`.
   *
   * @remarks `radius token | responsive`
   */
  radius?: BreakpointValue<RadiusToken>;
  /**
   * Text alignment token.
   *
   * @remarks `textAlign token | responsive`
   */
  textAlign?: BreakpointValue<TextAlignToken>;
  /**
   * Text color token from `theme.tokens.textColor`.
   *
   * The allowed values are generated from the host schema's text color tokens.
   *
   * @remarks `textColor token | responsive`
   */
  textColor?: BreakpointValue<TextColorToken>;
  /**
   * Text overflow token.
   *
   * @remarks `textOverflow token | responsive`
   */
  textOverflow?: BreakpointValue<TextOverflowToken>;
  /**
   * Text transform token.
   *
   * @remarks `textTransform token | responsive`
   */
  textTransform?: BreakpointValue<TextTransformToken>;
}
