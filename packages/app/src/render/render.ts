import { h, isValidElement } from "preact";
import type { ComponentChildren, FunctionComponent, VNode } from "preact";
import { getRemoteComponentName } from "@tailorkit/core/remote";

export type SerializedNode =
  | { kind: "remote"; name: string; props: Record<string, unknown>; children: SerializedNode[] }
  | { kind: "fragment"; children: SerializedNode[] }
  | { kind: "text"; value: string }
  | null;

export interface RenderResult {
  vdom: SerializedNode;
  /** Invoke a callback registered during render by its ID. */
  invoke: (id: string, args: unknown[]) => unknown;
}

type CallbackRegistry = Map<string, (...args: unknown[]) => unknown>;

let callbackCounter = 0;

function registerCallback(registry: CallbackRegistry, fn: (...args: unknown[]) => unknown): string {
  const id = `cb_${++callbackCounter}`;
  registry.set(id, fn);
  return id;
}

function serializeProps(
  props: Record<string, unknown>,
  registry: CallbackRegistry,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === "children") {
      continue;
    }
    if (typeof val === "function") {
      out[key] = {
        __callbackId: registerCallback(registry, val as (...args: unknown[]) => unknown),
      };
    } else {
      out[key] = val;
    }
  }
  return out;
}

function resolveChildren(
  children: ComponentChildren,
  registry: CallbackRegistry,
): SerializedNode[] {
  if (children === null || children === undefined) {
    return [];
  }
  if (Array.isArray(children)) {
    return children.flatMap((c) => {
      const r = renderNode(c, registry);
      return r === null ? [] : [r];
    });
  }
  const r = renderNode(children, registry);
  return r === null ? [] : [r];
}

function renderNode(node: unknown, registry: CallbackRegistry): SerializedNode {
  if (node === null || node === undefined || typeof node === "boolean") {
    return null;
  }

  if (typeof node === "string" || typeof node === "number") {
    return { kind: "text", value: String(node) };
  }

  if (Array.isArray(node)) {
    return {
      kind: "fragment",
      children: node.flatMap((n) => {
        const r = renderNode(n, registry);
        return r === null ? [] : [r];
      }),
    };
  }

  if (!isValidElement(node)) {
    return null;
  }

  const vnode = node as VNode<Record<string, unknown>>;
  const { type, props } = vnode;

  if (typeof type === "function") {
    const Component = type as (props: Record<string, unknown>) => unknown;
    return renderNode(Component(props ?? {}), registry);
  }

  const remoteName = getRemoteComponentName(type as string);
  const serializedProps = serializeProps(props ?? {}, registry);
  const children = resolveChildren(props?.children, registry);

  if (remoteName !== null) {
    return { kind: "remote", name: remoteName, props: serializedProps, children };
  }

  throw new Error(
    `Native HTML element "${type as string}" is not supported. Use remote components instead.`,
  );
}

export function render(component: FunctionComponent, context: unknown): RenderResult {
  const registry: CallbackRegistry = new Map();
  const vdom = renderNode(h(component, { context } as Record<string, unknown>), registry);

  return {
    vdom,
    invoke(id, args) {
      const fn = registry.get(id);
      if (!fn) {
        throw new Error(`No callback registered with id "${id}"`);
      }
      return fn(...args);
    },
  };
}
