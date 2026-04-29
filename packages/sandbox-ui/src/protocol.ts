export type RemoteNode = RemoteElementNode | RemoteTextNode | RemoteFragmentNode;

const remoteComponentPrefix = "sandbox-ui-component-";

export interface RemoteTextNode {
  kind: "text";
  id: string;
  text: string;
}

export interface RemoteFragmentNode {
  kind: "fragment";
  id: string;
  children: RemoteNode[];
  key?: RemoteKey;
}

export interface RemoteElementNode {
  kind: "element";
  id: string;
  type: string;
  props: RemoteProps;
  children: RemoteNode[];
  events?: RemoteEventBinding[];
  key?: RemoteKey;
}

export type RemoteKey = string | number;

export type RemoteProps = Record<string, unknown>;

export interface RemoteFunctionRef {
  kind: "function";
  handlerId: string;
}

export interface RemoteFunctionCallResult {
  result: unknown;
  render: WorkerRenderResult;
}

export interface RemoteEventBinding {
  event: RemoteEventName;
  handlerId: string;
  capture?: boolean;
}

export type RemoteEventName =
  | "blur"
  | "change"
  | "click"
  | "focus"
  | "input"
  | "keydown"
  | "keyup"
  | "pointerdown"
  | "pointerup"
  | "submit";

export type WorkerRenderResult =
  | {
      type: "snapshot";
      tree: RemoteNode;
      revision: number;
    }
  | {
      message: string;
      type: "error";
    };

export interface RemoteHostEvent {
  checked?: boolean;
  currentTargetId: string;
  key?: string;
  name: RemoteEventName;
  targetId: string;
  value?: string;
}

export const createRemoteComponentType = (name: string): string => {
  if (name.length === 0) {
    throw new Error("Remote component names cannot be empty.");
  }
  return `${remoteComponentPrefix}${name}`;
};

export const getRemoteComponentName = (type: string): string | null =>
  type.startsWith(remoteComponentPrefix) ? type.slice(remoteComponentPrefix.length) : null;
