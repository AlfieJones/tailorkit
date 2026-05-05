import { ArkErrors } from "arktype";
import * as v from "valibot";
import type { z } from "zod";
import { describe, expect, it } from "vitest";
import { layoutComponents as arktypeLayout } from "./arktype";
import { layoutComponents as valibotLayout } from "./valibot";
import { layoutComponents as zodLayout } from "./zod";
import type { LayoutTheme } from "./theme";

type IsValid = (value: unknown) => boolean;

interface Suite {
  Box: IsValid;
  Flex: IsValid;
  Grid: IsValid;
}

const zodFn =
  (schema: z.ZodTypeAny): IsValid =>
  (val) =>
    schema.safeParse(val).success;

const valibotFn =
  (schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>): IsValid =>
  (val) =>
    v.safeParse(schema, val).success;

const arktypeFn =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema: any): IsValid =>
    (val) =>
      !(schema(val) instanceof ArkErrors);

function makeSuite(theme: LayoutTheme = {}): { zod: Suite; valibot: Suite; arktype: Suite } {
  const zod = zodLayout(theme);
  const valibot = valibotLayout(theme);
  const arktype = arktypeLayout(theme);

  return {
    zod: {
      Box: zodFn(zod.Box.fields),
      Flex: zodFn(zod.Flex.fields),
      Grid: zodFn(zod.Grid.fields),
    },
    valibot: {
      Box: valibotFn(valibot.Box.fields),
      Flex: valibotFn(valibot.Flex.fields),
      Grid: valibotFn(valibot.Grid.fields),
    },
    arktype: {
      Box: arktypeFn(arktype.Box.fields),
      Flex: arktypeFn(arktype.Flex.fields),
      Grid: arktypeFn(arktype.Grid.fields),
    },
  };
}

function allValid(validators: Suite[keyof Suite][], value: unknown, msg?: string) {
  for (const isValid of validators) {
    expect(isValid(value), msg).toBe(true);
  }
}

function allInvalid(validators: Suite[keyof Suite][], value: unknown, msg?: string) {
  for (const isValid of validators) {
    expect(isValid(value), msg).toBe(false);
  }
}

function boxes(suite: ReturnType<typeof makeSuite>) {
  return [suite.zod.Box, suite.valibot.Box, suite.arktype.Box];
}
function flexes(suite: ReturnType<typeof makeSuite>) {
  return [suite.zod.Flex, suite.valibot.Flex, suite.arktype.Flex];
}
function grids(suite: ReturnType<typeof makeSuite>) {
  return [suite.zod.Grid, suite.valibot.Grid, suite.arktype.Grid];
}

describe("layout components — no theme", () => {
  const suite = makeSuite();

  it("accepts empty object for all components", () => {
    allValid(boxes(suite), {});
    allValid(flexes(suite), {});
    allValid(grids(suite), {});
  });

  it("accepts sizing props with string values", () => {
    const input = { w: "100px", h: "50%", minW: "0", maxW: "100%", minH: "0", maxH: "200px" };
    allValid(boxes(suite), input);
    allValid(flexes(suite), input);
    allValid(grids(suite), input);
  });

  it("accepts sizing props with number values", () => {
    const input = { w: 100, h: 200, minW: 0, maxW: 500 };
    allValid(boxes(suite), input);
  });

  it("rejects sizing props with boolean values", () => {
    allInvalid(boxes(suite), { w: true }, "w: true should be invalid");
    allInvalid(boxes(suite), { h: false }, "h: false should be invalid");
  });

  it("rejects null as a sizing prop value", () => {
    allInvalid(boxes(suite), { w: null }, "w: null should be invalid");
  });

  it("accepts colSpan and rowSpan on Box", () => {
    allValid(boxes(suite), { colSpan: 2, rowSpan: 3 });
  });

  it("rejects colSpan with a string value", () => {
    allInvalid(boxes(suite), { colSpan: "2" }, "colSpan: '2' should be invalid");
  });
});

describe("layout components — with space theme", () => {
  const theme: LayoutTheme = { space: { sm: "4px", md: "8px", lg: "16px" } };
  const suite = makeSuite(theme);

  it("accepts valid spacing tokens", () => {
    allValid(boxes(suite), { p: "sm", px: "md", m: "lg" });
    allValid(flexes(suite), { gap: "sm", rowGap: "md", columnGap: "lg" });
  });

  it("rejects unknown spacing tokens", () => {
    allInvalid(boxes(suite), { p: "xl" }, "unknown token 'xl'");
    allInvalid(boxes(suite), { m: "unknown" }, "unknown token 'unknown'");
  });

  it("accepts responsive spacing as an object", () => {
    allValid(boxes(suite), { px: { sm: "sm", md: "md", lg: "lg" } });
  });

  it("accepts responsive spacing with partial breakpoints", () => {
    allValid(boxes(suite), { p: { sm: "sm" } });
    allValid(boxes(suite), { m: { md: "md", lg: "lg" } });
  });

  it("rejects responsive spacing with invalid token in breakpoint", () => {
    allInvalid(boxes(suite), { px: { sm: "unknown" } }, "invalid token in responsive");
  });
});

