import { createContext, useContext, useId, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { TailorKitTheme } from "@tailorkit/core/schema";

type Responsive<T> = T | Record<string, T | undefined>;
type PrimitiveValue = number | string;
type PrimitiveProps = Record<string, unknown>;

interface PrimitiveThemeContextValue {
  screenId: string;
  theme: TailorKitTheme;
}

export const PrimitiveThemeContext = createContext<PrimitiveThemeContextValue | null>(null);

const tokenGroups = [
  "space",
  "radius",
  "background",
  "border",
  "borderColor",
  "textColor",
] as const;

const cssEscape = (value: string): string => {
  const css = (globalThis as { CSS?: { escape?: (input: string) => string } }).CSS;
  if (typeof css?.escape === "function") {
    return css.escape(value);
  }
  return value.replaceAll(/[^A-Za-z0-9_-]/g, "\\$&");
};

const toCssValue = (
  group: (typeof tokenGroups)[number] | "size" | "raw",
  value: PrimitiveValue,
): string => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (group === "size" || group === "raw") {
    return value;
  }
  return `var(--tailorkit-${group}-${cssEscape(value)})`;
};

const toResponsiveEntries = <T,>(value: Responsive<T> | undefined): [string, T][] => {
  if (value === undefined) {
    return [];
  }
  if (!(value && typeof value === "object") || Array.isArray(value)) {
    return [["base", value as T]];
  }
  return Object.entries(value as Record<string, T | undefined>).filter(
    (entry): entry is [string, T] => entry[1] !== undefined,
  );
};

const declarationsForProp = (prop: string, value: PrimitiveValue): string[] => {
  if (prop === "background") {
    return [`background: ${toCssValue("background", value)};`];
  }
  if (prop === "border") {
    return [`border: ${toCssValue("border", value)};`];
  }
  if (prop === "borderColor") {
    return [`border-color: ${toCssValue("borderColor", value)};`];
  }
  if (prop === "textColor") {
    return [`color: ${toCssValue("textColor", value)};`];
  }
  if (prop === "columns") {
    return [`grid-template-columns: repeat(${String(value)}, minmax(0, 1fr));`];
  }
  if (prop === "gap" || prop === "margin" || prop === "padding") {
    return [`${prop}: ${toCssValue("space", value)};`];
  }
  if (prop === "height" || prop === "width") {
    return [`${prop}: ${toCssValue("size", value)};`];
  }
  if (prop === "radius") {
    return [`border-radius: ${toCssValue("radius", value)};`];
  }
  if (prop === "align") {
    return [`align-items: ${toFlexAlignment(value)};`];
  }
  if (prop === "justify") {
    return [`justify-content: ${toFlexJustification(value)};`];
  }
  if (prop === "direction") {
    return [`flex-direction: ${toCssValue("raw", value)};`];
  }
  if (prop === "overflow") {
    return [`overflow: ${toCssValue("raw", value)};`];
  }
  if (prop === "grow") {
    return [`flex-grow: ${String(value)};`];
  }
  if (prop === "shrink") {
    return [`flex-shrink: ${String(value)};`];
  }
  if (prop === "minHeight") {
    return [`min-height: ${toCssValue("size", value)};`];
  }
  if (prop === "minWidth") {
    return [`min-width: ${toCssValue("size", value)};`];
  }
  if (prop === "basis") {
    return [`flex-basis: ${toCssValue("size", value)};`];
  }
  if (prop === "wrap") {
    return [`flex-wrap: ${toCssValue("raw", value)};`];
  }
  return [];
};

const toFlexAlignment = (value: PrimitiveValue): string => {
  if (value === "start") {
    return "flex-start";
  }
  if (value === "end") {
    return "flex-end";
  }
  return String(value);
};

const toFlexJustification = (value: PrimitiveValue): string => {
  if (value === "start") {
    return "flex-start";
  }
  if (value === "end") {
    return "flex-end";
  }
  if (value === "between") {
    return "space-between";
  }
  return String(value);
};

