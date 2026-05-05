import { z } from "zod";
import type { LayoutTheme } from "./theme";

type Shape = Record<string, z.ZodTypeAny>;

const DEFAULT_BREAKPOINTS = ["base", "sm", "md", "lg", "xl"];

const sizingShape: Shape = {
  w: z.union([z.string(), z.number()] as const).optional(),
  h: z.union([z.string(), z.number()] as const).optional(),
  minW: z.union([z.string(), z.number()] as const).optional(),
  maxW: z.union([z.string(), z.number()] as const).optional(),
  minH: z.union([z.string(), z.number()] as const).optional(),
  maxH: z.union([z.string(), z.number()] as const).optional(),
};

const flexDirectionEnum = z.enum({
  row: "row",
  column: "column",
  "row-reverse": "row-reverse",
  "column-reverse": "column-reverse",
});

const alignEnum = z.enum({
  start: "start",
  center: "center",
  end: "end",
  stretch: "stretch",
  baseline: "baseline",
});

const justifyEnum = z.enum({
  start: "start",
  center: "center",
  end: "end",
  between: "between",
  around: "around",
  evenly: "evenly",
});

const wrapEnum = z.enum({
  wrap: "wrap",
  nowrap: "nowrap",
  "wrap-reverse": "wrap-reverse",
});

const autoFlowEnum = z.enum({
  row: "row",
  column: "column",
  "row-dense": "row-dense",
  "column-dense": "column-dense",
});

function responsive<T extends z.ZodTypeAny>(schema: T, bps: string[]) {
  const bpShape: Shape = {};
  for (const key of bps) {
    bpShape[key] = schema.optional();
  }
  return z.union([schema, z.object(bpShape)] as const);
}

function tokenEnum(record: Record<string, string> | undefined) {
  if (!record) {
    return null;
  }
  const keys = Object.keys(record);
  if (keys.length === 0) {
    return null;
  }
  return z.enum(Object.fromEntries(keys.map((k) => [k, k])) as Record<string, string>);
}

function addSpacing(shape: Shape, space: Record<string, string> | undefined, bps: string[]) {
  const e = tokenEnum(space);
  if (!e) {
    return;
  }
  const opt = responsive(e, bps).optional();
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
    shape[key] = opt;
  }
}

function addGap(shape: Shape, space: Record<string, string> | undefined, bps: string[]) {
  const e = tokenEnum(space);
  if (!e) {
    return;
  }
  const opt = responsive(e, bps).optional();
  for (const key of ["gap", "rowGap", "columnGap"]) {
    shape[key] = opt;
  }
}

function addSurface(shape: Shape, theme: LayoutTheme, bps: string[]) {
  const bg = tokenEnum(theme.colors?.background);
  if (bg) {
    shape.bg = responsive(bg, bps).optional();
  }

  const border = tokenEnum(theme.border);
  if (border) {
    shape.border = responsive(border, bps).optional();
  }

  const borderColor = tokenEnum(theme.colors?.border);
  if (borderColor) {
    shape.borderColor = responsive(borderColor, bps).optional();
  }

  const radius = tokenEnum(theme.radius);
  if (radius) {
    shape.radius = responsive(radius, bps).optional();
  }
}

export function layoutComponents(theme: LayoutTheme = {}) {
  const bps = theme.breakpoints ? Object.keys(theme.breakpoints) : DEFAULT_BREAKPOINTS;
  const resp = <T extends z.ZodTypeAny>(s: T) => responsive(s, bps).optional();

  const box: Shape = { ...sizingShape };
  addSpacing(box, theme.space, bps);
  addSurface(box, theme, bps);
  box.colSpan = resp(z.number());
  box.rowSpan = resp(z.number());

  const flex: Shape = { ...sizingShape };
  addSpacing(flex, theme.space, bps);
  addSurface(flex, theme, bps);
  addGap(flex, theme.space, bps);
  flex.direction = resp(flexDirectionEnum);
  flex.align = alignEnum.optional();
  flex.justify = justifyEnum.optional();
  flex.wrap = wrapEnum.optional();

  const grid: Shape = { ...sizingShape };
  addSpacing(grid, theme.space, bps);
  addSurface(grid, theme, bps);
  addGap(grid, theme.space, bps);
  grid.columns = resp(z.number());
  grid.rows = resp(z.number());
  grid.autoFlow = autoFlowEnum.optional();

  return {
    Box: { callbacks: {}, fields: z.object(box), slots: ["default"] as const },
    Flex: { callbacks: {}, fields: z.object(flex), slots: ["default"] as const },
    Grid: { callbacks: {}, fields: z.object(grid), slots: ["default"] as const },
  };
}
