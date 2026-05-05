import type { DomEventLike } from "./types.js";

export class DomEvent implements DomEventLike {
  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented = false;
  _stop = false;
  _end = false;
  target: unknown = null;
  currentTarget: unknown = null;

  constructor(type: string, opts?: { bubbles?: boolean; cancelable?: boolean }) {
    this.type = type;
    this.bubbles = !!opts?.bubbles;
    this.cancelable = !!opts?.cancelable;
  }

  stopPropagation(): void {
    this._stop = true;
  }

  stopImmediatePropagation(): void {
    this._end = true;
    this._stop = true;
  }

  preventDefault(): void {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }
}
