import { Fragment, createElement, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createReactHostRenderer, createRemoteUiHost, createWorkerUiController } from "./host";
import type {
  ComponentValidationMap,
  RemoteCallbackDefinitions,
  ResolveComponentValidation,
} from "./host";
import type { WorkerUiMountOptions } from "@tailorkit/core/remote";

interface UseWorkerUiOptions {
  callbackDefinitions?: RemoteCallbackDefinitions;
  componentValidation?: ComponentValidationMap;
  components?: Record<string, unknown>;
  mount?: WorkerUiMountOptions;
  resolveComponentValidation?: ResolveComponentValidation;
  url: string;
}

interface UseWorkerUiResult {
  error: Error | null;
  node: ReactNode;
  revision: number | null;
  status: "error" | "ready" | "starting";
}

interface LocalWorkerUiController {
  callFunction(handlerId: string, args: unknown[]): Promise<unknown>;
  dispatchEvent(
    ...args: Parameters<ReturnType<typeof createWorkerUiController>["dispatchEvent"]>
  ): void;
  mount(options?: WorkerUiMountOptions): void;
  unmount(): void;
}

const reactCreateElement = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: ReactNode[]
): ReactNode => createElement(type as Parameters<typeof createElement>[0], props, ...children);

export const useWorkerUi = ({
  callbackDefinitions,
  componentValidation,
  components,
  mount,
  resolveComponentValidation,
  url,
}: UseWorkerUiOptions): UseWorkerUiResult => {
  const stableMount = useMemo(() => mount, [mount]);
  const [result, setResult] = useState<UseWorkerUiResult>({
    error: null,
    node: null,
    revision: null,
    status: "starting",
  });

  useEffect(() => {
    let active = true;
    const worker = new Worker(url, { type: "module" });
    const controllerRef: { current: LocalWorkerUiController | null } = { current: null };
    const controllerProxy: LocalWorkerUiController = {
      callFunction(handlerId, args) {
        if (controllerRef.current === null) {
          return Promise.reject(new Error("Worker UI controller is not ready."));
        }
        return controllerRef.current.callFunction(handlerId, args);
      },
      dispatchEvent(binding, event) {
        controllerRef.current?.dispatchEvent(binding, event);
      },
      mount(options) {
        controllerRef.current?.mount(options);
      },
      unmount() {
        controllerRef.current?.unmount();
      },
    };
    const remoteHost = createRemoteUiHost<ReactNode>(
      createReactHostRenderer(reactCreateElement, controllerProxy, {
        callbackDefinitions,
        componentValidation,
        components,
        fragment: Fragment,
        onEventError(error) {
          if (active) {
            setResult({ error, node: null, revision: null, status: "error" });
          }
        },
        resolveComponentValidation,
      }),
    );

    const controller = createWorkerUiController({
      onError(error) {
        if (active) {
          setResult({ error, node: null, revision: null, status: "error" });
        }
      },
      onMessage(message) {
        if (!active) {
          return;
        }
        if (message.type === "ready") {
          controller.mount(stableMount);
          return;
        }
        if (message.type === "snapshot") {
          try {
            setResult({
              error: null,
              node: remoteHost.handleWorkerMessage(message),
              revision: message.revision,
              status: "ready",
            });
          } catch (error) {
            setResult({
              error: error instanceof Error ? error : new Error(String(error)),
              node: null,
              revision: null,
              status: "error",
            });
          }
        }
      },
      worker,
    });
    controllerRef.current = controller;

    return () => {
      active = false;
      controller.unmount();
      worker.terminate();
    };
  }, [
    callbackDefinitions,
    componentValidation,
    components,
    resolveComponentValidation,
    stableMount,
    url,
  ]);

  return result;
};

export type { RemoteCallbackDefinitions, WorkerUiMountOptions };
