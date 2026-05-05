import {
  WorkerToHostMessageSchema,
  getRemoteComponentName,
  remoteComponentErrorProp,
} from "@tailorkit/core/remote";
import type {
  HostToWorkerMessage,
  RemoteElementNode,
  RemoteEventBinding,
  RemoteFunctionRef,
  RemoteHostEvent,
  RemoteNode,
  RemoteSlots,
  WorkerToHostMessage,
  WorkerUiMountOptions,
} from "@tailorkit/core/remote";
import type { ResolvedComponentMetadata } from "@tailorkit/core/schema";

type CreateElement<TRenderedNode> = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: TRenderedNode[]
) => TRenderedNode;

export interface HostRenderer<TRenderedNode> {
  renderElement(
    node: RemoteElementNode,
    children: TRenderedNode[],
    slots: Record<string, TRenderedNode[]> | undefined,
  ): TRenderedNode;
  renderFragment(children: TRenderedNode[]): TRenderedNode;
  renderText(text: string): TRenderedNode;
}

export interface RemoteUiHost<TRenderedNode> {
  getSnapshot(): RemoteNode | null;
  handleWorkerMessage(message: WorkerToHostMessage): TRenderedNode | null;
  render(): TRenderedNode | null;
}

export interface WorkerUiController {
  callFunction(handlerId: string, args: unknown[]): Promise<unknown>;
  dispatchEvent(binding: RemoteEventBinding, event: RemoteHostEvent): void;
  mount(options?: WorkerUiMountOptions): void;
  unmount(): void;
}

export interface RemoteCallbackDefinition {
  input?: readonly StandardSchema[];
  output?: StandardSchema;
}

export type RemoteCallbackDefinitions = Record<
  string,
  Record<string, RemoteCallbackDefinition | undefined> | undefined
>;

export interface ComponentValidation {
  callbacks?: Record<string, RemoteCallbackDefinition | undefined>;
  fields?: StandardSchema;
}

export type ResolveComponentValidation = (componentName: string) => ComponentValidation | undefined;
export type ComponentValidationMap = Record<string, ResolvedComponentMetadata | undefined>;

export interface StandardSchemaIssue {
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
}

export interface StandardSchemaResult {
  issues?: readonly StandardSchemaIssue[];
  value?: unknown;
}

export interface StandardSchema {
  "~standard": {
    validate(value: unknown): Promise<StandardSchemaResult> | StandardSchemaResult;
  };
}

interface HostControllerOptions {
  onError?: (error: Error) => void;
  onMessage?: (message: WorkerToHostMessage) => void;
  worker: Worker;
}

interface ReactHostRendererOptions {
  callbackDefinitions?: RemoteCallbackDefinitions;
  componentValidation?: ComponentValidationMap;
  components?: Record<string, unknown>;
  fragment: unknown;
  onEventError?: (error: Error) => void;
  resolveComponentValidation?: ResolveComponentValidation;
}

const blockedProps = new Set(["dangerouslysetinnerhtml", "innerhtml", "srcdoc", "style"]);
const remoteFunctionKind = "function";
const eventPropPattern = /^on/i;
const urlProps = new Set([
  "action",
  "background",
  "cite",
  "formaction",
  "href",
  "poster",
  "src",
  "srcset",
]);
const maximumControlCharacterCode = 32;
const deleteCharacterCode = 127;
const scriptProtocol = ["java", "script:"].join("");

