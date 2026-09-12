import { HostToIframePayload, IframeToHostPayload } from "../protocol.js";
import type { HostToIframePayload as HostToIframePayloadType } from "../protocol.js";
import { createRemoteUiStore } from "./store.js";
import type { RemoteUiStore } from "./store.js";
import { readElementProps } from "./serialize.js";

const iframeReadyType = "tailorkit:iframe-ready";
// This wire value is part of the public host/iframe protocol. Its historical
// name is intentionally unchanged even though there is no worker anymore.
const sandboxMessageType = "tailorkit:worker-message";

interface IframeBridgeMessage {
  channel: string;
  payload?: unknown;
  type: string;
}

export interface IframeUiHost extends RemoteUiStore {
  destroy(): void;
  dispatch(payload: HostToIframePayloadType): void;
  iframe: HTMLIFrameElement;
  mount(): void;
  setProps(props: Record<string, unknown> | undefined): void;
}

export interface IframeUiHostOptions {
  createIframe?: () => HTMLIFrameElement;
  fetch?: typeof globalThis.fetch;
  mountTarget?: HTMLElement;
  onError?: (error: Error) => void;
  props?: Record<string, unknown>;
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
  const queuedPayloads: HostToIframePayloadType[] = [];
  let appSourcePromise: Promise<string> | null = null;
  let destroyed = false;
  let iframeReady = false;
  let mounted = false;
  let currentProps = options.props;
  let initRevision = 0;

  configureIframe(iframe, channel);

  const reportError = (error: unknown): void => {
    options.onError?.(error instanceof Error ? error : new Error(String(error)));
  };

  const postToIframe = (payload: HostToIframePayloadType): void => {
    iframe.contentWindow?.postMessage({ channel, payload, type: sandboxMessageType }, "*");
  };

  const sendInit = async (): Promise<void> => {
    if (!mounted || !iframeReady || destroyed) {
      return;
    }
    const revision = ++initRevision;
    const appSource = await appSourcePromise;
    if (destroyed || appSource === null || revision !== initRevision) {
      return;
    }
    postToIframe({
      data: {
        appSource,
        appUrl: resolvedAppUrl.toString(),
        props: currentProps,
      },
      type: "init",
    });
    for (const payload of queuedPayloads.splice(0)) {
      postToIframe(payload);
    }
  };

  const handleMessage = (event: MessageEvent<unknown>): void => {
    if (event.source !== iframe.contentWindow || !isBridgeMessage(event.data, channel)) {
      return;
    }
    if (event.data.type === iframeReadyType) {
      iframeReady = true;
      void sendInit().catch(reportError);
      return;
    }
    if (event.data.type !== sandboxMessageType) {
      return;
    }

    const result = IframeToHostPayload.safeParse(event.data.payload);
    if (!result.success) {
      reportError(new Error(`Invalid sandbox message: ${result.error.message}`));
      return;
    }
    try {
      store.handleSandboxMessage(result.data);
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
      HostToIframePayload.parse(payload);
      if (!iframeReady) {
        queuedPayloads.push(payload);
        return;
      }
      postToIframe(payload);
    },
    iframe,
    setProps(props) {
      if (currentProps === props || destroyed) {
        return;
      }
      currentProps = props;
      void sendInit().catch(reportError);
    },
    mount() {
      if (mounted || destroyed) {
        return;
      }
      mounted = true;
      appSourcePromise = fetchSource(fetchImplementation, resolvedAppUrl);
      (options.mountTarget ?? document.body).append(iframe);
      void sendInit().catch(reportError);
    },
  };
}

function configureIframe(iframe: HTMLIFrameElement, channel: string): void {
  iframe.hidden = true;
  iframe.tabIndex = -1;
  iframe.title = "TailorKit extension sandbox";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("referrerpolicy", "no-referrer");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.srcdoc = createIframeDocument(channel);
}

