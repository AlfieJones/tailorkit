import { z } from "zod";
import type { ComponentDefinition } from "../schema";
import { primitiveDefinitions, primitiveNames } from "./definition";
import type { PrimitiveName, PrimitivePropDefinition } from "./definition";
import type { TailorKitTheme } from "./theme";

const primitiveMarker = Symbol.for("tailorkit.primitive");

export interface PrimitiveComponentDefinition extends ComponentDefinition {
  [primitiveMarker]: PrimitiveName;
}

type Shape = Record<string, z.ZodTypeAny>;
const tokenEnum = (tokens: Record<string, string> | undefined): z.ZodTypeAny => {
  const keys = Object.keys(tokens ?? {});
  if (keys.length === 0) {
    return z.never();
  }
  return z.enum(keys as [string, ...string[]]);
};

const valueEnum = (values: readonly (number | string)[]): z.ZodTypeAny => {
  const [first, ...rest] = values;
  if (first === undefined) {
    return z.never();
  }
  return z.union([z.literal(first), ...rest.map((value) => z.literal(value))]);
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

const propSchema = (definition: PrimitivePropDefinition, theme: TailorKitTheme): z.ZodTypeAny => {
  const schema =
    definition.kind === "token"
      ? tokenEnum(theme.tokens?.[definition.token])
      : valueEnum(definition.values);
  return definition.responsive === false ? schema.optional() : optionalResponsive(schema, theme);
};

const primitiveShape = (name: PrimitiveName, theme: TailorKitTheme): Shape =>
  Object.fromEntries(
    Object.entries(primitiveDefinitions[name]).map(([propName, definition]) => [
      propName,
      propSchema(definition, theme),
    ]),
  );

const primitive = (name: PrimitiveName): PrimitiveComponentDefinition =>
  ({
    callbacks: {},
    fields: z.object({}),
    slots: ["default"] as const,
    [primitiveMarker]: name,
  }) as PrimitiveComponentDefinition;

export const primitives = Object.fromEntries(
  primitiveNames.map((name) => [name, primitive(name)]),
) as Readonly<Record<PrimitiveName, PrimitiveComponentDefinition>>;

export const isPrimitiveComponentDefinition = (
  definition: ComponentDefinition,
): definition is PrimitiveComponentDefinition => primitiveMarker in definition;

export const resolvePrimitiveFields = (
  definition: PrimitiveComponentDefinition,
  theme: TailorKitTheme,
): z.ZodObject<Shape> => z.object(primitiveShape(definition[primitiveMarker], theme));
