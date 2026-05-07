import { h, render } from "preact";
import { describe, expect, it, vi } from "vitest";
import { Element } from "../element.js";
import { DomEvent } from "../event.js";
import { createWorkerDOM } from "../index.js";

const callbackEvent = "tailorkitcallbackonselect";

describe("Preact callbacks", () => {
  it("dispatches custom callback handlers", () => {
    const worker = createWorkerDOM();
    const handleSelect = vi.fn();

    render(h("tailorkit-tabs", { [`on${callbackEvent}`]: handleSelect }), worker.root);
    const element = worker.root.firstChild;
    expect(element).toBeInstanceOf(Element);
    (element as Element).dispatchEvent(new DomEvent(callbackEvent, { detail: ["notes"] }));

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ detail: ["notes"], type: callbackEvent }),
    );
    worker.cleanup();
  });

  it("replaces custom callback handlers on update", () => {
    const worker = createWorkerDOM();
    const oldHandler = vi.fn();
    const newHandler = vi.fn();

    render(h("tailorkit-button", { [`on${callbackEvent}`]: oldHandler }), worker.root);
    render(h("tailorkit-button", { [`on${callbackEvent}`]: newHandler }), worker.root);
    const element = worker.root.firstChild as Element;
    element.dispatchEvent(new DomEvent(callbackEvent));

    expect(oldHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledOnce();
    worker.cleanup();
  });

  it("removes custom callback handlers on update", () => {
    const worker = createWorkerDOM();
    const handleSelect = vi.fn();

    render(h("tailorkit-button", { [`on${callbackEvent}`]: handleSelect }), worker.root);
    render(h("tailorkit-button", null), worker.root);
    const element = worker.root.firstChild as Element;
    element.dispatchEvent(new DomEvent(callbackEvent));

    expect(handleSelect).not.toHaveBeenCalled();
    worker.cleanup();
  });
});