function createIframeDocument(channel: string): string {
  const encodedChannel = JSON.stringify(channel);
  const readPropsSource = readElementProps.toString();
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' data:; worker-src 'none'; connect-src 'none'; img-src 'none'; style-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">
  </head>
  <body>
    <div id="tailorkit-root"></div>
    <script>
      (() => {
        const channel = ${encodedChannel};
        const messageType = ${JSON.stringify(sandboxMessageType)};
        const root = document.getElementById("tailorkit-root");
        const nodeIds = new WeakMap();
        const nodes = new Map();
        let nextNodeId = 1;
        let revision = 0;
        let loadedAppUrl = null;
        let loadedModule = null;
        let rendering = false;

        const send = (payload) => parent.postMessage({ channel, payload, type: messageType }, "*");
        const sendError = (error) => send({
          data: { message: error instanceof Error ? (error.stack || error.message) : String(error) },
          type: "error"
        });
        const getNodeId = (node) => {
          let id = nodeIds.get(node);
          if (!id) {
            id = "n:" + nextNodeId++;
            nodeIds.set(node, id);
            nodes.set(id, new WeakRef(node));
          }
          return id;
        };
        const derefNode = (id) => {
          const reference = nodes.get(id);
          const node = reference?.deref();
          if (!node) nodes.delete(id);
          return node;
        };
        const readProps = ${readPropsSource};
        const readCallbacks = (element) => {
          const value = element.getAttribute("data-tailorkit-callbacks");
          if (!value) return [];
          try {
            const callbacks = JSON.parse(value);
            if (!callbacks || typeof callbacks !== "object" || Array.isArray(callbacks)) return [];
            return Object.entries(callbacks).flatMap(([event, config]) =>
              config && typeof config === "object" && typeof config.callback === "string" &&
                typeof config.inputCount === "number"
                ? [{ callback: config.callback, event, inputCount: config.inputCount }]
                : []
            );
          } catch {
            return [];
          }
        };
        const serializeNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return { id: getNodeId(node), kind: "text", text: node.data };
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            return {
              callbacks: readCallbacks(node),
              children: Array.from(node.childNodes, serializeNode),
              id: getNodeId(node),
              kind: "element",
              props: readProps(node),
              type: node.localName
            };
          }
          return {
            children: Array.from(node.childNodes, serializeNode),
            id: getNodeId(node),
            kind: "fragment"
          };
        };
        const sendSnapshot = () => {
          revision += 1;
          send({
            data: {
              revision,
              tree: {
                children: Array.from(root.childNodes, serializeNode),
                id: getNodeId(root),
                kind: "fragment"
              }
            },
            type: "snapshot"
          });
        };
        const observer = new MutationObserver(() => {
          if (!rendering) sendSnapshot();
        });
        observer.observe(root, { attributes: true, characterData: true, childList: true, subtree: true });

        const createScreenHierarchy = (screen) => {
          const hierarchy = [screen];
          let current = screen;
          while (current !== "/") {
            const separator = current.lastIndexOf("/");
            current = separator <= 0 ? "/" : current.slice(0, separator);
            hierarchy.push(current);
          }
          return hierarchy;
        };
        const renderClient = (client, props) => {
          const viewport = client && client.viewports && client.viewports[props.viewport];
          const screens = viewport && viewport.screens;
          const hierarchy = typeof props.scope === "string" ? createScreenHierarchy(props.scope) : [];
          const selected = screens && hierarchy.find((path) => Object.hasOwn(screens, path));
          // Unsupported viewports/scopes and explicit opt-outs clear any previous view.
          if (!selected || screens[selected] === false) {
            if (client.$runtime) client.$runtime.render(null, root);
            return;
          }
          const screen = screens[selected];
          if (typeof screen.component !== "function") {
            throw new TypeError('TailorKit app client screen "' + selected + '" is missing a component.');
          }
          if (!client.$runtime || typeof client.$runtime.h !== "function" ||
              typeof client.$runtime.render !== "function") {
            throw new TypeError("TailorKit app client is missing its bundled Preact runtime.");
          }
          const ancestors = createScreenHierarchy(selected).reverse();
          const layers = Array.isArray(props.layers) ? props.layers : [];
          const required = props.declaredScopes || [];
          let status = "ready";
          const context = {};
          for (const path of ancestors) {
            const layer = layers.find((entry) => entry.path === path);
            if (!layer) {
              if (required.includes(path) || path === selected) status = "error";
              continue;
            }
            if (layer.status === "error") status = "error";
            else if (layer.status === "loading" && status !== "error") status = "loading";
            if (layer.status === "ready" && layer.context) {
              for (const key of Object.keys(layer.context)) {
                if (Object.hasOwn(context, key)) throw new Error('Duplicate scope context field "' + key + '".');
                context[key] = layer.context[key];
              }
            }
          }
          const selectedProps = { context: status === "ready" ? context : undefined, screen: selected, status };
          client.$runtime.render(client.$runtime.h(screen.component, selectedProps), root);
        };
        const loadApp = async ({ appSource, appUrl, props = {} }) => {
          if (loadedAppUrl !== appUrl) {
            const moduleUrl = "data:text/javascript;charset=utf-8," + encodeURIComponent(appSource);
            loadedModule = await import(moduleUrl);
            loadedAppUrl = appUrl;
          }
          rendering = true;
          try {
            if (typeof loadedModule.mount === "function") {
              await loadedModule.mount({ document, props, root });
            } else {
              renderClient(loadedModule.default, props);
            }
          } finally {
            observer.takeRecords();
            rendering = false;
          }
          sendSnapshot();
        };

        let pendingLoad = Promise.resolve();
        addEventListener("message", (event) => {
          if (event.source !== parent || event.data?.channel !== channel ||
              event.data.type !== messageType) return;
          const payload = event.data.payload;
          if (payload?.type === "init" && payload.data) {
            pendingLoad = pendingLoad.then(() => loadApp(payload.data)).catch(sendError);
            return;
          }
          if (payload?.type === "dispatchCallback" && payload.data) {
            const target = derefNode(payload.data.nodeId);
            if (!(target instanceof Element)) {
              sendError(new Error('Cannot dispatch callback to unknown node "' + payload.data.nodeId + '".'));
              return;
            }
            target.dispatchEvent(new CustomEvent(payload.data.event, {
              bubbles: false,
              cancelable: true,
              detail: payload.data.args || []
            }));
          }
        });

        parent.postMessage({ channel, type: ${JSON.stringify(iframeReadyType)} }, "*");
        send({ type: "ready" });
      })();
    </script>
  </body>
</html>`;
}

async function fetchSource(
  fetchImplementation: typeof globalThis.fetch,
  url: URL,
): Promise<string> {
  const response = await fetchImplementation(url, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Unable to load TailorKit app client from ${url.toString()}.`);
  }
  return response.text();
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
