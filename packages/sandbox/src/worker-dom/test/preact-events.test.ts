import { h, render } from "preact";
import { describe, expect, it, vi } from "vitest";
import { Element } from "../element.js";
import { DomEvent } from "../event.js";
import { createWorkerDOM } from "../index.js";

describe("Preact events", () => {
  it("dispatches event handlers with the element as listener context", () => {
    const worker = createWorkerDOM();
    const handleClick = vi.fn();

    render(h("button", { onClick: handleClick }, "Save"), worker.root);
    const button = worker.root.firstChild;
    expect(button).toBeInstanceOf(Element);
    (button as Element).dispatchEvent(new DomEvent("click", { bubbles: true, cancelable: true }));

    expect(handleClick).toHaveBeenCalledOnce();
    worker.cleanup();
  });

  it("replaces event handlers on update", () => {
    const worker = createWorkerDOM();
    const oldHandler = vi.fn();
    const newHandler = vi.fn();

    render(h("button", { onClick: oldHandler }, "Save"), worker.root);
    render(h("button", { onClick: newHandler }, "Save"), worker.root);
    const button = worker.root.firstChild as Element;
    button.dispatchEvent(new DomEvent("click", { bubbles: true, cancelable: true }));

    expect(oldHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledOnce();
    worker.cleanup();
  });

  it("removes event handlers on update", () => {
    const worker = createWorkerDOM();
    const handleClick = vi.fn();

    render(h("button", { onClick: handleClick }, "Save"), worker.root);
    render(h("button", null, "Save"), worker.root);
    const button = worker.root.firstChild as Element;
    button.dispatchEvent(new DomEvent("click", { bubbles: true, cancelable: true }));

    expect(handleClick).not.toHaveBeenCalled();
    worker.cleanup();
  });

  it("bubbles events to Preact handlers on ancestor elements", () => {
    const worker = createWorkerDOM();
    const handleClick = vi.fn();

    render(h("div", { onClick: handleClick }, h("button", null, "Save")), worker.root);
    const button = worker.root.firstChild?.firstChild as Element;
    button.dispatchEvent(new DomEvent("click", { bubbles: true, cancelable: true }));

    expect(handleClick).toHaveBeenCalledOnce();
    worker.cleanup();
  });
});
