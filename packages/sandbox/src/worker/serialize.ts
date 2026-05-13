import type { Element } from "../worker-dom/element.js";
import { isElement } from "../worker-dom/element.js";
import type { MutationRecord } from "../worker-dom/mutation.js";
import type { Node } from "../worker-dom/node.js";
import type { Text } from "../worker-dom/text.js";
import type { EventHandler } from "../worker-dom/types.js";
import { NodeType } from "../worker-dom/types.js";
import type {
  RemoteCallbackBinding,
  RemoteElementNode,
  RemoteNode,
  RemotePatch,
} from "../protocol.js";

const nodeIds = new WeakMap<Node, string>();
let nextNodeId = 1;

export function getRemoteNodeId(node: Node): string {
  let id = nodeIds.get(node);
  if (!id) {
    id = `n:${nextNodeId}`;
    nextNodeId += 1;
    nodeIds.set(node, id);
  }
  return id;
}

export function serializeNode(node: Node): RemoteNode {
  if (node.nodeType === NodeType.TEXT) {
    return {
      id: getRemoteNodeId(node),
      kind: "text",
      text: (node as Text).data,
    };
  }
  if (isElement(node)) {
    return serializeElement(node);
  }
  return {
    children: node.childNodes.map(serializeNode),
    id: getRemoteNodeId(node),
    kind: "fragment",
  };
}

export function serializeRoot(root: Node): RemoteNode {
  return {
    children: root.childNodes.map(serializeNode),
    id: getRemoteNodeId(root),
    kind: "fragment",
  };
}

export function mutationToPatch(record: MutationRecord): RemotePatch {
  switch (record.type) {
    case "insert": {
      return {
        beforeId: record.before ? getRemoteNodeId(record.before) : undefined,
        node: serializeNode(record.child),
        op: "insert",
        parentId: getRemoteNodeId(record.parent),
      };
    }
    case "remove": {
      return {
        nodeId: getRemoteNodeId(record.child),
        op: "remove",
      };
    }
    case "setAttribute": {
      return {
        name: record.name,
        nodeId: getRemoteNodeId(record.element),
        op: "setProp",
        value: record.value,
      };
    }
    case "removeAttribute": {
      return {
        name: record.name,
        nodeId: getRemoteNodeId(record.element),
        op: "removeProp",
      };
    }
    case "setText": {
      return {
        nodeId: getRemoteNodeId(record.node),
        op: "setText",
        text: record.value,
      };
    }
    case "setProperty": {
      return {
        name: record.name,
        nodeId: getRemoteNodeId(record.element),
        op: "setProp",
        value: record.value,
      };
    }
    case "setEventListeners": {
      return {
        callbacks: readCallbacks(record.element),
        nodeId: getRemoteNodeId(record.element),
        op: "setCallbacks",
      };
    }
    default: {
      throw new Error(`Unsupported mutation record: ${JSON.stringify(record)}`);
    }
  }
}

export function findElementByRemoteId(root: Node, nodeId: string): Element | null {
  if (getRemoteNodeId(root) === nodeId && isElement(root)) {
    return root;
  }
  for (const child of root.childNodes) {
    const match = findElementByRemoteId(child, nodeId);
    if (match) {
      return match;
    }
  }
  return null;
}

function serializeElement(element: Element): RemoteElementNode {
  return {
    children: element.childNodes.map(serializeNode),
    callbacks: readCallbacks(element),
    id: getRemoteNodeId(element),
    kind: "element",
    props: readProps(element),
    type: element.localName,
  };
}

function readCallbacks(element: Element): RemoteCallbackBinding[] {
  const callbackMap = readCallbackMap(element);
  const callbacks: RemoteCallbackBinding[] = [];
  for (const [event, handlers] of Object.entries(element.__handlers)) {
    const binding = callbackMap[event];
    if (handlers.length === 0 || binding === undefined) {
      continue;
    }
    callbacks.push({ ...binding, event });
  }
  return callbacks;
}

function readCallbackMap(
  element: Element,
): Record<string, { callback: string; inputCount: number }> {
  const attribute = element.attributes.find(
    ({ name }) => name.toLowerCase() === "data-tailorkit-callbacks",
  );
  if (attribute === undefined) {
    return {};
  }

  try {
    const value = JSON.parse(attribute.value) as unknown;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(Object.entries(value).flatMap(toCallbackMapEntry));
  } catch {
    return {};
  }
}

function toCallbackMapEntry(
  entry: [string, unknown],
): [string, { callback: string; inputCount: number }][] {
  const [event, config] = entry;

  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    return [];
  }

  const callback = (config as { callback?: unknown }).callback;
  const inputCount = (config as { inputCount?: unknown }).inputCount;
  if (typeof callback !== "string" || typeof inputCount !== "number") {
    return [];
  }

  return [[event, { callback, inputCount }]];
}

function readProps(element: Element): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const attribute of element.attributes) {
    if (attribute.name.toLowerCase() === "data-tailorkit-callbacks") {
      continue;
    }
    props[attribute.name] = attribute.value;
  }
  return props;
}

export type { EventHandler };
