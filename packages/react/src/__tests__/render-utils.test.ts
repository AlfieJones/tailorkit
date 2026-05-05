import { describe, expect, it } from "vitest";
import { sanitizeProps, toReactEventName, toReactProps } from "../render-utils";

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

describe("sanitizeProps", () => {
  it("passes safe props through", () => {
    const result = sanitizeProps({ id: "foo", "data-x": "1" }, { allowFunctionRefs: false });
    expect(result.error).toBeNull();
    expect(result.props).toEqual({ id: "foo", "data-x": "1" });
  });

  it("blocks dangerouslySetInnerHTML", () => {
    const result = sanitizeProps(
      { dangerouslySetInnerHTML: "<script>" },
      { allowFunctionRefs: false },
    );
    expect(result.error).toMatch(/Blocked remote prop/);
  });

  it("blocks style prop", () => {
    const result = sanitizeProps({ style: "color:red" }, { allowFunctionRefs: false });
    expect(result.error).toMatch(/Blocked remote prop/);
  });

  it("blocks on* event props when allowFunctionRefs is false", () => {
    const result = sanitizeProps({ onClick: "foo" }, { allowFunctionRefs: false });
    expect(result.error).toMatch(/Blocked remote prop/);
  });

  it("allows on* event props when allowFunctionRefs is true", () => {
    const result = sanitizeProps({ onClick: "foo" }, { allowFunctionRefs: true });
    expect(result.error).toBeNull();
  });

  it("blocks javascript: URLs in href", () => {
    const result = sanitizeProps({ href: "javascript:alert(1)" }, { allowFunctionRefs: false });
    expect(result.error).toMatch(/unsafe.*URL/);
  });

  it("blocks data: URLs", () => {
    const result = sanitizeProps(
      { src: "data:text/html,<h1>x</h1>" },
      { allowFunctionRefs: false },
    );
    expect(result.error).toMatch(/unsafe.*URL/);
  });

  it("blocks remote function refs when allowFunctionRefs is false", () => {
    const ref = { kind: "function", handlerId: "h1" };
    const result = sanitizeProps({ callback: ref }, { allowFunctionRefs: false });
    expect(result.error).toMatch(/function/);
  });

  it("adds noopener noreferrer when target is _blank", () => {
    const result = sanitizeProps({ target: "_blank" }, { allowFunctionRefs: false });
    expect(result.error).toBeNull();
    expect(result.props.rel).toBe("noopener noreferrer");
  });

  it("appends to existing rel when target is _blank", () => {
    const result = sanitizeProps(
      { target: "_blank", rel: "nofollow" },
      { allowFunctionRefs: false },
    );
    expect(result.props.rel).toBe("nofollow noopener noreferrer");
  });
});
