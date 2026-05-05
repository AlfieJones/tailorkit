import * as v from "valibot";
import type { LayoutTheme } from "./theme";

type Schema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
type Shape = Record<string, Schema>;

const DEFAULT_BREAKPOINTS = ["base", "sm", "md", "lg", "xl"];

const sizingShape: Shape = {
  w: v.optional(v.union([v.string(), v.number()])),
  h: v.optional(v.union([v.string(), v.number()])),
  minW: v.optional(v.union([v.string(), v.number()])),
  maxW: v.optional(v.union([v.string(), v.number()])),
  minH: v.optional(v.union([v.string(), v.number()])),
  maxH: v.optional(v.union([v.string(), v.number()])),
};

const flexDirectionSchema = v.picklist(["row", "column", "row-reverse", "column-reverse"]);
const alignSchema = v.picklist(["start", "center", "end", "stretch", "baseline"]);
const justifySchema = v.picklist(["start", "center", "end", "between", "around", "evenly"]);
const wrapSchema = v.picklist(["wrap", "nowrap", "wrap-reverse"]);
const autoFlowSchema = v.picklist(["row", "column", "row-dense", "column-dense"]);

function responsive<T extends Schema>(schema: T, bps: string[]) {
  const bpShape: Shape = {};
  for (const key of bps) {
    bpShape[key] = v.optional(schema);
  }
  return v.union([schema, v.object(bpShape as v.ObjectEntries)]);
}

function tokenPicklist(record: Record<string, string> | undefined) {
  if (!record) {
    return null;
  }
  const keys = Object.keys(record);
  if (keys.length === 0) {
    return null;
  }
  return v.picklist(keys);
}

function addSpacing(shape: Shape, space: Record<string, string> | undefined, bps: string[]) {
  const s = tokenPicklist(space);
  if (!s) {
    return;
  }
  const opt = v.optional(responsive(s, bps));
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
  const s = tokenPicklist(space);
  if (!s) {
    return;
  }
  const opt = v.optional(responsive(s, bps));
  for (const key of ["gap", "rowGap", "columnGap"]) {
    shape[key] = opt;
  }
}

function addSurface(shape: Shape, theme: LayoutTheme, bps: string[]) {
  const bg = tokenPicklist(theme.colors?.background);
  if (bg) {
    shape.bg = v.optional(responsive(bg, bps));
  }

  const border = tokenPicklist(theme.border);
  if (border) {
    shape.border = v.optional(responsive(border, bps));
  }

  const borderColor = tokenPicklist(theme.colors?.border);
  if (borderColor) {
    shape.borderColor = v.optional(responsive(borderColor, bps));
  }

  const radius = tokenPicklist(theme.radius);
  if (radius) {
    shape.radius = v.optional(responsive(radius, bps));
  }
}

export function layoutComponents(theme: LayoutTheme = {}) {
  const bps = theme.breakpoints ? Object.keys(theme.breakpoints) : DEFAULT_BREAKPOINTS;
  const resp = <T extends Schema>(s: T) => v.optional(responsive(s, bps));

  const box: Shape = { ...sizingShape };
  addSpacing(box, theme.space, bps);
  addSurface(box, theme, bps);
  box.colSpan = resp(v.number());
  box.rowSpan = resp(v.number());

  const flex: Shape = { ...sizingShape };
  addSpacing(flex, theme.space, bps);
  addSurface(flex, theme, bps);
  addGap(flex, theme.space, bps);
  flex.direction = resp(flexDirectionSchema);
  flex.align = v.optional(alignSchema);
  flex.justify = v.optional(justifySchema);
  flex.wrap = v.optional(wrapSchema);

  const grid: Shape = { ...sizingShape };
  addSpacing(grid, theme.space, bps);
  addSurface(grid, theme, bps);
  addGap(grid, theme.space, bps);
  grid.columns = resp(v.number());
  grid.rows = resp(v.number());
  grid.autoFlow = v.optional(autoFlowSchema);

  return {
    Box: {
      callbacks: {},
      fields: v.object(box as v.ObjectEntries),
      slots: ["default"] as const,
    },
    Flex: {
      callbacks: {},
      fields: v.object(flex as v.ObjectEntries),
      slots: ["default"] as const,
    },
    Grid: {
      callbacks: {},
      fields: v.object(grid as v.ObjectEntries),
      slots: ["default"] as const,
    },
  };
}
