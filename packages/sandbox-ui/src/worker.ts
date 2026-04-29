import { os } from "@orpc/server";
import { RPCHandler } from "@orpc/server/message-port";
import type { SupportedMessagePort } from "@orpc/client/message-port";
import { Fragment, options, render } from "preact";
import type { ComponentChild, VNode } from "preact";
import type {
  RemoteElementNode,
  RemoteEventBinding,
  RemoteEventName,
  RemoteFunctionCallResult,
  RemoteFragmentNode,
  RemoteHostEvent,
  RemoteNode,
  RemoteProps,
  RemoteTextNode,
  WorkerRenderResult,
} from "./protocol";
import { getRemoteComponentName } from "./protocol";
import { createRemoteFunctionSerializer } from "./serializers";
import type { RemoteCallable } from "./serializers";
export { createRemoteComponentType as createRemoteComponent } from "./protocol";

type EventHandler = (event: RemoteHostEvent) => void;

interface ListenerRecord {
  capture: boolean;
  handler: EventHandler;
  name: RemoteEventName;
}

interface PreactPrivateListeners {
  l?: Record<string, EventHandler | undefined>;
}

interface PreactPrivateVNode {
  __e?: unknown;
  props?: Record<string, unknown>;
  type?: unknown;
}

const blockedPropertyNames = new Set(["__proto__", "constructor", "prototype"]);
const eventNames = new Set<RemoteEventName>([
  "blur",
  "change",
  "click",
  "focus",
  "input",
  "keydown",
  "keyup",
  "pointerdown",
  "pointerup",
  "submit",
]);

let nextNodeId = 0;
let nextHandlerId = 0;

const createNodeId = (): string => {
  nextNodeId += 1;
  return `n:${nextNodeId}`;
};

const createHandlerId = (): string => {
  nextHandlerId += 1;
  return `h:${nextHandlerId}`;
};

interface RemoteWorkerText {
  data: string;
  id: string;
  nodeType: 3;
  nodeValue: string;
  parentNode: RemoteWorkerElement | null;
  remove: () => void;
}

type RemoteWorkerNode = RemoteWorkerElement | RemoteWorkerText;

const removeExistingParent = (node: RemoteWorkerNode): void => {
  node.remove();
};

const createRemoteWorkerText = (data: string): RemoteWorkerText => {
  const text: RemoteWorkerText = {
    data,
    id: createNodeId(),
    nodeType: 3,
    nodeValue: data,
    parentNode: null,
    remove() {
      if (text.parentNode === null) {
        return;
      }
      text.parentNode.detachChild(text);
    },
  };

  Object.defineProperty(text, "nodeValue", {
    get() {
      return text.data;
    },
    set(value: string | number | null) {
      text.data = value === null ? "" : String(value);
    },
  });

  return text;
};

class RemoteWorkerElement {
  public readonly childNodes: RemoteWorkerNode[] = [];
  public readonly id = createNodeId();
  public readonly localName: string;
  public readonly nodeType = 1;
  public readonly props = new Map<string, unknown>();
  public readonly listeners = new Map<string, ListenerRecord>();
  public parentNode: RemoteWorkerElement | null = null;

  public constructor(localName: string) {
    this.localName = localName;
  }