const toReactEventName = (event: string): string =>
  `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;

const isRemoteFunctionRef = (value: unknown): value is RemoteFunctionRef =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  value.kind === remoteFunctionKind &&
  "handlerId" in value &&
  typeof value.handlerId === "string";

const hasRemoteFunctionRef = (value: unknown): boolean => {
  if (isRemoteFunctionRef(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(hasRemoteFunctionRef);
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).some(hasRemoteFunctionRef);
};

const isUnsafeUrl = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return (
        codePoint !== undefined &&
        codePoint > maximumControlCharacterCode &&
        codePoint !== deleteCharacterCode
      );
    })
    .join("")
    .toLowerCase();
  return normalized.startsWith(scriptProtocol) || normalized.startsWith("data:");
};

const sanitizeProps = (
  props: Record<string, unknown>,
  options: { allowFunctionRefs: boolean },
): { error: string | null; props: Record<string, unknown> } => {
  const sanitizedProps: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    const normalizedName = name.toLowerCase();
    if (blockedProps.has(normalizedName) || eventPropPattern.test(name)) {
      return {
        error: `Blocked remote prop "${name}".`,
        props: {},
      };
    }
    if (urlProps.has(normalizedName) && isUnsafeUrl(value)) {
      return {
        error: `Blocked unsafe remote URL prop "${name}".`,
        props: {},
      };
    }
    if (!options.allowFunctionRefs && hasRemoteFunctionRef(value)) {
      return {
        error: `Blocked remote function prop "${name}".`,
        props: {},
      };
    }
    sanitizedProps[name] = value;
  }
  if (sanitizedProps.target === "_blank") {
    sanitizedProps.rel =
      typeof sanitizedProps.rel === "string"
        ? `${sanitizedProps.rel} noopener noreferrer`
        : "noopener noreferrer";
  }
  return { error: null, props: sanitizedProps };
};

const createRemoteRenderError = <TRenderedNode>(
  createElement: CreateElement<TRenderedNode>,
  message: string,
): TRenderedNode =>
  createElement(
    "pre",
    {
      role: "alert",
      style: {
        background: "#fff1f0",
        border: "1px solid #ffccc7",
        borderRadius: 6,
        color: "#8a1f11",
        margin: 0,
        padding: 12,
        whiteSpace: "pre-wrap",
      },
    },
    message as TRenderedNode,
  );

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function";

const formatStandardSchemaIssues = (issues: readonly StandardSchemaIssue[]): string =>
  issues
    .map((issue) => {
      const path =
        issue.path === undefined
          ? ""
          : issue.path
              .map((segment) =>
                typeof segment === "object" ? String(segment.key) : String(segment),
              )
              .join(".");
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");

const validateStandardSchemaValue = async (
  schema: StandardSchema,
  value: unknown,
  label: string,
): Promise<unknown> => {
  const result = await schema["~standard"].validate(value);
  if (result.issues !== undefined) {
    throw new Error(`${label} failed validation: ${formatStandardSchemaIssues(result.issues)}`);
  }
  return result.value;
};

const validateStandardSchemaValueSync = (
  schema: StandardSchema,
  value: unknown,
  label: string,
): unknown => {
  const result = schema["~standard"].validate(value);
  if (isPromise(result)) {
    throw new Error(`${label} failed validation: async schemas are not supported while rendering.`);
  }
  if (result.issues !== undefined) {
    throw new Error(`${label} failed validation: ${formatStandardSchemaIssues(result.issues)}`);
  }
  return result.value;
};

const hydrateRemoteFunctions = (
  value: unknown,
  definition: RemoteCallbackDefinition | undefined,
  controller: WorkerUiController,
  onError: ((error: Error) => void) | undefined,
): unknown => {
  if (isRemoteFunctionRef(value)) {
    return async (...args: unknown[]) => {
      try {
        if (definition?.input !== undefined && args.length !== definition.input.length) {
          throw new Error(
            `Callback input failed validation: expected ${definition.input.length} arguments.`,
          );
        }
        const validatedArgs =
          definition?.input === undefined
            ? args
            : await Promise.all(
                definition.input.map((schema, index) =>
                  validateStandardSchemaValue(schema, args[index], `Callback input ${index}`),
                ),
              );
        const result = await controller.callFunction(value.handlerId, validatedArgs);
        if (definition?.output === undefined) {
          return result;
        }
        return validateStandardSchemaValue(definition.output, result, "Callback output");
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        onError?.(normalizedError);
        throw normalizedError;
      }
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => hydrateRemoteFunctions(item, undefined, controller, onError));
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const hydrated: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    hydrated[key] = hydrateRemoteFunctions(entry, undefined, controller, onError);
  }
  return hydrated;
};

const hydrateProps = (
  props: Record<string, unknown>,
  definitions: Record<string, RemoteCallbackDefinition | undefined> | undefined,
  controller: WorkerUiController,
  onError: ((error: Error) => void) | undefined,
): Record<string, unknown> => {
  const hydrated: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    hydrated[name] = hydrateRemoteFunctions(value, definitions?.[name], controller, onError);
  }
  return hydrated;
};

const validateElementProps = (
  node: RemoteElementNode,
  componentName: string,
  validation: ComponentValidation | undefined,
): void => {
  if (validation === undefined) {
    return;
  }

  const fieldProps: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(node.props)) {
    if (isRemoteFunctionRef(value)) {
      if (validation.callbacks?.[name] === undefined) {
        throw new Error(`Invalid remote tree: ${componentName}.${name} has no callback schema.`);
      }
      continue;
    }

    if (validation.callbacks?.[name] !== undefined) {
      throw new Error(
        `Invalid remote tree: ${componentName}.${name} must be a remote callback reference.`,
      );
    }

    fieldProps[name] = value;
  }

  if (validation.fields !== undefined) {
    validateStandardSchemaValueSync(validation.fields, fieldProps, `${componentName} props`);
  }
};

const createHostEvent = (
  node: RemoteElementNode,
  name: RemoteHostEvent["name"],
  event: Event,
): RemoteHostEvent => {
  const target = event.target as HTMLInputElement | null;
  return {
    checked: target?.checked,
    currentTargetId: node.id,
    key: "key" in event ? String(event.key) : undefined,
    name,
    targetId: node.id,
    value: target?.value,
  };
};

export const createWorkerUiController = ({
  onError,
  onMessage,
  worker,
}: HostControllerOptions): WorkerUiController => {
  const pendingCalls = new Map<
    string,
    { reject: (error: Error) => void; resolve: (value: unknown) => void }
  >();
  let nextCallId = 0;

  const postMessage = (message: HostToWorkerMessage): void => {
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    worker.postMessage(message);
  };

  worker.addEventListener("message", (event: MessageEvent<unknown>) => {
    const parsed = WorkerToHostMessageSchema.safeParse(event.data);
    if (!parsed.success) {
      onError?.(new Error(`Invalid worker message: ${parsed.error.message}`));
      return;
    }
    const message = parsed.data;
    if (message.type === "error") {
      const error = new Error(message.message);
      for (const call of pendingCalls.values()) {
        call.reject(error);
      }
      pendingCalls.clear();
      onError?.(error);
      return;
    }
    if (message.type === "call-result") {
      pendingCalls.get(message.id)?.resolve(message.result);
      pendingCalls.delete(message.id);
      return;
    }
    onMessage?.(message);
  });

  return {
    callFunction(handlerId, args) {
      nextCallId += 1;
      const id = `call:${nextCallId}`;
      return new Promise((resolve, reject) => {
        pendingCalls.set(id, { reject, resolve });
        postMessage({
          args,
          handlerId,
          id,
          type: "call",
        });
      });
    },
    dispatchEvent(binding, event) {
      postMessage({
        event,
        handlerId: binding.handlerId,
        type: "event",
      });
    },
    mount(options) {
      postMessage({
        options,
        type: "mount",
      });
    },
    unmount() {
      postMessage({ type: "unmount" });
    },
  };
};

const renderSlots = <TRenderedNode>(
  slots: RemoteSlots | undefined,
  renderNode: (node: RemoteNode) => TRenderedNode,
): Record<string, TRenderedNode[]> | undefined => {
  if (slots === undefined) {
    return undefined;
  }
  const renderedSlots: Record<string, TRenderedNode[]> = {};
  for (const [name, children] of Object.entries(slots)) {
    renderedSlots[name] = children.map(renderNode);
  }
  return renderedSlots;
};

export const createRemoteUiHost = <TRenderedNode>(
  renderer: HostRenderer<TRenderedNode>,
): RemoteUiHost<TRenderedNode> => {
  let snapshot: RemoteNode | null = null;

  const renderNode = (node: RemoteNode): TRenderedNode => {
    if (node.kind === "text") {
      return renderer.renderText(node.text);
    }
    const children = node.children.map(renderNode);
    if (node.kind === "fragment") {
      return renderer.renderFragment(children);
    }
    return renderer.renderElement(node, children, renderSlots(node.slots, renderNode));
  };

  return {
    getSnapshot() {
      return snapshot;
    },
    handleWorkerMessage(message) {
      if (message.type !== "snapshot") {
        return snapshot === null ? null : renderNode(snapshot);
      }
      snapshot = message.tree;
      return renderNode(snapshot);
    },
    render() {
      return snapshot === null ? null : renderNode(snapshot);
    },
  };
};

export const createReactHostRenderer = <TRenderedNode>(
  createElement: CreateElement<TRenderedNode>,
  controller: WorkerUiController,
  options: ReactHostRendererOptions,
): HostRenderer<TRenderedNode> => ({
  renderElement(node, children, slots) {
    const componentName = getRemoteComponentName(node.type);
    if (componentName === null) {
      return createRemoteRenderError(
        createElement,
        `Native HTML element "${node.type}" is not supported.`,
      );
    }
    const validation = options.resolveComponentValidation?.(componentName) ??
      options.componentValidation?.[componentName] ?? {
        callbacks: options.callbackDefinitions?.[componentName],
      };
    if (typeof node.props[remoteComponentErrorProp] === "string") {
      return createRemoteRenderError(createElement, node.props[remoteComponentErrorProp]);
    }
    try {
      validateElementProps(node, componentName, validation);
    } catch (error) {
      return createRemoteRenderError(
        createElement,
        error instanceof Error ? error.message : String(error),
      );
    }
    const sanitizeResult = sanitizeProps(
      {
        ...node.props,
        key: node.key ?? node.id,
      },
      { allowFunctionRefs: true },
    );
    if (sanitizeResult.error !== null) {
      return createRemoteRenderError(createElement, sanitizeResult.error);
    }

    const props = hydrateProps(
      sanitizeResult.props,
      validation.callbacks,
      controller,
      options.onEventError,
    );
    for (const binding of node.events ?? []) {
      props[toReactEventName(binding.event)] = (event: Event) => {
        controller.dispatchEvent(binding, createHostEvent(node, binding.event, event));
      };
    }

    const component = options.components?.[componentName];
    if (component === undefined) {
      return createRemoteRenderError(createElement, `Missing remote component "${componentName}".`);
    }

    return createElement(component, { ...props, slots: slots ?? {} }, ...children);
  },
  renderFragment(children) {
    return createElement(options.fragment, null, ...children);
  },
  renderText(text) {
    return text as TRenderedNode;
  },
});
