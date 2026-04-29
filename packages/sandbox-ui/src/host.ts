import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import type { SupportedMessagePort } from "@orpc/client/message-port";
import type { WorkerUiRouter } from "./worker";
import type {
  RemoteElementNode,
  RemoteEventBinding,
  RemoteFunctionCallResult,
  RemoteHostEvent,
  RemoteNode,
  WorkerRenderResult,
} from "./protocol";
import { createRemoteFunctionSerializer } from "./serializers";

export interface HostRenderer<TRenderedNode> {
  renderElement(node: RemoteElementNode, children: TRenderedNode[]): TRenderedNode;
  renderFragment(children: TRenderedNode[]): TRenderedNode;
  renderText(text: string): TRenderedNode;
}

export interface RemoteUiHost<TRenderedNode> {
  getSnapshot(): RemoteNode | null;
  handleWorkerMessage(message: WorkerRenderResult): TRenderedNode | null;
  render(): TRenderedNode | null;
}

export interface HostController {
  callFunction(handlerId: string, args: unknown[]): Promise<RemoteFunctionCallResult>;
  dispatchEvent(binding: RemoteEventBinding, event: RemoteHostEvent): Promise<WorkerRenderResult>;
  mount(): Promise<WorkerRenderResult>;
  unmount(): Promise<WorkerRenderResult>;
}

export type WorkerUiClient = RouterClient<WorkerUiRouter>;

export const createWorkerUiClient = (port: SupportedMessagePort): WorkerUiClient => {
  const link = new RPCLink({
    customJsonSerializers: [createRemoteFunctionSerializer()],
    port,
  });

  return createORPCClient<WorkerUiClient>(link);
};

export const createHostController = (client: WorkerUiClient): HostController => ({
  callFunction(handlerId, args) {
    return client.callFunction({
      args,
      handlerId,
    });
  },
  dispatchEvent(binding, event) {
    return client.dispatchEvent({
      event,
      handlerId: binding.handlerId,
    });
  },
  mount() {
    return client.mount();
  },
  unmount() {
    return client.unmount();
  },
});

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
    return renderer.renderElement(node, children);
  };

  return {
    getSnapshot() {
      return snapshot;
    },
    handleWorkerMessage(message) {
      if (message.type === "error") {
        throw new Error(message.message);
      }
      snapshot = message.tree;
      return renderNode(snapshot);
    },
    render() {
      return snapshot === null ? null : renderNode(snapshot);
    },
  };
};
