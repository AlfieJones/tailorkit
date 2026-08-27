/* oxlint-disable import/default, typescript/ban-ts-comment, typescript/prefer-ts-expect-error */
// @ts-ignore -- Vite compiles this worker entry and returns its emitted asset URL.
import runtimeWorkerUrl from "../worker/worker.ts?worker&url";
/* oxlint-enable import/default, typescript/ban-ts-comment, typescript/prefer-ts-expect-error */
import { HostToWorkerPayload, WorkerToHostPayload } from "../protocol.js";
import type { HostToWorkerPayload as HostToWorkerPayloadType } from "../protocol.js";
import { createRemoteUiStore } from "./store.js";
import type { RemoteUiStore } from "./store.js";

const iframeReadyType = "tailorkit:iframe-ready";
const bootstrapType = "tailorkit:bootstrap";
const workerMessageType = "tailorkit:worker-message";

interface IframeBridgeMessage {
  channel: string;
  payload?: unknown;
  type: string;
  workerSource?: string;
}

export interface IframeUiHost extends RemoteUiStore {
  destroy(): void;
  dispatch(payload: HostToWorkerPayloadType): void;
  iframe: HTMLIFrameElement;
  mount(): void;
}

export interface IframeUiHostOptions {
  createIframe?: () => HTMLIFrameElement;
  fetch?: typeof globalThis.fetch;
  mountTarget?: HTMLElement;
  onError?: (error: Error) => void;
  props?: Record<string, unknown>;
  runtimeUrl?: string | URL;
}

export function createIframeUiHost(
  appUrl: string | URL,
  options: IframeUiHostOptions = {},
): IframeUiHost {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new TypeError("TailorKit's iframe sandbox requires a browser environment.");
  }

  const store = createRemoteUiStore();
  const iframe = options.createIframe?.() ?? document.createElement("iframe");
  const channel = createChannelId();
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const resolvedAppUrl = toUrl(appUrl);
  const resolvedRuntimeUrl = toUrl(options.runtimeUrl ?? runtimeWorkerUrl);
  const runtimeImportOrigin = isViteDevelopmentWorker(resolvedRuntimeUrl)
    ? resolvedRuntimeUrl.origin
    : undefined;
  const queuedPayloads: HostToWorkerPayloadType[] = [];
  let appSourcePromise: Promise<string> | null = null;
  let bootstrapSent = false;
  let destroyed = false;
  let iframeReady = false;
  let mounted = false;
  let runtimeSourcePromise: Promise<string> | null = null;
  let workerReady = false;

  configureIframe(iframe, channel, runtimeImportOrigin);

  const reportError = (error: unknown): void => {
    options.onError?.(error instanceof Error ? error : new Error(String(error)));
  };

  const postToIframe = (message: IframeBridgeMessage): void => {
    iframe.contentWindow?.postMessage(message, "*");
  };

  const postToWorker = (payload: HostToWorkerPayloadType): void => {
    postToIframe({ channel, payload, type: workerMessageType });
  };

  const sendInit = async (): Promise<void> => {
    const appSource = await appSourcePromise;
    if (destroyed || appSource === null) {
      return;
    }
    postToWorker({
      data: {
        appSource,
        appUrl: resolvedAppUrl.toString(),
        props: options.props,
      },
      type: "init",
    });
    for (const payload of queuedPayloads.splice(0)) {
      postToWorker(payload);
    }
  };

  const sendBootstrap = async (): Promise<void> => {
    if (!mounted || !iframeReady || bootstrapSent || destroyed) {
      return;
    }
    bootstrapSent = true;
    try {
      const workerSource = await runtimeSourcePromise;
      if (destroyed || workerSource === null) {
        return;
      }
      postToIframe({ channel, type: bootstrapType, workerSource });
    } catch (error) {
      reportError(error);
    }
  };

  const handleMessage = (event: MessageEvent<unknown>): void => {
    if (event.source !== iframe.contentWindow || !isBridgeMessage(event.data, channel)) {
      return;
    }
    if (event.data.type === iframeReadyType) {
      iframeReady = true;
      void sendBootstrap();
      return;
    }
    if (event.data.type !== workerMessageType) {
      return;
    }

    const result = WorkerToHostPayload.safeParse(event.data.payload);
    if (!result.success) {
      reportError(new Error(`Invalid sandbox message: ${result.error.message}`));
      return;
    }
    if (result.data.type === "requestAnimationFrame") {
      requestAnimationFrame((timestamp) => {
        postToWorker({ data: { timestamp }, type: "animationFrame" });
      });
      return;
    }
    if (result.data.type === "ready") {
      workerReady = true;
      void sendInit().catch(reportError);
    }
    try {
      store.handleWorkerMessage(result.data);
    } catch (error) {
      reportError(error);
    }
  };

  window.addEventListener("message", handleMessage);

  return {
    ...store,
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      queuedPayloads.length = 0;
      window.removeEventListener("message", handleMessage);
      iframe.remove();
    },
    dispatch(payload) {
      HostToWorkerPayload.parse(payload);
      if (!workerReady) {
        queuedPayloads.push(payload);
        return;
      }
      postToWorker(payload);
    },
    iframe,
    mount() {
      if (mounted || destroyed) {
        return;
      }
      mounted = true;
      appSourcePromise = fetchSource(fetchImplementation, resolvedAppUrl, "app client");
      runtimeSourcePromise = fetchSource(
        fetchImplementation,
        resolvedRuntimeUrl,
        "sandbox runtime",
      ).then((source) => absolutizeViteImports(source, resolvedRuntimeUrl));
      (options.mountTarget ?? document.body).append(iframe);
      void sendBootstrap();
    },
  };
}

