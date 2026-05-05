import { z } from "zod";

const remoteComponentPrefix = "tailorkit-component-";

export const remoteComponentSlotsProp = "__tailorkitSlots";
export const remoteComponentErrorProp = "__tailorkitError";
export const tailorkitSlotType = "tailorkit-slot";

export const createRemoteComponentType = (name: string): string => {
  if (name.length === 0) {
    throw new Error("Remote component names cannot be empty.");
  }
  return `${remoteComponentPrefix}${name}`;
};

export const getRemoteComponentName = (type: string): string | null =>
  type.startsWith(remoteComponentPrefix) ? type.slice(remoteComponentPrefix.length) : null;

export const RemoteKeySchema = z.union([z.string(), z.number()]);
export type RemoteKey = z.infer<typeof RemoteKeySchema>;

export const RemoteFunctionRefSchema = z.object({
  handlerId: z.string(),
  kind: z.literal("function"),
});
export type RemoteFunctionRef = z.infer<typeof RemoteFunctionRefSchema>;

export const RemoteEventNameSchema = z.enum([
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
export type RemoteEventName = z.infer<typeof RemoteEventNameSchema>;

export const RemoteEventBindingSchema = z.object({
  capture: z.boolean().optional(),
  event: RemoteEventNameSchema,
  handlerId: z.string(),
});
export type RemoteEventBinding = z.infer<typeof RemoteEventBindingSchema>;

export const RemotePropsSchema = z.record(z.string(), z.unknown());
export type RemoteProps = z.infer<typeof RemotePropsSchema>;

export interface RemoteTextNode {
  id: string;
  kind: "text";
  text: string;
}

export interface RemoteFragmentNode {
  children: RemoteNode[];
  id: string;
  key?: RemoteKey;
  kind: "fragment";
}

export interface RemoteElementNode {
  children: RemoteNode[];
  events?: RemoteEventBinding[];
  id: string;
  key?: RemoteKey;
  kind: "element";
  props: RemoteProps;
  slots?: RemoteSlots;
  type: string;
}

export type RemoteNode = RemoteElementNode | RemoteFragmentNode | RemoteTextNode;
export type RemoteSlots = Record<string, RemoteNode[]>;

export const RemoteNodeSchema: z.ZodType<RemoteNode> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      id: z.string(),
      kind: z.literal("text"),
      text: z.string(),
    }),
    z.object({
      children: z.array(RemoteNodeSchema),
      id: z.string(),
      key: RemoteKeySchema.optional(),
      kind: z.literal("fragment"),
    }),
    z.object({
      children: z.array(RemoteNodeSchema),
      events: z.array(RemoteEventBindingSchema).optional(),
      id: z.string(),
      key: RemoteKeySchema.optional(),
      kind: z.literal("element"),
      props: RemotePropsSchema,
      slots: z.record(z.string(), z.array(RemoteNodeSchema)).optional(),
      type: z.string(),
    }),
  ]),
);

export const WorkerUiMountOptionsSchema = z.object({
  currentScreen: z.string().optional(),
  defaultContext: z.unknown().optional(),
  screenContext: z.unknown().optional(),
});
export type WorkerUiMountOptions = z.infer<typeof WorkerUiMountOptionsSchema>;

export const RemoteHostEventSchema = z.object({
  checked: z.boolean().optional(),
  currentTargetId: z.string(),
  key: z.string().optional(),
  name: RemoteEventNameSchema,
  targetId: z.string(),
  value: z.string().optional(),
});
export type RemoteHostEvent = z.infer<typeof RemoteHostEventSchema>;

export const HostToWorkerMessageSchema = z.discriminatedUnion("type", [
  z.object({
    args: z.array(z.unknown()),
    handlerId: z.string(),
    id: z.string(),
    type: z.literal("call"),
  }),
  z.object({
    event: RemoteHostEventSchema,
    handlerId: z.string(),
    type: z.literal("event"),
  }),
  z.object({
    options: WorkerUiMountOptionsSchema.optional(),
    type: z.literal("mount"),
  }),
  z.object({
    type: z.literal("unmount"),
  }),
]);
export type HostToWorkerMessage = z.infer<typeof HostToWorkerMessageSchema>;

export const WorkerToHostMessageSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    result: z.unknown(),
    type: z.literal("call-result"),
  }),
  z.object({
    message: z.string(),
    type: z.literal("error"),
  }),
  z.object({
    type: z.literal("ready"),
  }),
  z.object({
    revision: z.number().int().nonnegative(),
    tree: RemoteNodeSchema,
    type: z.literal("snapshot"),
  }),
]);
export type WorkerToHostMessage = z.infer<typeof WorkerToHostMessageSchema>;