describe("layout components — surface props", () => {
  const theme: LayoutTheme = {
    colors: { background: { white: "#fff", dark: "#111" }, border: { light: "#eee" } },
    border: { thin: "1px solid", thick: "2px solid" },
    radius: { sm: "4px", full: "9999px" },
  };
  const suite = makeSuite(theme);

  it("accepts valid surface tokens", () => {
    allValid(boxes(suite), { bg: "white", border: "thin", borderColor: "light", radius: "sm" });
  });

  it("accepts responsive bg", () => {
    allValid(boxes(suite), { bg: { base: "white", md: "dark" } });
  });

  it("rejects unknown surface tokens", () => {
    allInvalid(boxes(suite), { bg: "gray" }, "unknown bg token");
    allInvalid(boxes(suite), { radius: "lg" }, "unknown radius token");
  });
});

describe("Flex-specific props", () => {
  const suite = makeSuite();

  it("accepts valid direction values", () => {
    for (const val of ["row", "column", "row-reverse", "column-reverse"]) {
      allValid(flexes(suite), { direction: val }, `direction: ${val}`);
    }
  });

  it("rejects invalid direction", () => {
    allInvalid(flexes(suite), { direction: "diagonal" }, "direction: diagonal");
  });

  it("accepts responsive direction", () => {
    allValid(flexes(suite), { direction: { base: "column", md: "row" } });
  });

  it("accepts valid align values", () => {
    for (const val of ["start", "center", "end", "stretch", "baseline"]) {
      allValid(flexes(suite), { align: val }, `align: ${val}`);
    }
  });

  it("accepts valid justify values", () => {
    for (const val of ["start", "center", "end", "between", "around", "evenly"]) {
      allValid(flexes(suite), { justify: val }, `justify: ${val}`);
    }
  });

  it("accepts valid wrap values", () => {
    for (const val of ["wrap", "nowrap", "wrap-reverse"]) {
      allValid(flexes(suite), { wrap: val }, `wrap: ${val}`);
    }
  });

  it("rejects invalid align, justify, wrap", () => {
    allInvalid(flexes(suite), { align: "top" }, "align: top");
    allInvalid(flexes(suite), { justify: "left" }, "justify: left");
    allInvalid(flexes(suite), { wrap: "yes" }, "wrap: yes");
  });
});

describe("Grid-specific props", () => {
  const suite = makeSuite();

  it("accepts columns and rows as numbers", () => {
    allValid(grids(suite), { columns: 3, rows: 2 });
  });

  it("accepts responsive columns", () => {
    allValid(grids(suite), { columns: { base: 1, md: 2, lg: 3 } });
  });

  it("rejects columns as string", () => {
    allInvalid(grids(suite), { columns: "3" }, "columns: '3'");
  });

  it("accepts valid autoFlow values", () => {
    for (const val of ["row", "column", "row-dense", "column-dense"]) {
      allValid(grids(suite), { autoFlow: val }, `autoFlow: ${val}`);
    }
  });

  it("rejects invalid autoFlow", () => {
    allInvalid(grids(suite), { autoFlow: "dense" }, "autoFlow: dense");
  });
});

describe("custom breakpoints", () => {
  const theme: LayoutTheme = {
    breakpoints: { mobile: "0px", tablet: "768px", desktop: "1280px" },
    space: { sm: "4px", lg: "16px" },
  };
  const suite = makeSuite(theme);

  it("accepts custom breakpoint keys in responsive props", () => {
    allValid(boxes(suite), { p: { mobile: "sm", tablet: "sm", desktop: "lg" } });
  });
});
// Note: Zod and Valibot strip unknown keys by default, so passing { p: { sm: "sm" } }
// with custom breakpoints is "valid" (the sm key is stripped, leaving {}). ArkType
// rejects extra keys. This divergence is intentional library behavior, not a bug.

// Note: when no space theme is provided, spacing/gap props are absent from the schema.
// Zod and Valibot strip unknown keys by default, so { p: "sm" } would still "pass"
// (p is stripped, leaving {}). ArkType rejects extra keys. This divergence is
// intentional library behavior — the defined props are validated consistently.