const buildPrimitiveCss = ({
  display,
  nodeId,
  props,
  screenId,
  theme,
}: {
  display: "block" | "flex" | "grid" | "inline";
  nodeId: string;
  props: PrimitiveProps;
  screenId: string;
  theme: TailorKitTheme;
}): string => {
  const selector = `[data-tailorkit-screen="${cssEscape(screenId)}"] [data-tailorkit-node="${cssEscape(
    nodeId,
  )}"]`;
  const base = [`display: ${display};`];
  const byBreakpoint = new Map<string, string[]>();

  for (const [prop, rawValue] of Object.entries(props)) {
    for (const [breakpoint, value] of toResponsiveEntries(rawValue as Responsive<PrimitiveValue>)) {
      const declarations = declarationsForProp(prop, value);
      if (declarations.length === 0) {
        continue;
      }
      const target = breakpoint === "base" ? base : (byBreakpoint.get(breakpoint) ?? []);
      target.push(...declarations);
      if (breakpoint !== "base") {
        byBreakpoint.set(breakpoint, target);
      }
    }
  }

  const rules = [`${selector} { ${base.join(" ")} }`];
  for (const [breakpoint, declarations] of byBreakpoint) {
    const minWidth = theme.breakpoints?.[breakpoint];
    if (!minWidth) {
      continue;
    }
    rules.push(`@media (min-width: ${minWidth}) { ${selector} { ${declarations.join(" ")} } }`);
  }

  return rules.join("\n");
};

export const buildThemeCss = (screenId: string, theme: TailorKitTheme): string => {
  const selector = `[data-tailorkit-screen="${cssEscape(screenId)}"]`;
  const declarations: string[] = [];

  for (const group of tokenGroups) {
    for (const [name, value] of Object.entries(theme.tokens?.[group] ?? {})) {
      declarations.push(`--tailorkit-${group}-${cssEscape(name)}: ${value};`);
    }
  }

  return `${selector} { ${declarations.join(" ")} }`;
};

const usePrimitiveNodeId = (): string => {
  const id = useId();
  return useMemo(() => `tailorkit-${id.replaceAll(":", "")}`, [id]);
};

const Primitive = ({
  children,
  display,
  element,
  props,
}: {
  children?: ReactNode;
  display: "block" | "flex" | "grid" | "inline";
  element: "div" | "span";
  props: PrimitiveProps;
}): ReactNode => {
  const context = useContext(PrimitiveThemeContext);
  const nodeId = usePrimitiveNodeId();
  const Element = element;
  const css = context
    ? buildPrimitiveCss({
        display,
        nodeId,
        props,
        screenId: context.screenId,
        theme: context.theme,
      })
    : "";

  return (
    <Element data-tailorkit-node={nodeId}>
      {css === "" ? null : <style data-tailorkit-node-style={nodeId}>{css}</style>}
      {children}
    </Element>
  );
};

export const primitives = {
  Box: ({ props, slots }: { props: PrimitiveProps; slots: { default?: ReactNode } }) => (
    <Primitive display="block" element="div" props={props}>
      {slots.default}
    </Primitive>
  ),
  Flex: ({ props, slots }: { props: PrimitiveProps; slots: { default?: ReactNode } }) => (
    <Primitive display="flex" element="div" props={props}>
      {slots.default}
    </Primitive>
  ),
  Grid: ({ props, slots }: { props: PrimitiveProps; slots: { default?: ReactNode } }) => (
    <Primitive display="grid" element="div" props={props}>
      {slots.default}
    </Primitive>
  ),
  Inline: ({ props, slots }: { props: PrimitiveProps; slots: { default?: ReactNode } }) => (
    <Primitive display="inline" element="span" props={props}>
      {slots.default}
    </Primitive>
  ),
} as const;

export type PrimitiveStyle = CSSProperties;
