import { h, render } from "preact";
import { describe, expect, it } from "vitest";
import { createWorkerDOM } from "../index.js";

describe("Preact styles", () => {
  it("applies object styles through the style declaration", () => {
    const worker = createWorkerDOM();

    render(h("div", { style: { marginTop: 4, opacity: 0.5 } }), worker.root);

    expect(worker.html()).toBe(
      '<div id="root"><div style="margin-top: 4px; opacity: 0.5;"></div></div>',
    );
    worker.cleanup();
  });

  it("removes object style properties that disappear on update", () => {
    const worker = createWorkerDOM();

    render(h("div", { style: { color: "red", marginTop: 4 } }), worker.root);
    render(h("div", { style: { color: "blue" } }), worker.root);

    expect(worker.html()).toBe('<div id="root"><div style="color: blue;"></div></div>');
    worker.cleanup();
  });

  it("switches from string styles to object styles", () => {
    const worker = createWorkerDOM();

    render(h("div", { style: "color: red; margin-top: 4px;" }), worker.root);
    render(h("div", { style: { color: "green" } }), worker.root);

    expect(worker.html()).toBe('<div id="root"><div style="color: green;"></div></div>');
    worker.cleanup();
  });
});
