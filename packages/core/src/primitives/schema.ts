import { z } from "zod";
import type { ComponentDefinition } from "../schema";
import type { TailorKitTheme } from "./theme";

const primitiveMarker = Symbol.for("tailorkit.primitive");

export type PrimitiveName = "Box" | "Flex" | "Grid" | "Inline";

export interface PrimitiveComponentDefinition extends ComponentDefinition {
  [primitiveMarker]: PrimitiveName;
}

type Shape = Record<string, z.ZodTypeAny>;

const overflow = z.enum(["visible", "hidden", "auto", "clip"]);
const sizeValue = z.union([z.string(), z.number()]);
const direction = z.enum(["row", "column"]);
const align = z.enum(["start", "center", "end", "stretch"]);
const justify = z.enum(["start", "center", "end", "between"]);
const columns = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(6),
  z.literal(12),
]);

const tokenEnum = (tokens: Record<string, string> | undefined): z.ZodTypeAny => {
  const keys = Object.keys(tokens ?? {});
  if (keys.length === 0) {
    return z.never();
  }
  return z.enum(Object.fromEntries(keys.map((key) => [key, key])) as Record<string, string>);
};

const responsive = (schema: z.ZodTypeAny, theme: TailorKitTheme): z.ZodTypeAny => {
  const shape: Shape = {};
  for (const key of Object.keys(theme.breakpoints ?? {})) {
    shape[key] = schema.optional();
  }
  return z.union([schema, z.object(shape).strict()]);
};

const optionalResponsive = (schema: z.ZodTypeAny, theme: TailorKitTheme): z.ZodTypeAny =>
  responsive(schema, theme).optional();

const boxShape = (theme: TailorKitTheme): Shape => ({
  background: optionalResponsive(tokenEnum(theme.tokens?.background), theme),
  border: optionalResponsive(tokenEnum(theme.tokens?.border), theme),
  borderColor: optionalResponsive(tokenEnum(theme.tokens?.borderColor), theme),
  height: optionalResponsive(sizeValue, theme),
  margin: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  overflow: optionalResponsive(overflow, theme),
  padding: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  radius: optionalResponsive(tokenEnum(theme.tokens?.radius), theme),
  width: optionalResponsive(sizeValue, theme),
});

const inlineShape = (theme: TailorKitTheme): Shape => ({
  background: optionalResponsive(tokenEnum(theme.tokens?.background), theme),
  borderColor: optionalResponsive(tokenEnum(theme.tokens?.borderColor), theme),
  margin: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  padding: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  radius: optionalResponsive(tokenEnum(theme.tokens?.radius), theme),
});

const primitive = (name: PrimitiveName): PrimitiveComponentDefinition =>
  ({
    callbacks: {},
    fields: z.object({}),
    slots: ["default"] as const,
    [primitiveMarker]: name,
  }) as PrimitiveComponentDefinition;

export const primitives = {
  Box: primitive("Box"),
  Flex: primitive("Flex"),
  Grid: primitive("Grid"),
  Inline: primitive("Inline"),
} as const;

export const isPrimitiveComponentDefinition = (
  definition: ComponentDefinition,
): definition is PrimitiveComponentDefinition => primitiveMarker in definition;

export const resolvePrimitiveFields = (
  definition: PrimitiveComponentDefinition,
  theme: TailorKitTheme,
): z.ZodObject<Shape> => {
  const name = definition[primitiveMarker];
  if (name === "Inline") {
    return z.object(inlineShape(theme));
  }

  const shape = boxShape(theme);
  if (name === "Flex") {
    return z.object({
      ...shape,
      align: optionalResponsive(align, theme),
      direction: optionalResponsive(direction, theme),
      gap: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
      justify: optionalResponsive(justify, theme),
    });
  }

  if (name === "Grid") {
    return z.object({
      ...shape,
      columns: optionalResponsive(columns, theme),
      gap: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
    });
  }

  return z.object(shape);
};
