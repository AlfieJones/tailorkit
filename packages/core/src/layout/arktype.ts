import { type } from "arktype";
import type { LayoutTheme } from "./theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Shape = Record<string, any>;

const DEFAULT_BREAKPOINTS = ["base", "sm", "md", "lg", "xl"];

const sizingShape: Shape = {
  "w?": "string | number",
  "h?": "string | number",
  "minW?": "string | number",
  "maxW?": "string | number",
  "minH?": "string | number",
  "maxH?": "string | number",
};

const flexDirectionExpr = "'row' | 'column' | 'row-reverse' | 'column-reverse'";
const alignExpr = "'start' | 'center' | 'end' | 'stretch' | 'baseline'";
const justifyExpr = "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'";
const wrapExpr = "'wrap' | 'nowrap' | 'wrap-reverse'";
const autoFlowExpr = "'row' | 'column' | 'row-dense' | 'column-dense'";

function responsive(expr: string, bps: string[]) {
  const bpShape: Shape = {};
  for (const key of bps) {
    bpShape[`${key}?`] = expr as never;
  }
  return type(expr as never).or(bpShape);
}

function tokenExpr(record: Record<string, string> | undefined): string | null {
  if (!record) {
    return null;
  }
  const keys = Object.keys(record);
  if (keys.length === 0) {
    return null;
  }
  return keys.map((k) => `'${k}'`).join(" | ");
}

function addSpacing(shape: Shape, space: Record<string, string> | undefined, bps: string[]) {
  const expr = tokenExpr(space);
  if (!expr) {
    return;
  }
  for (const key of [
    "p",
    "px",
    "py",
    "pt",
    "pr",
    "pb",
    "pl",
    "m",
    "mx",
    "my",
    "mt",
    "mr",
    "mb",
    "ml",
  ]) {
    shape[`${key}?`] = responsive(expr, bps);
  }
}

function addGap(shape: Shape, space: Record<string, string> | undefined, bps: string[]) {
  const expr = tokenExpr(space);
  if (!expr) {
    return;
  }
  for (const key of ["gap", "rowGap", "columnGap"]) {
    shape[`${key}?`] = responsive(expr, bps);
  }
}

function addSurface(shape: Shape, theme: LayoutTheme, bps: string[]) {
  const bg = tokenExpr(theme.colors?.background);
  if (bg) {
    shape["bg?"] = responsive(bg, bps);
  }

  const border = tokenExpr(theme.border);
  if (border) {
    shape["border?"] = responsive(border, bps);
  }

  const borderColor = tokenExpr(theme.colors?.border);
  if (borderColor) {
    shape["borderColor?"] = responsive(borderColor, bps);
  }

  const radius = tokenExpr(theme.radius);
  if (radius) {
    shape["radius?"] = responsive(radius, bps);
  }
}

export function layoutComponents(theme: LayoutTheme = {}) {
  const bps = theme.breakpoints ? Object.keys(theme.breakpoints) : DEFAULT_BREAKPOINTS;

  const box: Shape = { ...sizingShape };
  addSpacing(box, theme.space, bps);
  addSurface(box, theme, bps);
  box["colSpan?"] = responsive("number", bps);
  box["rowSpan?"] = responsive("number", bps);

  const flex: Shape = { ...sizingShape };
  addSpacing(flex, theme.space, bps);
  addSurface(flex, theme, bps);
  addGap(flex, theme.space, bps);
  flex["direction?"] = responsive(flexDirectionExpr, bps);
  flex["align?"] = alignExpr;
  flex["justify?"] = justifyExpr;
  flex["wrap?"] = wrapExpr;

  const grid: Shape = { ...sizingShape };
  addSpacing(grid, theme.space, bps);
  addSurface(grid, theme, bps);
  addGap(grid, theme.space, bps);
  grid["columns?"] = responsive("number", bps);
  grid["rows?"] = responsive("number", bps);
  grid["autoFlow?"] = autoFlowExpr;

  return {
    Box: {
      callbacks: {},
      fields: type(box),
      slots: ["default"] as const,
    },
    Flex: {
      callbacks: {},
      fields: type(flex),
      slots: ["default"] as const,
    },
    Grid: {
      callbacks: {},
      fields: type(grid),
      slots: ["default"] as const,
    },
  };
}
