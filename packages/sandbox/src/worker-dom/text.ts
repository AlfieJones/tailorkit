import { NodeType } from "./types.js";
import { emitMutation } from "./mutation.js";
import { Node } from "./node.js";

export class Text extends Node {
  #data: string;

  constructor(text: string) {
    super(NodeType.TEXT);
    this.#data = text;
  }

  get data(): string {
    return this.#data;
  }

  set data(text: string) {
    this.#data = String(text);
    emitMutation(this, { type: "setText", node: this, value: this.#data });
  }

  get nodeValue(): string {
    return this.#data;
  }

  set nodeValue(text: string) {
    this.data = text;
  }

  get textContent(): string {
    return this.#data;
  }

  set textContent(text: string) {
    this.data = text;
  }
}
