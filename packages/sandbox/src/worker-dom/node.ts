import type { MutationHandler } from "./mutation.js";
import { emitMutation } from "./mutation.js";
import { NodeType } from "./types.js";

const FIXED_NODE_NAMES: Partial<Record<number, string>> = {
  [NodeType.TEXT]: "#text",
  [NodeType.CDATA_SECTION]: "#cdata-section",
  [NodeType.COMMENT]: "#comment",
  [NodeType.DOCUMENT]: "#document",
};

export class Node {
  nodeType: number;
  nodeName: string;
  childNodes: Node[];
  parentNode: Node | null = null;
  ownerDocument: Node | null = null;
  __onMutation: MutationHandler | null = null;

  constructor(nodeType: number, nodeName?: string) {
    this.nodeType = nodeType;
    this.nodeName = nodeName ?? FIXED_NODE_NAMES[nodeType] ?? "";
    this.childNodes = [];
  }

  get nextSibling(): Node | null {
    const p = this.parentNode;
    if (p) {
      return p.childNodes[p.childNodes.indexOf(this) + 1] ?? null;
    }
    return null;
  }

  get previousSibling(): Node | null {
    const p = this.parentNode;
    if (p) {
      return p.childNodes[p.childNodes.indexOf(this) - 1] ?? null;
    }
    return null;
  }

  get firstChild(): Node | null {
    return this.childNodes[0] ?? null;
  }

  get lastChild(): Node | null {
    return this.childNodes.at(-1) ?? null;
  }

  appendChild(child: unknown): Node {
    const node = assertNode(child);
    this.insertBefore(node);
    return node;
  }

  append(...nodes: Node[]): void {
    for (const node of nodes) {
      this.insertBefore(node);
    }
  }

  contains(node: unknown): boolean {
    let current = node instanceof Node ? node : null;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  insertBefore(child: unknown, ref?: unknown): Node {
    const node = assertNode(child);
    const referenceNode = ref === null || ref === undefined ? null : assertNode(ref);
    if (node === referenceNode) {
      return node;
    }
    const refIndex = referenceNode ? this.childNodes.indexOf(referenceNode) : -1;
    if (referenceNode && refIndex === -1) {
      throw new Error("Reference node is not a child of this node.");
    }
    if (node === this) {
      throw new Error("A node cannot be inserted before itself.");
    }
    node.remove();
    node.parentNode = this;
    node.ownerDocument = this.ownerDocument;
    if (referenceNode) {
      this.childNodes.splice(refIndex, 0, node);
    } else {
      this.childNodes.push(node);
    }
    emitMutation(this, { type: "insert", parent: this, child: node, before: referenceNode });
    return node;
  }

  replaceChild(child: Node, ref: Node): Node | undefined {
    if (ref.parentNode === this) {
      this.insertBefore(child, ref);
      ref.remove();
      return ref;
    }
  }

  removeChild(child: unknown): Node {
    const node = assertNode(child);
    const index = this.childNodes.indexOf(node);
    if (index === -1) {
      throw new Error("Node is not a child of this node.");
    }
    emitMutation(this, { type: "remove", parent: this, child: node });
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }

  remove(): void {
    const p = this.parentNode;
    if (p) {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      p.removeChild(this);
    }
  }
}

function assertNode(value: unknown): Node {
  if (value instanceof Node) {
    return value;
  }
  throw new Error("Expected a worker DOM Node.");
}
