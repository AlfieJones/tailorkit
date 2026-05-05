import z from "zod";

export type RemoteNode = RemoteElementNode | RemoteFragmentNode | RemoteTextNode;

export interface RemoteTextNode {
  id: string;
  kind: "text";
  text: string;
}

export interface RemoteFragmentNode {
  children: RemoteNode[];
  id: string;
  kind: "fragment";
}

export interface RemoteElementNode {
  children: RemoteNode[];
  events?: RemoteEventBinding[];
  id: string;
  kind: "element";
  props: RemoteProps;
  type: string;
}

export type RemoteProps = Record<string, unknown>;

export interface RemoteEventBinding {
  capture?: boolean;
  event: RemoteEventName;
}

export type RemoteEventName =
  | "blur"
  | "change"
  | "click"
  | "focus"
  | "input"
  | "keydown"
  | "keyup"
  | "mousedown"
  | "mouseup"
  | "pointerdown"
  | "pointerup"
  | "submit";

export interface RemoteHostEvent {
  bubbles?: boolean;
  cancelable?: boolean;
  checked?: boolean;
  key?: string;
  type: RemoteEventName;
  value?: string;
}

export type RemotePatch =
  | {
      beforeId?: string;
      node: RemoteNode;
      op: "insert";
      parentId: string;
    }
  | {
      nodeId: string;
      op: "remove";
    }
  | {
      name: string;
      nodeId: string;
      op: "setProp";
      value: unknown;
    }
  | {
      name: string;
      nodeId: string;
      op: "removeProp";
    }
  | {
      nodeId: string;
      op: "setText";
      text: string;
    }
  | {
      events: RemoteEventBinding[];
      nodeId: string;
      op: "setEvents";
    };

export interface WorkerUiMountOptions {
  appUrl: string;
  props?: Record<string, unknown>;
}

export const RemoteEventNameSchema = z.enum([
  "blur",
  "change",
  "click",
  "focus",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mouseup",
  "pointerdown",
  "pointerup",
  "submit",
]);

export const HostToWorkerPayload = z.discriminatedUnion("type", [
  z.object({
    data: z.object({
      appUrl: z.string(),
      props: z.record(z.string(), z.unknown()).optional(),
    }),
    type: z.literal("init"),
  }),
  z.object({
    data: z.object({
      bubbles: z.boolean().optional(),
      cancelable: z.boolean().optional(),
      checked: z.boolean().optional(),
      key: z.string().optional(),
      nodeId: z.string(),
      type: RemoteEventNameSchema,
      value: z.string().optional(),
    }),
    type: z.literal("dispatchEvent"),
  }),
  z.object({
    data: z.object({
      timestamp: z.number(),
    }),
    type: z.literal("animationFrame"),
  }),
]);
export type HostToWorkerPayload = z.output<typeof HostToWorkerPayload>;

const RemoteEventBindingSchema = z.object({
  capture: z.boolean().optional(),
  event: RemoteEventNameSchema,
});

type RemoteNodeSchemaType = z.ZodType<RemoteNode>;
const RemoteNodeSchema: RemoteNodeSchemaType = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      id: z.string(),
      kind: z.literal("text"),
      text: z.string(),
    }),
    z.object({
      children: z.array(RemoteNodeSchema),
      id: z.string(),
      kind: z.literal("fragment"),
    }),
    z.object({
      children: z.array(RemoteNodeSchema),
      events: z.array(RemoteEventBindingSchema).optional(),
      id: z.string(),
      kind: z.literal("element"),
      props: z.record(z.string(), z.unknown()),
      type: z.string(),
    }),
  ]),
);

const RemotePatchSchema: z.ZodType<RemotePatch> = z.discriminatedUnion("op", [
  z.object({
    beforeId: z.string().optional(),
    node: RemoteNodeSchema,
    op: z.literal("insert"),
    parentId: z.string(),
  }),
  z.object({
    nodeId: z.string(),
    op: z.literal("remove"),
  }),
  z.object({
    name: z.string(),
    nodeId: z.string(),
    op: z.literal("setProp"),
    value: z.unknown(),
  }),
  z.object({
    name: z.string(),
    nodeId: z.string(),
    op: z.literal("removeProp"),
  }),
  z.object({
    nodeId: z.string(),
    op: z.literal("setText"),
    text: z.string(),
  }),
  z.object({
    events: z.array(RemoteEventBindingSchema),
    nodeId: z.string(),
    op: z.literal("setEvents"),
  }),
]);

export const WorkerToHostPayload = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ready"),
  }),
  z.object({
    data: z.object({
      revision: z.number(),
      tree: RemoteNodeSchema,
    }),
    type: z.literal("snapshot"),
  }),
  z.object({
    data: z.object({
      patches: z.array(RemotePatchSchema),
      revision: z.number(),
    }),
    type: z.literal("patches"),
  }),
  z.object({
    data: z.object({
      message: z.string(),
    }),
    type: z.literal("error"),
  }),
  z.object({
    data: z.object({}),
    type: z.literal("requestAnimationFrame"),
  }),
]);
export type WorkerToHostPayload = z.output<typeof WorkerToHostPayload>;
