import { describe, expect, it } from "vitest";

import {
  defaultContextSchema,
  getDefaultContext,
  getScreenContext,
  schema,
  screenContextSchemas,
} from "./schema";

describe("TailorKit example schema", () => {
  it("shares the same screen context schemas between host helpers and TailorKit schema", () => {
    expect(schema.defaultContext).toBe(defaultContextSchema);
    expect(schema.screens["/customers"].context).toBe(screenContextSchemas["/customers"]);

    expect(() => {
      defaultContextSchema.parse(getDefaultContext());
      screenContextSchemas["/customers"].parse(getScreenContext("/customers"));
    }).not.toThrow();
  });
});
