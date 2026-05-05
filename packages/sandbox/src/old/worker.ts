import {
  HostToWorkerMessageSchema,
  createRemoteComponentType,
  getRemoteComponentName,
  remoteComponentErrorProp,
  remoteComponentSlotsProp,
  tailorkitSlotType,
} from "@tailorkit/core/remote";
import type {
  HostToWorkerMessage,
  RemoteElementNode,
  RemoteEventBinding,
  RemoteEventName,
  RemoteFragmentNode,
  RemoteHostEvent,
  RemoteNode,
  RemoteProps,
  RemoteTextNode,
  WorkerToHostMessage,
  WorkerUiMountOptions,
} from "@tailorkit/core/remote";
import { Window } from "happy-dom";
import { Fragment, h, options, render } from "preact";
import type { ComponentChild, ComponentChildren, VNode } from "preact";

export const TAILORKIT_SLOT_TYPE = tailorkitSlotType;

type RemoteCallable = (...args: never[]) => unknown;
type EventHandler = (event: RemoteHostEvent) => void;
type RemoteComponent<TProps> = (props: TProps) => ComponentChild;
export type SlotComponent = (props: { children?: ComponentChildren }) => ComponentChild;
export type WorkerPreactApp = (options: WorkerUiMountOptions) => ComponentChild;

type RemoteSlotComponents<TSlots extends readonly string[]> = {
  [TSlot in Exclude<TSlots[number], "default"> as Capitalize<TSlot>]: SlotComponent;
};

interface CreateRemoteComponentOptions<TSlots extends readonly string[]> {
  slots?: TSlots;
}

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
  ref?: unknown;
  type?: unknown;
}

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

