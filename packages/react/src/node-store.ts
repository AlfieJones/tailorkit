import type { RemoteElementNode, RemoteNode } from "@tailorkit/sandbox-ui/protocol";

type Listener = () => void;

const childIds = (children: RemoteNode[]): string => children.map((c) => c.id).join(",");

const slotIds = (slots: RemoteElementNode["slots"]): string => {
  if (!slots) {
    return "";
  }
  return Object.entries(slots)
    .toSorted(([a]: [string, RemoteNode[]], [b]: [string, RemoteNode[]]) => a.localeCompare(b))
    .map(([name, nodes]: [string, RemoteNode[]]) => `${name}:${nodes.map((n) => n.id).join(",")}`)
    .join("|");
};

const nodeSignature = (node: RemoteNode): string => {
  if (node.kind === "text") {
    return `text:${node.text}`;
  }
  if (node.kind === "fragment") {
    return `frag:${childIds(node.children)}`;
  }
  // For elements: type + key + child IDs + slot IDs + serialized props + event handler IDs
  const propsStr = JSON.stringify(node.props);
  const eventsStr = (node.events ?? []).map((e) => `${e.event}:${e.handlerId}`).join(",");
  return `elem:${node.type}|${String(node.key ?? "")}|${childIds(node.children)}|${slotIds(node.slots)}|${propsStr}|${eventsStr}`;
};

const flattenTree = (node: RemoteNode, out: Map<string, RemoteNode>): void => {
  out.set(node.id, node);
  if (node.kind === "text") {
    return;
  }
  for (const child of node.children) {
    flattenTree(child, out);
  }
  if (node.kind === "element" && node.slots) {
    for (const slotNodes of Object.values(node.slots)) {
      for (const child of slotNodes) {
        flattenTree(child, out);
      }
    }
  }
};

export class NodeStore {
  private nodes = new Map<string, RemoteNode>();
  private signatures = new Map<string, string>();
  private nodeListeners = new Map<string, Set<Listener>>();
  private rootListeners = new Set<Listener>();
  private rootId: string | null = null;

  setSnapshot(tree: RemoteNode): void {
    const next = new Map<string, RemoteNode>();
    flattenTree(tree, next);

    const changed = new Set<string>();

    for (const [id, node] of next) {
      const sig = nodeSignature(node);
      if (this.signatures.get(id) !== sig) {
        changed.add(id);
        this.signatures.set(id, sig);
      }
    }

    // Remove stale entries
    for (const id of this.signatures.keys()) {
      if (!next.has(id)) {
        this.signatures.delete(id);
      }
    }

    this.nodes = next;

    const prevRootId = this.rootId;
    this.rootId = tree.id;

    for (const id of changed) {
      const subs = this.nodeListeners.get(id);
      if (subs) {
        for (const l of subs) {
          l();
        }
      }
    }

    if (prevRootId !== this.rootId) {
      for (const l of this.rootListeners) {
        l();
      }
    }
  }

  getRootId(): string | null {
    return this.rootId;
  }

  getNode(id: string): RemoteNode | null {
    return this.nodes.get(id) ?? null;
  }

  subscribe(id: string, listener: Listener): () => void {
    let subs = this.nodeListeners.get(id);
    if (!subs) {
      subs = new Set();
      this.nodeListeners.set(id, subs);
    }
    subs.add(listener);
    return () => {
      subs!.delete(listener);
      if (subs!.size === 0) {
        this.nodeListeners.delete(id);
      }
    };
  }

  subscribeRoot(listener: Listener): () => void {
    this.rootListeners.add(listener);
    return () => this.rootListeners.delete(listener);
  }
}
