import { describe, expect, it } from "vitest";
import { toReactEventName, toReactProps } from "../render-utils";

describe("toReactEventName", () => {
  it("capitalises the first letter and prepends on", () => {
    expect(toReactEventName("click")).toBe("onClick");
    expect(toReactEventName("keydown")).toBe("onKeydown");
    expect(toReactEventName("blur")).toBe("onBlur");
  });
});

describe("toReactProps", () => {
  it("converts class to className", () => {
    expect(toReactProps({ class: "foo" })).toEqual({ className: "foo" });
  });

  it("converts for to htmlFor", () => {
    expect(toReactProps({ for: "input-id" })).toEqual({ htmlFor: "input-id" });
  });

  it("leaves other props unchanged", () => {
    expect(toReactProps({ id: "x", "aria-label": "y" })).toEqual({ id: "x", "aria-label": "y" });
  });

  it("handles both class and for together", () => {
    expect(toReactProps({ class: "btn", for: "x" })).toEqual({ className: "btn", htmlFor: "x" });
  });
});
