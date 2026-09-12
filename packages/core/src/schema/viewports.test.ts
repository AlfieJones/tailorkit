import { describe, expect, it } from "vitest";
import { createTailorKitSchema } from "./schema";
import { TailorKitSchemaSpec } from "../spec/spec";

describe("viewport scope contracts", () => {
  it("serializes supported scope lists", () => {
    const schema = createTailorKitSchema({
      components: {},
      scopes: { "/": {}, "/users": {} },
      viewports: { navbar: { scopes: ["/"] }, panel: { scopes: ["/users"] } },
    }).serialize();
    expect(TailorKitSchemaSpec.parse(schema).viewports).toEqual({
      navbar: { scopes: ["/"] },
      panel: { scopes: ["/users"] },
    });
  });

  it("rejects unknown scope references in serialized schemas", () => {
    expect(
      TailorKitSchemaSpec.safeParse({
        version: 1,
        components: {},
        scopes: { "/": {} },
        viewports: { panel: { scopes: ["/missing"] } },
      }).success,
    ).toBe(false);
  });

  it("rejects untyped host configurations with undeclared scopes", () => {
    expect(() =>
      createTailorKitSchema({
        components: {},
        scopes: { "/": {} },
        // @ts-expect-error Exercise runtime validation for JavaScript hosts.
        viewports: { panel: { scopes: ["/missing"] } },
      }),
    ).toThrow('references undeclared scope "/missing"');
  });
});
