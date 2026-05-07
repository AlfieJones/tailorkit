import { h, render } from "preact";
import { describe, expect, it } from "vitest";
import { createWorkerDOM } from "../index.js";

describe("Preact props", () => {
  it("removes attributes when props become null", () => {
    const worker = createWorkerDOM();

    render(h("tailorkit-button", { "aria-label": "Save" }), worker.root);
    render(h("tailorkit-button", { "aria-label": null }), worker.root);

    expect(worker.html()).toBe('<div id="root"><tailorkit-button></tailorkit-button></div>');
    worker.cleanup();
  });

  it("stringifies data and aria false values like Preact expects", () => {
    const worker = createWorkerDOM();

    render(h("tailorkit-button", { "aria-expanded": false, "data-active": false }), worker.root);

    expect(worker.html()).toBe(
      '<div id="root"><tailorkit-button aria-expanded="false" data-active="false"></tailorkit-button></div>',
    );
    worker.cleanup();
  });
});