  public appendChild<TNode extends RemoteWorkerNode>(node: TNode): TNode {
    removeExistingParent(node);
    this.childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  public append<TNode extends RemoteWorkerNode>(node: TNode): TNode {
    removeExistingParent(node);
    this.childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  public insertBefore<TNode extends RemoteWorkerNode>(
    node: TNode,
    referenceNode: RemoteWorkerNode | null,
  ): TNode {
    removeExistingParent(node);
    const index = referenceNode === null ? -1 : this.childNodes.indexOf(referenceNode);
    if (index === -1) {
      this.childNodes.push(node);
    } else {
      this.childNodes.splice(index, 0, node);
    }
    node.parentNode = this;
    return node;
  }

  public removeChild<TNode extends RemoteWorkerNode>(node: TNode): TNode {
    return this.detachChild(node);
  }

  public detachChild<TNode extends RemoteWorkerNode>(node: TNode): TNode {
    const index = this.childNodes.indexOf(node);
    if (index !== -1) {
      this.childNodes.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  public remove(): void {
    if (this.parentNode === null) {
      return;
    }
    this.parentNode.detachChild(this);
  }

  public addEventListener(name: string, handler: EventHandler, capture = false): void {
    const eventName = name.toLowerCase();
    if (!eventNames.has(eventName as RemoteEventName)) {
      return;
    }
    this.listeners.set(`${name}:${capture ? "capture" : "bubble"}`, {
      capture,
      handler,
      name: eventName as RemoteEventName,
    });
  }

  public removeEventListener(name: string, _handler: EventHandler, capture = false): void {
    this.listeners.delete(`${name}:${capture ? "capture" : "bubble"}`);
  }

  public setAttribute(name: string, value: unknown): void {
    this.setProp(name, value);
  }

  public removeAttribute(name: string): void {
    this.props.delete(name);
  }

  public setProp(name: string, value: unknown): void {
    if (blockedPropertyNames.has(name)) {
      throw new Error(`Cannot set unsafe prop "${name}".`);
    }
    this.props.set(name, value);
  }

  public get firstChild(): RemoteWorkerNode | null {
    return this.childNodes[0] ?? null;
  }

  public get nextSibling(): RemoteWorkerNode | null {
    if (this.parentNode === null) {
      return null;
    }
    const index = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[index + 1] ?? null;
  }

  public get textContent(): string {
    return this.childNodes
      .map((node) => (node.nodeType === 3 ? node.data : node.textContent))
      .join("");
  }

  public set textContent(value: string) {
    for (const child of this.childNodes) {
      child.parentNode = null;
    }
    this.childNodes.length = 0;
    if (value.length > 0) {
      this.append(createRemoteWorkerText(value));
    }
  }
}

const createRemoteWorkerElement = (name: string): RemoteWorkerElement => {
  const element = new RemoteWorkerElement(name);
  return new Proxy(element, {
    set(target, property, value, receiver) {
      if (
        typeof property !== "string" ||
        property in target ||
        property === "l" ||
        property.startsWith("_")
      ) {
        return Reflect.set(target, property, value, receiver);
      }
      target.setProp(property, value);
      return true;
    },
  });
};

const remoteDocument = {
  createElement: (name: string) => createRemoteWorkerElement(name),
  createElementNS: (_namespace: string, name: string) => createRemoteWorkerElement(name),
  createTextNode: (text: string) => createRemoteWorkerText(text),
};

const readProps = (element: RemoteWorkerElement): RemoteProps => {
  const props: RemoteProps = {};
  for (const [key, value] of element.props) {
    props[key] = value;
  }
  return props;
};

const readPreactListeners = (node: RemoteWorkerElement): ListenerRecord[] => {
  const listeners = (node as PreactPrivateListeners).l;
  if (listeners === undefined) {
    return [];
  }

  const records: ListenerRecord[] = [];
  for (const [key, handler] of Object.entries(listeners)) {
    if (handler === undefined) {
      continue;
    }
    const capture = key.endsWith("true");
    const name = key.slice(0, capture ? -"true".length : -"false".length).toLowerCase();
    if (!eventNames.has(name as RemoteEventName)) {
      continue;
    }
    records.push({
      capture,
      handler,
      name: name as RemoteEventName,
    });
  }
  return records;
};

const serializeWorkerNode = (
  node: RemoteWorkerNode,
  registerHandler: (handler: EventHandler) => string,
): RemoteNode => {
  if (node.nodeType === 3) {
    return {
      id: node.id,
      kind: "text",
      text: node.data,
    } satisfies RemoteTextNode;
  }

  const events: RemoteEventBinding[] = [];
  for (const listener of readPreactListeners(node)) {
    events.push({
      capture: listener.capture || undefined,
      event: listener.name,
      handlerId: registerHandler(listener.handler),
    });
  }

  return {
    children: node.childNodes.map((child) => serializeWorkerNode(child, registerHandler)),
    events: events.length > 0 ? events : undefined,
    id: node.id,
    kind: "element",
    props: readProps(node),
    type: node.localName,
  } satisfies RemoteElementNode;
};

const serializeRoot = (
  root: RemoteWorkerElement,
  registerHandler: (handler: EventHandler) => string,
): RemoteFragmentNode => ({
  children: root.childNodes.map((child) => serializeWorkerNode(child, registerHandler)),
  id: root.id,
  kind: "fragment",
});

const installPreactWorkerDom = (): void => {
  globalThis.document = remoteDocument as unknown as Document;
};

export const createWorkerPreactRuntime = (app: () => ComponentChild) => {
  installPreactWorkerDom();

  const root = new RemoteWorkerElement("root");
  const handlers = new Map<string, RemoteCallable>();
  const handlerIds = new WeakMap<RemoteCallable, string>();
  let revision = 0;

  options.debounceRendering = queueMicrotask;
  const previousDiffed = options.diffed;
  options.diffed = (vnode) => {
    previousDiffed?.(vnode);
    const privateVNode = vnode as PreactPrivateVNode;
    if (
      typeof privateVNode.type !== "string" ||
      getRemoteComponentName(privateVNode.type) === null ||
      typeof privateVNode.__e !== "object" ||
      privateVNode.__e === null ||
      !("setProp" in privateVNode.__e) ||
      typeof privateVNode.__e.setProp !== "function"
    ) {
      return;
    }

    for (const [name, value] of Object.entries(privateVNode.props ?? {})) {
      if (name === "children") {
        continue;
      }
      privateVNode.__e.setProp(name, value);
    }
  };

  const registerHandler = (handler: RemoteCallable): string => {
    const existingId = handlerIds.get(handler);
    if (existingId !== undefined) {
      return existingId;
    }
    const handlerId = createHandlerId();
    handlerIds.set(handler, handlerId);
    handlers.set(handlerId, handler);
    return handlerId;
  };

  const createSnapshot = (): WorkerRenderResult => {
    revision += 1;
    return {
      revision,
      tree: serializeRoot(root, registerHandler),
      type: "snapshot",
    };
  };

  const rerender = (): WorkerRenderResult => {
    render(app() as VNode, root as unknown as Element);
    return createSnapshot();
  };

  const callFunction = async (
    handlerId: string,
    args: unknown[],
  ): Promise<RemoteFunctionCallResult> => {
    const handler = handlers.get(handlerId);
    if (handler === undefined) {
      return {
        render: {
          message: `Unknown handler "${handlerId}".`,
          type: "error",
        },
        result: undefined,
      };
    }
    const result = await handler(...(args as never[]));
    return {
      render: createSnapshot(),
      result,
    };
  };

  const dispatchEvent = async (
    handlerId: string,
    event: RemoteHostEvent,
  ): Promise<WorkerRenderResult> => {
    const result = await callFunction(handlerId, [event]);
    return result.render;
  };

  return {
    callFunction,
    dispatchEvent,
    mount(): WorkerRenderResult {
      return rerender();
    },
    registerFunction: registerHandler,
    unmount(): WorkerRenderResult {
      render(null, root as unknown as Element);
      return createSnapshot();
    },
  };
};

export type WorkerPreactRuntime = ReturnType<typeof createWorkerPreactRuntime>;

const toRenderError = (error: unknown): WorkerRenderResult => ({
  message: error instanceof Error ? (error.stack ?? error.message) : String(error),
  type: "error",
});

export const createWorkerUiRouter = (runtime: WorkerPreactRuntime) => ({
  callFunction: os.handler(async ({ input }) => {
    const { args, handlerId } = input as {
      args: unknown[];
      handlerId: string;
    };
    try {
      return await runtime.callFunction(handlerId, args);
    } catch (error) {
      return {
        render: toRenderError(error),
        result: undefined,
      } satisfies RemoteFunctionCallResult;
    }
  }),
  dispatchEvent: os.handler(async ({ input }) => {
    const { event, handlerId } = input as {
      event: RemoteHostEvent;
      handlerId: string;
    };
    try {
      return await runtime.dispatchEvent(handlerId, event);
    } catch (error) {
      return toRenderError(error);
    }
  }),
  mount: os.handler(() => {
    try {
      return runtime.mount();
    } catch (error) {
      return toRenderError(error);
    }
  }),
  unmount: os.handler(() => {
    try {
      return runtime.unmount();
    } catch (error) {
      return toRenderError(error);
    }
  }),
});

export type WorkerUiRouter = ReturnType<typeof createWorkerUiRouter>;

export const upgradeWorkerUiPort = (
  port: SupportedMessagePort,
  runtime: WorkerPreactRuntime,
): void => {
  const handler = new RPCHandler(createWorkerUiRouter(runtime), {
    customJsonSerializers: [createRemoteFunctionSerializer(runtime.registerFunction)],
  });

  handler.upgrade(port, {
    context: {},
  });
};

export const exposePreactWorker = (
  port: SupportedMessagePort,
  app: () => ComponentChild,
): WorkerPreactRuntime => {
  const runtime = createWorkerPreactRuntime(app);
  upgradeWorkerUiPort(port, runtime);
  return runtime;
};

export { Fragment };
export type { RemoteHostEvent };
