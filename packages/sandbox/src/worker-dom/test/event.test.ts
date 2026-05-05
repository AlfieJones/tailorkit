import { describe, expect, it } from "vitest";
import { DomEvent } from "../event.js";

describe("DomEvent", () => {
  it("sets type, bubbles=false, cancelable=false by default", () => {
    const ev = new DomEvent("click");
    expect(ev.type).toBe("click");
    expect(ev.bubbles).toBe(false);
    expect(ev.cancelable).toBe(false);
    expect(ev.defaultPrevented).toBe(false);
    expect(ev._stop).toBe(false);
    expect(ev._end).toBe(false);
  });

  it("respects bubbles and cancelable options", () => {
    const ev = new DomEvent("mousedown", { bubbles: true, cancelable: true });
    expect(ev.bubbles).toBe(true);
    expect(ev.cancelable).toBe(true);
  });

  it("stopPropagation sets _stop only", () => {
    const ev = new DomEvent("click");
    ev.stopPropagation();
    expect(ev._stop).toBe(true);
    expect(ev._end).toBe(false);
  });

  it("stopImmediatePropagation sets both _stop and _end", () => {
    const ev = new DomEvent("click");
    ev.stopImmediatePropagation();
    expect(ev._stop).toBe(true);
    expect(ev._end).toBe(true);
  });

  it("preventDefault sets defaultPrevented on cancelable events", () => {
    const ev = new DomEvent("click", { cancelable: true });
    ev.preventDefault();
    expect(ev.defaultPrevented).toBe(true);
  });

  it("preventDefault does not set defaultPrevented on non-cancelable events", () => {
    const ev = new DomEvent("click");
    ev.preventDefault();
    expect(ev.defaultPrevented).toBe(false);
  });

  it("target and currentTarget start as null", () => {
    const ev = new DomEvent("click");
    expect(ev.target).toBeNull();
    expect(ev.currentTarget).toBeNull();
  });
});
