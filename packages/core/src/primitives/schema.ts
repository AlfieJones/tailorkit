import { z } from "zod";
import type { ComponentDefinition } from "../schema";
import type { TailorKitTheme } from "./theme";

const primitiveMarker = Symbol.for("tailorkit.primitive");

export type PrimitiveName = "Box" | "Flex" | "Grid" | "Inline";

export interface PrimitiveComponentDefinition extends ComponentDefinition {
  [primitiveMarker]: PrimitiveName;
}

type Shape = Record<string, z.ZodTypeAny>;
type NonEmptyStringArray = readonly [string, ...string[]];

const directionOptions = ["row", "column"] as const;
const alignOptions = ["start", "center", "end", "stretch"] as const;
const justifyOptions = ["start", "center", "end", "between"] as const;
const columnOptions = [1, 2, 3, 4, 6, 12] as const;

const direction = z.enum(directionOptions);
const align = z.enum(alignOptions);
const justify = z.enum(justifyOptions);
const columns = z.union([
  z.literal(columnOptions[0]),
  z.literal(columnOptions[1]),
  z.literal(columnOptions[2]),
  z.literal(columnOptions[3]),
  z.literal(columnOptions[4]),
  z.literal(columnOptions[5]),
]);

const tokenEnum = (tokens: Record<string, string> | undefined): z.ZodTypeAny => {
  const keys = Object.keys(tokens ?? {});
  if (keys.length === 0) {
    return z.never();
  }
  return z.enum(keys as unknown as NonEmptyStringArray);
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
  height: optionalResponsive(tokenEnum(theme.tokens?.size), theme),
  margin: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  overflow: optionalResponsive(tokenEnum(theme.tokens?.overflow), theme),
  overflowWrap: optionalResponsive(tokenEnum(theme.tokens?.overflowWrap), theme),
  padding: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  radius: optionalResponsive(tokenEnum(theme.tokens?.radius), theme),
  textAlign: optionalResponsive(tokenEnum(theme.tokens?.textAlign), theme),
  textOverflow: optionalResponsive(tokenEnum(theme.tokens?.textOverflow), theme),
  textTransform: optionalResponsive(tokenEnum(theme.tokens?.textTransform), theme),
  width: optionalResponsive(tokenEnum(theme.tokens?.size), theme),
});

const inlineShape = (theme: TailorKitTheme): Shape => ({
  background: optionalResponsive(tokenEnum(theme.tokens?.background), theme),
  borderColor: optionalResponsive(tokenEnum(theme.tokens?.borderColor), theme),
  margin: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  overflowWrap: optionalResponsive(tokenEnum(theme.tokens?.overflowWrap), theme),
  padding: optionalResponsive(tokenEnum(theme.tokens?.space), theme),
  radius: optionalResponsive(tokenEnum(theme.tokens?.radius), theme),
  textAlign: optionalResponsive(tokenEnum(theme.tokens?.textAlign), theme),
  textOverflow: optionalResponsive(tokenEnum(theme.tokens?.textOverflow), theme),
  textTransform: optionalResponsive(tokenEnum(theme.tokens?.textTransform), theme),
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
