import type { Element } from "../worker-dom/element.js";
import { isElement } from "../worker-dom/element.js";
import type { MutationRecord } from "../worker-dom/mutation.js";
import type { Node } from "../worker-dom/node.js";
import type { Text } from "../worker-dom/text.js";
import type { EventHandler } from "../worker-dom/types.js";
import { NodeType } from "../worker-dom/types.js";
import type {
  RemoteElementNode,
  RemoteEventBinding,
  RemoteEventName,
  RemoteNode,
  RemotePatch,
} from "../protocol.js";
import { RemoteEventNameSchema } from "../protocol.js";

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
        events: readEvents(record.element),
        nodeId: getRemoteNodeId(record.element),
        op: "setEvents",
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
    events: readEvents(element),
    id: getRemoteNodeId(element),
    kind: "element",
    props: readProps(element),
    type: element.localName,
  };
}

function readEvents(element: Element): RemoteEventBinding[] {
  const events: RemoteEventBinding[] = [];
  for (const [event, handlers] of Object.entries(element.__handlers)) {
    if (handlers.length === 0 || !RemoteEventNameSchema.safeParse(event).success) {
      continue;
    }
    events.push({ event: event as RemoteEventName });
  }
  return events;
}

function readProps(element: Element): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const attribute of element.attributes) {
    props[attribute.name] = attribute.value;
  }
  if (element.checked) {
    props.checked = element.checked;
  }
  if (element.value) {
    props.value = element.value;
  }
  return props;
}

export type { EventHandler };
