export const NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  COMMENT: 8,
  DOCUMENT: 9,
} as const;

export interface Attribute {
  ns: string | null;
  name: string;
  value: string;
}

export interface DomEventLike {
  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  detail?: unknown[];
  _stop: boolean;
  _end: boolean;
  target: unknown;
  currentTarget: unknown;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
  preventDefault(): void;
}

// eslint-disable-next-line typescript-eslint/no-invalid-void-type
export type EventHandler = (event: DomEventLike) => boolean | void;
