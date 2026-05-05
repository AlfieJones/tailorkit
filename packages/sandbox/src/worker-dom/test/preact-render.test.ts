import { h, render } from "preact";
import { describe, expect, it } from "vitest";
import { Element } from "../element.js";
import { createWorkerDOM } from "../index.js";
import { Text } from "../text.js";

describe("Preact rendering", () => {
  it("renders basic element trees into the worker DOM", () => {
    const worker = createWorkerDOM();

    render(
      h("section", { className: "panel" }, h("h1", null, "Title"), h("p", null, "Copy")),
      worker.root,
    );

    expect(worker.html()).toBe(
      '<div id="root"><section class="panel"><h1>Title</h1><p>Copy</p></section></div>',
    );
    worker.cleanup();
  });

  it("updates text nodes via the data property", () => {
    const worker = createWorkerDOM();

    render(h("span", null, "One"), worker.root);
    const text = worker.root.firstChild?.firstChild;
    expect(text).toBeInstanceOf(Text);

    render(h("span", null, "Two"), worker.root);
    expect(text).toBe(worker.root.firstChild?.firstChild);
    expect((text as Text).data).toBe("Two");
    expect(worker.html()).toBe('<div id="root"><span>Two</span></div>');
    worker.cleanup();
  });

  it("removes old child nodes when children shrink", () => {
    const worker = createWorkerDOM();

    render(h("div", null, h("span", null, "A"), h("span", null, "B")), worker.root);
    render(h("div", null, h("span", null, "A")), worker.root);

    expect(worker.html()).toBe('<div id="root"><div><span>A</span></div></div>');
    worker.cleanup();
  });

  it("reorders keyed children without recreating them", () => {
    const worker = createWorkerDOM();

    render(
      h("ul", null, [
        h("li", { key: "a" }, "A"),
        h("li", { key: "b" }, "B"),
        h("li", { key: "c" }, "C"),
      ]),
      worker.root,
    );
    const list = worker.root.firstChild as Element;
    const first = list.childNodes[0];
    const second = list.childNodes[1];

    render(
      h("ul", null, [
        h("li", { key: "b" }, "B"),
        h("li", { key: "a" }, "A"),
        h("li", { key: "c" }, "C"),
      ]),
      worker.root,
    );

    expect(list.childNodes[0]).toBe(second);
    expect(list.childNodes[1]).toBe(first);
    expect(worker.html()).toBe('<div id="root"><ul><li>B</li><li>A</li><li>C</li></ul></div>');
    worker.cleanup();
  });

  it("creates SVG elements with the SVG namespace", () => {
    const worker = createWorkerDOM();

    render(h("svg", null, h("use", { href: "#icon" })), worker.root);

    const svg = worker.root.firstChild;
    const use = svg?.firstChild;
    expect(svg).toBeInstanceOf(Element);
    expect(use).toBeInstanceOf(Element);
    expect((svg as Element).namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect((use as Element).namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(worker.html()).toBe('<div id="root"><svg><use href="#icon"></use></svg></div>');
    worker.cleanup();
  });
});