const blockedPropertyNames = new Set(["__proto__", "constructor", "prototype", "innerHTML"]);
const allowedDocumentProperties = new Set<PropertyKey>([
  "createElement",
  "createElementNS",
  "createTextNode",
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

const toSlotPropertyName = (name: string): string =>
  `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;

export const createSlotComponent = (owner: string, name: string): SlotComponent => {
  const Slot = ({ children }: { children?: ComponentChildren }) =>
    h(
      TAILORKIT_SLOT_TYPE,
      {
        name,
        owner,
      },
      children,
    );

  return Slot;
};

export function createRemoteComponent<TProps extends object = Record<string, never>>(
  name: string,
): RemoteComponent<TProps>;
export function createRemoteComponent<
  TProps extends object = Record<string, never>,
  const TSlots extends readonly string[] = readonly string[],
>(
  name: string,
  options: CreateRemoteComponentOptions<TSlots>,
): RemoteComponent<TProps & { children?: ComponentChildren }> & RemoteSlotComponents<TSlots>;
export function createRemoteComponent<
  TProps extends object = Record<string, never>,
  const TSlots extends readonly string[] = readonly string[],
>(
  name: string,
  options: CreateRemoteComponentOptions<TSlots> = {},
): RemoteComponent<TProps & { children?: ComponentChildren }> &
  Partial<RemoteSlotComponents<TSlots>> {
  const componentType = createRemoteComponentType(name);
  const Root: RemoteComponent<TProps & { children?: ComponentChildren }> = (props) => {
    const { children, ...remoteProps } = props;
    return h(
      componentType,
      {
        ...remoteProps,
        ...(options.slots && { [remoteComponentSlotsProp]: options.slots }),
      },
      children,
    );
  };

  const slots: Record<string, SlotComponent> = {};
  for (const slot of options.slots ?? []) {
    if (slot !== "default") {
      slots[toSlotPropertyName(slot)] = createSlotComponent(name, slot);
    }
  }

  return Object.assign(Root, slots) as RemoteComponent<TProps & { children?: ComponentChildren }> &
    Partial<RemoteSlotComponents<TSlots>>;
}

interface RemoteDomMetadata {
  id: string;
  props: Map<string, unknown>;
}

const metadataByNode = new WeakMap<object, RemoteDomMetadata>();

const getMetadata = (node: object): RemoteDomMetadata => {
  let metadata = metadataByNode.get(node);
  if (metadata === undefined) {
    metadata = {
      id: createNodeId(),
      props: new Map(),
    };
    metadataByNode.set(node, metadata);
  }
  return metadata;
};

const setProp = (node: object, name: string, value: unknown): void => {
  if (blockedPropertyNames.has(name)) {
    throw new Error(`Cannot set unsafe prop "${name}".`);
  }
  getMetadata(node).props.set(name, value);
};

const prepareNode = <TNode extends object>(node: TNode): TNode => {
  Object.defineProperty(node, "setAttribute", {
    configurable: true,
    value(name: string, value: unknown) {
      setProp(node, name, value);
    },
  });
  Object.defineProperty(node, "removeAttribute", {
    configurable: true,
    value(name: string) {
      getMetadata(node).props.delete(name);
    },
  });
  Object.defineProperty(node, "innerHTML", {
    configurable: true,
    get() {
      throw new Error("innerHTML is not available in TailorKit workers.");
    },
    set() {
      throw new Error("innerHTML is not available in TailorKit workers.");
    },
  });
  return node;
};

const createRemoteDocument = (): Document => {
  const window = new Window();
  const document = window.document;
  const createElement = document.createElement.bind(document);
  const createElementNS = document.createElementNS.bind(document);
  const createTextNode = document.createTextNode.bind(document);

  return new Proxy(document, {
    get(target, property, receiver) {
      if (property === "createElement") {
        return (name: string) => prepareNode(createElement(name));
      }
      if (property === "createElementNS") {
        return (namespace: string, name: string) => prepareNode(createElementNS(namespace, name));
      }
      if (property === "createTextNode") {
        return (text: string) => prepareNode(createTextNode(text));
      }
      if (!allowedDocumentProperties.has(property)) {
        throw new Error(`document.${String(property)} is not available in TailorKit workers.`);
      }
      return Reflect.get(target, property, receiver);
    },
  }) as unknown as Document;
};

const installWorkerDocument = (): void => {
  const document = createRemoteDocument();
  try {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: document,
      writable: true,
    });
  } catch {
    Object.defineProperty(Object.getPrototypeOf(globalThis), "document", {
      configurable: true,
      get: () => document,
    });
  }
};

const readProps = (
  element: Element,
  registerHandler: (handler: RemoteCallable) => string,
): RemoteProps => {
  const props: RemoteProps = {};
  for (const [key, value] of getMetadata(element).props) {
    if (key !== remoteComponentSlotsProp && key !== remoteComponentErrorProp) {
      props[key] =
        typeof value === "function"
          ? {
              handlerId: registerHandler(value as RemoteCallable),
              kind: "function",
            }
          : value;
    }
  }
  return props;
};

const readStringProp = (element: Element, name: string): string | null => {
  const value = getMetadata(element).props.get(name);
  return typeof value === "string" ? value : null;
};

const readStringArrayProp = (element: Element, name: string): string[] => {
  const value = getMetadata(element).props.get(name);
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
};

const readPreactListeners = (node: Element): ListenerRecord[] => {
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
    if (eventNames.has(name as RemoteEventName)) {
      records.push({
        capture,
        handler,
        name: name as RemoteEventName,
      });
    }
  }
  return records;
};

const isWhitespaceTextNode = (node: Node): boolean =>
  node.nodeType === 3 && (node.textContent ?? "").trim().length === 0;

const isOwnedSlotNode = (node: Node, componentName: string | null): node is Element =>
  componentName !== null &&
  node.nodeType === 1 &&
  (node as Element).localName === TAILORKIT_SLOT_TYPE &&
  readStringProp(node as Element, "owner") === componentName;

const appendSlotChildren = (
  slots: Record<string, RemoteNode[]>,
  name: string,
  nodes: RemoteNode[],
): void => {
  slots[name] ??= [];
  slots[name].push(...nodes);
};

const serializeElementChildren = (
  node: Element,
  componentName: string,
  registerHandler: (handler: RemoteCallable) => string,
): { children: RemoteNode[]; error: string | null; slots: Record<string, RemoteNode[]> } => {
  const declaredSlots = readStringArrayProp(node, remoteComponentSlotsProp);
  const declaredSlotSet = new Set(declaredSlots);
  const acceptsDefaultSlot = declaredSlotSet.has("default");
  const children: RemoteNode[] = [];
  const slots: Record<string, RemoteNode[]> = {};
  let error: string | null = null;

  for (const child of node.childNodes) {
    if (!isOwnedSlotNode(child, componentName)) {
      if (declaredSlots.length > 0 && !acceptsDefaultSlot && isWhitespaceTextNode(child)) {
        continue;
      }
      const serializedChild = serializeWorkerNode(child, registerHandler);
      if (acceptsDefaultSlot) {
        appendSlotChildren(slots, "default", [serializedChild]);
      } else {
        children.push(serializedChild);
      }
      continue;
    }

    const slotName = readStringProp(child, "name");
    if (slotName !== null && declaredSlotSet.has(slotName) && slotName !== "default") {
      appendSlotChildren(
        slots,
        slotName,
        [...child.childNodes].map((slotChild) => serializeWorkerNode(slotChild, registerHandler)),
      );
      continue;
    }

    error ??= `Unknown slot <${componentName}.${toSlotPropertyName(slotName ?? "Slot")}>.`;
  }

  if (declaredSlots.length > 0 && !acceptsDefaultSlot && children.length > 0) {
    error ??= `<${componentName}> does not accept default children. Use one of its named slots instead.`;
  }

  return { children, error, slots };
};

const serializeWorkerNode = (
  node: Node,
  registerHandler: (handler: RemoteCallable) => string,
): RemoteNode => {
  if (node.nodeType === 3) {
    return {
      id: getMetadata(node).id,
      kind: "text",
      text: node.textContent ?? "",
    } satisfies RemoteTextNode;
  }

  if (node.nodeType !== 1) {
    throw new Error(`Unsupported worker node type "${node.nodeType}".`);
  }

  const element = node as Element;
  const componentName = getRemoteComponentName(element.localName);
  if (componentName === null) {
    if (element.localName === TAILORKIT_SLOT_TYPE) {
      throw new Error("<Slot> must be a direct child of its owner component.");
    }
    throw new Error(
      `Native HTML element "${element.localName}" is not supported. Use remote components instead.`,
    );
  }

  const events: RemoteEventBinding[] = [];
  for (const listener of readPreactListeners(element)) {
    events.push({
      capture: listener.capture || undefined,
      event: listener.name,
      handlerId: registerHandler(listener.handler as RemoteCallable),
    });
  }

  const { children, error, slots } = serializeElementChildren(
    element,
    componentName,
    registerHandler,
  );

  return {
    children,
    events: events.length > 0 ? events : undefined,
    id: getMetadata(element).id,
    kind: "element",
    props: {
      ...readProps(element, registerHandler),
      ...(error && { [remoteComponentErrorProp]: error }),
    },
    slots: Object.keys(slots).length > 0 ? slots : undefined,
    type: element.localName,
  } satisfies RemoteElementNode;
};

const serializeRoot = (
  root: Element,
  registerHandler: (handler: RemoteCallable) => string,
): RemoteFragmentNode => ({
  children: [...root.childNodes].map((child) => serializeWorkerNode(child, registerHandler)),
  id: getMetadata(root).id,
  kind: "fragment",
});

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? error.message) : String(error);

export const createWorkerPreactRuntime = (
  app: WorkerPreactApp,
  postMessage: (message: WorkerToHostMessage) => void,
) => {
  installWorkerDocument();

  const root = document.createElement("tailorkit-root");
  const handlers = new Map<string, RemoteCallable>();
  const handlerIds = new WeakMap<RemoteCallable, string>();
  let mountOptions: WorkerUiMountOptions = {};
  let mounted = false;
  let revision = 0;
  let flushQueued = false;

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

  const postError = (error: unknown): void => {
    postMessage({
      message: toErrorMessage(error),
      type: "error",
    });
  };

  const flushSnapshot = (): void => {
    flushQueued = false;
    if (!mounted) {
      return;
    }
    try {
      revision += 1;
      postMessage({
        revision,
        tree: serializeRoot(root, registerHandler),
        type: "snapshot",
      });
    } catch (error) {
      postError(error);
    }
  };

  const scheduleSnapshot = (): void => {
    if (flushQueued) {
      return;
    }
    flushQueued = true;
    queueMicrotask(flushSnapshot);
  };

  options.debounceRendering = queueMicrotask;
  const previousDiffed = options.diffed;
  options.diffed = (vnode) => {
    previousDiffed?.(vnode);
    const privateVNode = vnode as PreactPrivateVNode;
    if (
      typeof privateVNode.type === "string" &&
      getRemoteComponentName(privateVNode.type) !== null &&
      typeof privateVNode.__e === "object" &&
      privateVNode.__e !== null
    ) {
      for (const [name, value] of Object.entries(privateVNode.props ?? {})) {
        if (name !== "children" && name !== "ref") {
          setProp(privateVNode.__e as Node, name, value);
        }
      }
    }
    scheduleSnapshot();
  };

  const previousVNode = options.vnode;
  options.vnode = (vnode) => {
    const privateVNode = vnode as PreactPrivateVNode;
    if (
      typeof privateVNode.type === "string" &&
      getRemoteComponentName(privateVNode.type) !== null
    ) {
      privateVNode.ref = undefined;
    }
    previousVNode?.(vnode);
  };

  const mount = (options: WorkerUiMountOptions = {}): void => {
    mountOptions = options;
    mounted = true;
    render(app(mountOptions) as VNode, root);
    scheduleSnapshot();
  };

  const unmount = (): void => {
    mounted = false;
    render(null, root);
  };

  const callFunction = async (id: string, handlerId: string, args: unknown[]): Promise<void> => {
    const handler = handlers.get(handlerId);
    if (handler === undefined) {
      postError(new Error(`Unknown handler "${handlerId}".`));
      return;
    }
    try {
      const result = await handler(...(args as never[]));
      postMessage({
        id,
        result,
        type: "call-result",
      });
      scheduleSnapshot();
    } catch (error) {
      postError(error);
    }
  };

  const dispatchEvent = async (handlerId: string, event: RemoteHostEvent): Promise<void> => {
    await callFunction(`event:${handlerId}`, handlerId, [event]);
  };

  return {
    callFunction,
    dispatchEvent,
    mount,
    registerFunction: registerHandler,
    unmount,
  };
};

export type WorkerPreactRuntime = ReturnType<typeof createWorkerPreactRuntime>;

export const exposePreactWorker = (
  port: Pick<MessagePort, "addEventListener" | "postMessage" | "start">,
  app: WorkerPreactApp,
): WorkerPreactRuntime => {
  const runtime = createWorkerPreactRuntime(app, (message) => {
    port.postMessage(message);
  });

  port.addEventListener("message", (event: MessageEvent<unknown>) => {
    const result = HostToWorkerMessageSchema.safeParse(event.data);
    if (!result.success) {
      port.postMessage({
        message: `Invalid host message: ${result.error.message}`,
        type: "error",
      } satisfies WorkerToHostMessage);
      return;
    }

    const message: HostToWorkerMessage = result.data;
    if (message.type === "mount") {
      runtime.mount(message.options);
      return;
    }
    if (message.type === "unmount") {
      runtime.unmount();
      return;
    }
    if (message.type === "event") {
      void runtime.dispatchEvent(message.handlerId, message.event);
      return;
    }
    void runtime.callFunction(message.id, message.handlerId, message.args);
  });

  port.start?.();
  port.postMessage({ type: "ready" } satisfies WorkerToHostMessage);
  return runtime;
};

export { Fragment };
export type { ComponentChild, RemoteHostEvent, WorkerUiMountOptions };
