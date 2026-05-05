import { createElement, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { createWorkerUiHost } from "@tailorkit/sandbox/host";
import type { HostToWorkerPayload } from "@tailorkit/sandbox/protocol";
import { NodeStore } from "./node-store";
import { RemoteUIContext } from "./remote-context";
import type { RemoteViewContext } from "./remote-context";
import { UIRoot } from "./ui-context";

export interface UseRemoteUIOptions {
  appUrl: string | URL;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  props?: Record<string, unknown>;
  workerUrl?: string | URL;
}

export interface UseRemoteUIResult {
  UI: ComponentType;
  error: Error | null;
  status: "error" | "ready" | "starting";
}

export function createUseRemoteUI(
  components: Record<string, unknown>,
): (options: UseRemoteUIOptions) => UseRemoteUIResult {
  return function useRemoteUI(options: UseRemoteUIOptions): UseRemoteUIResult {
    const { appUrl, createWorker, props, workerUrl } = options;

    const storeRef = useRef<NodeStore | null>(null);
    if (storeRef.current === null) {
      storeRef.current = new NodeStore();
    }
    const store = storeRef.current;

    // Stable wrapper so the context object never changes reference
    const dispatchRef = useRef<((payload: HostToWorkerPayload) => void) | null>(null);

    const [status, setStatus] = useState<UseRemoteUIResult["status"]>("starting");
    const [error, setError] = useState<Error | null>(null);

    const ctxRef = useRef<RemoteViewContext>({
      components,
      dispatch: (payload) => dispatchRef.current?.(payload),
      store,
    });

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
      const host = createWorkerUiHost(appUrl, {
        createWorker,
        onError: (err) => {
          setStatus("error");
          setError(err);
        },
        props,
        workerUrl,
      });

      dispatchRef.current = (payload) => host.dispatch(payload);

      const unsubscribe = host.subscribe(() => {
        const tree = host.getSnapshot();
        if (tree !== null) {
          store.setSnapshot(tree);
          setStatus("ready");
          setError(null);
        }
      });

      host.mount();

      return () => {
        unsubscribe();
        dispatchRef.current = null;
        host.worker.terminate();
      };
    }, [appUrl, createWorker, props, workerUrl, store]);

    return { UI, error, status };
  };
}
