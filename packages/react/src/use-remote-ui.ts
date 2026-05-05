import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { createWorkerUiClient } from "@tailorkit/sandbox-ui/host";
import type { HostController, WorkerUiClient } from "@tailorkit/sandbox-ui/host";
import type { WorkerRenderResult, WorkerUiMountOptions } from "@tailorkit/sandbox-ui/protocol";
import { NodeStore } from "./node-store";
import type { RemoteCallbackDefinitions } from "./render-utils";
import type { RemoteViewContext } from "./remote-view";
import { RemoteUIContext, UIRoot } from "./ui-context";
import { createElement } from "react";

export interface UseRemoteUIOptions {
  mount?: WorkerUiMountOptions;
  worker: () => Worker;
}

export interface UseRemoteUIResult {
  UI: ComponentType;
  error: Error | null;
  status: "error" | "ready" | "starting";
}

export function createUseRemoteUI(
  components: Record<string, unknown>,
  callbackDefinitions: RemoteCallbackDefinitions,
): (options: UseRemoteUIOptions) => UseRemoteUIResult {
  return function useRemoteUI(options: UseRemoteUIOptions): UseRemoteUIResult {
    const { worker: createWorker, mount: mountOptions } = options;

    const storeRef = useRef<NodeStore | null>(null);
    if (storeRef.current === null) {
      storeRef.current = new NodeStore();
    }
    const store = storeRef.current;

    const controllerRef = useRef<HostController | null>(null);

    const [status, setStatus] = useState<UseRemoteUIResult["status"]>("starting");
    const [error, setError] = useState<Error | null>(null);

    // Build a stable context object whose mutable properties are always current.
    // We use a ref so the UI component closure never becomes stale.
    const ctxRef = useRef<RemoteViewContext>({
      callbackDefinitions,
      components,
      controller: controllerRef,
      store,
    });

    // The UI component is created once and reads from ctxRef — no remounting on re-renders.
    const UI = useMemo(() => {
      const ctx = ctxRef.current;
      return function TailorKitUI() {
        return createElement(
          RemoteUIContext.Provider,
          { value: ctx },
          createElement(UIRoot, { store: ctx.store }),
        );
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      let active = true;

      const handleResult = (result: WorkerRenderResult): void => {
        if (!active) {
          return;
        }
        if (result.type === "error") {
          setStatus("error");
          setError(new Error(result.message));
          return;
        }
        store.setSnapshot(result.tree);
        setStatus("ready");
        setError(null);
      };

      const worker = createWorker();
      const client: WorkerUiClient = createWorkerUiClient(worker);

      const controller: HostController = {
        async callFunction(handlerId, args) {
          const result = await client.callFunction({ handlerId, args });
          handleResult(result.render);
          return result;
        },
        async dispatchEvent(binding, event) {
          const result = await client.dispatchEvent({ handlerId: binding.handlerId, event });
          handleResult(result);
          return result;
        },
        mount: (opts) => client.mount(opts),
        unmount: () => client.unmount(),
      };

      controllerRef.current = controller;

      void (async () => {
        try {
          handleResult(await controller.mount(mountOptions));
        } catch (error) {
          if (active) {
            setStatus("error");
            setError(error instanceof Error ? error : new Error(String(error)));
          }
        }
      })();

      return () => {
        active = false;
        controllerRef.current = null;
        void (async () => {
          try {
            await controller.unmount();
          } finally {
            worker.terminate();
          }
        })();
      };
    }, [createWorker, mountOptions, store]);

    return { UI, error, status };
  };
}
