import { Fragment, createElement, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createReactHostRenderer } from "./adapters";
import type { RemoteCallbackDefinitions } from "./adapters";
import { createRemoteUiHost, createWorkerUiClient } from "./host";
import type { HostController, RemoteUiHost, WorkerUiClient } from "./host";
import type {
  RemoteEventBinding,
  RemoteHostEvent,
  WorkerRenderResult,
  WorkerUiMountOptions,
} from "./protocol";

interface UseWorkerUiOptions {
  callbackDefinitions?: RemoteCallbackDefinitions;
  components?: Record<string, unknown>;
  mount?: WorkerUiMountOptions;
  worker: () => Worker;
}

interface UseWorkerUiResult {
  error: Error | null;
  node: ReactNode;
  revision: number | null;
  status: "error" | "ready" | "starting";
}

const reactCreateElement = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: unknown[]
): unknown =>
  createElement(type as Parameters<typeof createElement>[0], props, ...(children as ReactNode[]));

const toReactNode = (
  result: WorkerRenderResult,
  remoteHost: RemoteUiHost<unknown>,
): {
  error: Error | null;
  node: ReactNode;
  revision: number | null;
  status: UseWorkerUiResult["status"];
} => {
  if (result.type === "error") {
    return {
      error: new Error(result.message),
      node: null,
      revision: null,
      status: "error",
    };
  }

  const rendered = remoteHost.handleWorkerMessage(result);
  return {
    error: null,
    node: rendered as ReactNode,
    revision: result.revision,
    status: "ready",
  };
};

export const useWorkerUi = (options: UseWorkerUiOptions): UseWorkerUiResult => {
  console.log("[tailorkit] useWorkerUi hook called", options);
  const { callbackDefinitions, components, mount: mountOptions, worker: createWorker } = options;
  const [result, setResult] = useState<UseWorkerUiResult>({
    error: null,
    node: null,
    revision: null,
    status: "starting",
  });

  useEffect(() => {
    let active = true;
    console.log("[tailorkit] useEffect firing, createWorker=", createWorker);
    const worker = createWorker();
    console.log("[tailorkit] worker created:", worker);
    const client: WorkerUiClient = createWorkerUiClient(worker);
    const remoteHostRef: { current: RemoteUiHost<unknown> | null } = {
      current: null,
    };

    const setRenderResult = (renderResult: WorkerRenderResult): void => {
      if (!active || remoteHostRef.current === null) {
        return;
      }
      setResult(toReactNode(renderResult, remoteHostRef.current));
    };

    const setError = (error: unknown): void => {
      if (!active) {
        return;
      }
      setResult({
        error: error instanceof Error ? error : new Error(String(error)),
        node: null,
        revision: null,
        status: "error",
      });
    };

    const controller: HostController = {
      async callFunction(handlerId: string, args: unknown[]) {
        const result = await client.callFunction({
          args,
          handlerId,
        });
        setRenderResult(result.render);
        return result;
      },
      async dispatchEvent(
        binding: RemoteEventBinding,
        event: RemoteHostEvent,
      ): Promise<WorkerRenderResult> {
        const renderResult = await client.dispatchEvent({
          event,
          handlerId: binding.handlerId,
        });
        setRenderResult(renderResult);
        return renderResult;
      },
      mount: (input) => client.mount(input),
      unmount: () => client.unmount(),
    };

    remoteHostRef.current = createRemoteUiHost(
      createReactHostRenderer(reactCreateElement, Fragment, controller, {
        callbackDefinitions,
        components,
        onEventError: setError,
      }),
    );

    const mount = async (): Promise<void> => {
      try {
        console.log("[tailorkit] calling mount...");
        setRenderResult(await controller.mount(mountOptions));
        console.log("[tailorkit] mount complete");
      } catch (error) {
        console.error("[tailorkit] mount error:", error);
        setError(error);
      }
    };

    void mount();

    return () => {
      active = false;
      void (async () => {
        try {
          await controller.unmount();
        } finally {
          worker.terminate();
        }
      })();
    };
  }, [callbackDefinitions, components, mountOptions, createWorker]);

  return result;
};

export type { RemoteCallbackDefinitions, WorkerUiMountOptions };
