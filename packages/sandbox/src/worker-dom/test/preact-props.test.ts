import { h, render } from "preact";
import { describe, expect, it } from "vitest";
import type { Element } from "../element.js";
import { createWorkerDOM } from "../index.js";

describe("Preact props", () => {
  it("updates className through the class attribute", () => {
    const worker = createWorkerDOM();

    render(h("div", { className: "before" }), worker.root);
    render(h("div", { className: "after" }), worker.root);

    expect(worker.html()).toBe('<div id="root"><div class="after"></div></div>');
    worker.cleanup();
  });

  it("removes attributes when props become null", () => {
    const worker = createWorkerDOM();

    render(h("button", { "aria-label": "Save" }), worker.root);
    render(h("button", { "aria-label": null }), worker.root);

    expect(worker.html()).toBe('<div id="root"><button></button></div>');
    worker.cleanup();
  });

  it("stringifies data and aria false values like Preact expects", () => {
    const worker = createWorkerDOM();

    render(h("button", { "aria-expanded": false, "data-active": false }), worker.root);

    expect(worker.html()).toBe(
      '<div id="root"><button aria-expanded="false" data-active="false"></button></div>',
    );
    worker.cleanup();
  });

  it("sets controlled input value and checked properties", () => {
    const worker = createWorkerDOM();

    render(h("input", { checked: true, value: "hello" }), worker.root);
    const input = worker.root.firstChild as Element;

    expect(input.checked).toBe(true);
    expect(input.value).toBe("hello");
    worker.cleanup();
  });

  it("updates controlled input value and checked properties", () => {
    const worker = createWorkerDOM();

    render(h("input", { checked: true, value: "hello" }), worker.root);
    render(h("input", { checked: false, value: "bye" }), worker.root);
    const input = worker.root.firstChild as Element;

    expect(input.checked).toBe(false);
    expect(input.value).toBe("bye");
    worker.cleanup();
  });
});
