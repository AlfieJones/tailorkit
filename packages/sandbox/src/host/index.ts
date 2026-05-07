import { HostToWorkerPayload, WorkerToHostPayload } from "../protocol.js";
import type { HostToWorkerPayload as HostToWorkerPayloadType } from "../protocol.js";
import { createRemoteUiStore } from "./store.js";
import type { RemoteUiStore } from "./store.js";

export interface WorkerUiHost extends RemoteUiStore {
  dispatch(payload: HostToWorkerPayloadType): void;
  mount(): void;
  worker: Worker;
}

export interface WorkerUiHostOptions {
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  onError?: (error: Error) => void;
  props?: Record<string, unknown>;
  workerUrl?: string | URL;
}

export function createWorkerUiHost(
  appUrl: string | URL,
  options: WorkerUiHostOptions = {},
): WorkerUiHost {
  const store = createRemoteUiStore();
  const workerUrl = toUrl(options.workerUrl ?? new URL("../worker/worker.ts", import.meta.url));
  const worker =
    options.createWorker?.(workerUrl, { type: "module" }) ??
    new Worker(workerUrl, { type: "module" });
  const appUrlString = toUrl(appUrl).toString();

  const dispatch = (payload: HostToWorkerPayloadType): void => {
    HostToWorkerPayload.parse(payload);
    // Worker.postMessage does not accept a targetOrigin argument.
    // eslint-disable-next-line unicorn/require-post-message-target-origin
    worker.postMessage(payload);
  };

  worker.addEventListener("message", (event) => {
    const result = WorkerToHostPayload.safeParse(event.data);
    if (!result.success) {
      options.onError?.(new Error(`Invalid worker message: ${result.error.message}`));
      return;
    }
    if (result.data.type === "requestAnimationFrame") {
      requestAnimationFrame((timestamp) => {
        dispatch({ data: { timestamp }, type: "animationFrame" });
      });
      return;
    }
    try {
      store.handleWorkerMessage(result.data);
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });

  return {
    ...store,
    dispatch,
    mount() {
      dispatch({
        data: {
          appUrl: appUrlString,
          props: options.props,
        },
        type: "init",
      });
    },
    worker,
  };
}

function toUrl(value: string | URL): URL {
  return value instanceof URL ? value : new URL(value, globalThis.location?.href);
}

export { createRemoteUiStore };
export type { RemoteUiStore };