function configureIframe(
  iframe: HTMLIFrameElement,
  channel: string,
  runtimeImportOrigin?: string,
): void {
  iframe.hidden = true;
  iframe.tabIndex = -1;
  iframe.title = "TailorKit extension sandbox";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("referrerpolicy", "no-referrer");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.srcdoc = createIframeDocument(channel, runtimeImportOrigin);
}

function createIframeDocument(channel: string, runtimeImportOrigin?: string): string {
  const encodedChannel = JSON.stringify(channel);
  const developmentScriptSource = runtimeImportOrigin ? ` ${runtimeImportOrigin}` : "";
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' data:${developmentScriptSource}; worker-src data:; connect-src 'none'; img-src 'none'; style-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">
  </head>
  <body>
    <script>
      (() => {
        const channel = ${encodedChannel};
        let worker;

        addEventListener("message", (event) => {
          if (event.source !== parent || event.data?.channel !== channel) return;

          if (event.data.type === "${bootstrapType}" && !worker) {
            const runtimeBootstrap =
              "const source = " + JSON.stringify(event.data.workerSource) + ";" +
              "const url = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(source);" +
              "import(url).catch((error) => postMessage({" +
                "data: { message: error instanceof Error ? (error.stack || error.message) : String(error) }," +
                "type: 'error'" +
              "}));";
            const workerUrl =
              "data:text/javascript;charset=utf-8," + encodeURIComponent(runtimeBootstrap);
            worker = new Worker(workerUrl, { type: "module" });
            worker.addEventListener("message", (workerEvent) => {
              parent.postMessage({ channel, payload: workerEvent.data, type: "${workerMessageType}" }, "*");
            });
            worker.addEventListener("error", (workerEvent) => {
              const location = workerEvent.filename
                ? " at " + workerEvent.filename + ":" + workerEvent.lineno + ":" + workerEvent.colno
                : "";
              parent.postMessage({
                channel,
                payload: {
                  data: { message: (workerEvent.message || "TailorKit sandbox failed.") + location },
                  type: "error"
                },
                type: "${workerMessageType}"
              }, "*");
            });
            return;
          }

          if (event.data.type === "${workerMessageType}") {
            worker?.postMessage(event.data.payload);
          }
        });

        addEventListener("unload", () => {
          worker?.terminate();
        });

        parent.postMessage({ channel, type: "${iframeReadyType}" }, "*");
      })();
    </script>
  </body>
</html>`;
}

async function fetchSource(
  fetchImplementation: typeof globalThis.fetch,
  url: URL,
  label: string,
): Promise<string> {
  const response = await fetchImplementation(url, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Unable to load TailorKit ${label} from ${url.toString()}.`);
  }
  return response.text();
}

function absolutizeViteImports(source: string, runtimeUrl: URL): string {
  if (!isViteDevelopmentWorker(runtimeUrl)) {
    return source;
  }
  return source.replaceAll(
    /(from\s*["']|import\s*["'])(\/[^"']+)(["'])/gu,
    (_match, prefix: string, specifier: string, suffix: string) =>
      `${prefix}${new URL(specifier, runtimeUrl.origin).toString()}${suffix}`,
  );
}

function isViteDevelopmentWorker(url: URL): boolean {
  return url.searchParams.has("worker_file");
}

function createChannelId(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isBridgeMessage(value: unknown, channel: string): value is IframeBridgeMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "channel" in value &&
    value.channel === channel &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function toUrl(value: string | URL): URL {
  return value instanceof URL ? value : new URL(value, globalThis.location?.href);
}

export { createRemoteUiStore };
export type { RemoteUiStore };
