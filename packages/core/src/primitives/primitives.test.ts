import { describe, expect, it } from "vitest";
import { defineSchema } from "../schema";
import { primitives } from "./schema";

const isValid = (schema: unknown, value: unknown): boolean => {
  if (schema && typeof schema === "object" && "safeParse" in schema) {
    return (schema as { safeParse: (input: unknown) => { success: boolean } }).safeParse(value)
      .success;
  }
  return false;
};

describe("primitive schema components", () => {
  const schema = defineSchema({
    theme: {
      breakpoints: {
        base: null,
        sm: "640px",
        lg: "1024px",
      },
      tokens: {
        background: {
          muted: "var(--muted)",
          surface: "var(--background)",
        },
        borderColor: {
          default: "var(--border)",
        },
        radius: {
          md: "8px",
          sm: "4px",
        },
        space: {
          lg: "16px",
          md: "8px",
          sm: "4px",
        },
      },
    },
    components: {
      ...primitives,
    },
  });

  it("stores the resolved theme on the schema", () => {
    expect(schema.theme.breakpoints?.sm).toBe("640px");
    expect(schema.theme.tokens?.space?.md).toBe("8px");
  });

  it("validates primitive token props against theme token names", () => {
    const box = schema.$internal.components.Box.fields;
    expect(isValid(box, { padding: "md", radius: "sm" })).toBe(true);
    expect(isValid(box, { padding: "unknown" })).toBe(false);
  });

  it("validates responsive primitive props against theme breakpoint names", () => {
    const flex = schema.$internal.components.Flex.fields;
    expect(isValid(flex, { direction: { base: "column", lg: "row" }, gap: { sm: "md" } })).toBe(
      true,
    );
    expect(isValid(flex, { direction: { xl: "row" } })).toBe(false);
  });

  it("serializes the theme with the schema", () => {
    expect(schema.serialize().theme?.breakpoints?.lg).toBe("1024px");
    expect(schema.serialize().components.Box?.slots).toEqual(["default"]);
  });

  it("provides default breakpoints, space, radius, border, size, and text tokens", () => {
    const defaultSchema = defineSchema({
      components: {
        ...primitives,
      },
    });
    const box = defaultSchema.$internal.components.Box.fields;

    expect(defaultSchema.theme.breakpoints?.["2xl"]).toBe("1536px");
    expect(defaultSchema.theme.tokens?.space?.["3xl"]).toBe("4.5rem");
    expect(defaultSchema.theme.tokens?.radius?.md).toBe("0.5rem");
    expect(defaultSchema.theme.tokens?.border?.solid).toBe("solid");
    expect(defaultSchema.theme.tokens?.overflow?.scroll).toBe("scroll");
    expect(defaultSchema.theme.tokens?.overflowWrap?.breakWord).toBe("break-word");
    expect(defaultSchema.theme.tokens?.size?.["1/3"]).toBe("33.333333%");
    expect(defaultSchema.theme.tokens?.size?.full).toBe("100%");
    expect(defaultSchema.theme.tokens?.size?.min).toBe("min-content");
    expect(defaultSchema.theme.tokens?.textAlign?.justify).toBe("justify");
    expect(defaultSchema.theme.tokens?.textOverflow?.ellipsis).toBe("ellipsis");
    expect(defaultSchema.theme.tokens?.textTransform?.uppercase).toBe("uppercase");
    expect(isValid(box, { border: "solid", padding: "2xs", radius: "3xl" })).toBe(true);
    expect(isValid(box, { height: "min", width: { base: "full", xl: "1/2" } })).toBe(true);
    expect(isValid(box, { overflow: { base: "hidden", lg: "auto" } })).toBe(true);
    expect(isValid(box, { overflowWrap: "breakWord", textOverflow: "ellipsis" })).toBe(true);
    expect(isValid(box, { textAlign: { base: "start", lg: "center" } })).toBe(true);
    expect(isValid(box, { textTransform: { base: "none", lg: "uppercase" } })).toBe(true);
    expect(isValid(box, { height: "100px", width: "unknown" })).toBe(false);
    expect(isValid(box, { overflow: "overlay" })).toBe(false);
    expect(isValid(box, { overflowWrap: "break-word" })).toBe(false);
    expect(isValid(box, { textOverflow: "fade" })).toBe(false);
    expect(isValid(box, { textAlign: "middle" })).toBe(false);
    expect(isValid(box, { textTransform: "titlecase" })).toBe(false);
    expect(isValid(box, { padding: { base: "none", xl: "2xl" } })).toBe(true);
  });
});
