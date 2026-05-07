import { describe, expect, it } from "vitest";
import { createDocument } from "../worker-dom/document.js";
import { mutationToPatch, serializeNode } from "./serialize.js";

describe("serializeNode", () => {
  it("serializes callback bindings from TailorKit callback metadata", () => {
    const document = createDocument();
    const element = document.createElement("tailorkit-tabs");
    element.dataset.tailorkitCallbacks = JSON.stringify({
      tailorkitcallbackonvaluechange: { callback: "onValueChange", inputCount: 1 },
    });
    element.addEventListener("tailorkitcallbackonvaluechange", () => {});

    expect(serializeNode(element)).toMatchObject({
      callbacks: [
        { callback: "onValueChange", inputCount: 1, event: "tailorkitcallbackonvaluechange" },
      ],
      props: {},
    });
  });
});

describe("mutationToPatch", () => {
  it("serializes listener changes as callback patches", () => {
    const document = createDocument();
    const element = document.createElement("tailorkit-button");
    element.dataset.tailorkitCallbacks = JSON.stringify({
      tailorkitcallbackonclick: { callback: "onClick", inputCount: 0 },
    });
    element.addEventListener("tailorkitcallbackonclick", () => {});

    expect(
      mutationToPatch({
        element,
        type: "setEventListeners",
      }),
    ).toMatchObject({
      callbacks: [{ callback: "onClick", inputCount: 0, event: "tailorkitcallbackonclick" }],
      op: "setCallbacks",
    });
  });

  it("supports legacy string callback metadata as zero-arg callbacks", () => {
    const document = createDocument();
    const element = document.createElement("tailorkit-button");
    element.dataset.tailorkitCallbacks = JSON.stringify({ tailorkitcallbackonclick: "onClick" });
    element.addEventListener("tailorkitcallbackonclick", () => {});

    expect(serializeNode(element)).toMatchObject({
      callbacks: [{ callback: "onClick", inputCount: 0, event: "tailorkitcallbackonclick" }],
    });
  });
});
