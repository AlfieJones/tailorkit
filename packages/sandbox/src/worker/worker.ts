import * as preactRuntime from "preact";
import { h, render } from "preact";
import type { ComponentType } from "preact";
import * as preactHooks from "preact/hooks";
import { version as preactVersion } from "preact/package.json";
import { assertSupportedPreactVersion } from "../preact-version.js";
import { setAnimationPostMessage, fireAnimationFrame } from "../worker-dom/animation.js";
import { DomEvent } from "../worker-dom/event.js";
import { createWorkerDOM } from "../worker-dom/index.js";
import type { RemotePatch, WorkerToHostPayload } from "../protocol.js";
import { HostToWorkerPayload } from "../protocol.js";
import { findElementByRemoteId, mutationToPatch, serializeRoot } from "./serialize.js";

const worker = createWorkerDOM();
let revision = 0;
let flushQueued = false;
let suppressPatches = false;
const pendingPatches: RemotePatch[] = [];
let loadedAppUrl: string | null = null;
const sandboxRuntimeKey = "__tailorkitSandboxRuntime";
const sandboxPreactModules = createSandboxPreactModules();

assertSupportedPreactVersion(preactVersion, "sandbox Preact");

Object.assign(globalThis, {
  [sandboxRuntimeKey]: {
    hooks: preactHooks,
    packageJson: { version: preactVersion },
    preact: preactRuntime,
  },
});

function send(payload: WorkerToHostPayload): void {
  // WorkerGlobalScope.postMessage does not accept a targetOrigin argument.
  // eslint-disable-next-line unicorn/require-post-message-target-origin
  self.postMessage(payload);
}

function sendError(error: unknown): void {
  send({
    data: {
      message: error instanceof Error ? (error.stack ?? error.message) : String(error),
    },
    type: "error",
  });
}

async function loadApp(appUrl: string, props: Record<string, unknown> = {}): Promise<void> {
  const moduleUrl = await createSandboxedAppModuleUrl(appUrl);
  const module = (await import(/* @vite-ignore */ moduleUrl)) as {
    default?: ComponentType<Record<string, unknown>> | TailorKitAppClient;
    mount?: (context: {
      document: typeof worker.document;
      props: Record<string, unknown>;
      root: typeof worker.root;
    }) => unknown | Promise<unknown>;
  };
  loadedAppUrl = appUrl;
  assertAppPreactVersion(module.default);

  if (typeof module.mount === "function") {
    await module.mount({ document: worker.document, props, root: worker.root });
    return;
  }

  if (typeof module.default === "function") {
    render(h(module.default, props), worker.root);
    return;
  }

  if (isTailorKitAppClient(module.default)) {
    renderTailorKitClient(module.default, props);
  }
}

async function createSandboxedAppModuleUrl(appUrl: string): Promise<string> {
  const response = await fetch(appUrl);

  if (!response.ok) {
    throw new Error(`Unable to load TailorKit app client from ${appUrl}.`);
  }

  const source = await response.text();
  return createModuleUrl(rewritePreactImports(source));
}

function createSandboxPreactModules(): Record<string, string> {
  return {
    preact: createModuleUrl(`
const runtime = globalThis["${sandboxRuntimeKey}"].preact;
export const Component = runtime.Component;
export const Fragment = runtime.Fragment;
export const cloneElement = runtime.cloneElement;
export const createContext = runtime.createContext;
export const createElement = runtime.createElement;
export const createRef = runtime.createRef;
export const createVNode = runtime.createVNode;
export const h = runtime.h;
export const hydrate = runtime.hydrate;
export const isValidElement = runtime.isValidElement;
export const options = runtime.options;
export const render = runtime.render;
export const toChildArray = runtime.toChildArray;
export default runtime;
`),
    "preact/hooks": createModuleUrl(`
const hooks = globalThis["${sandboxRuntimeKey}"].hooks;
export const useCallback = hooks.useCallback;
export const useContext = hooks.useContext;
export const useDebugValue = hooks.useDebugValue;
export const useEffect = hooks.useEffect;
export const useErrorBoundary = hooks.useErrorBoundary;
export const useId = hooks.useId;
export const useImperativeHandle = hooks.useImperativeHandle;
export const useLayoutEffect = hooks.useLayoutEffect;
export const useMemo = hooks.useMemo;
export const useReducer = hooks.useReducer;
export const useRef = hooks.useRef;
export const useState = hooks.useState;
export default hooks;
`),
    "preact/jsx-dev-runtime": createModuleUrl(`
const runtime = globalThis["${sandboxRuntimeKey}"].preact;
export const Fragment = runtime.Fragment;
export const jsxDEV = runtime.createElement;
export default { Fragment, jsxDEV };
`),
    "preact/jsx-runtime": createModuleUrl(`
const runtime = globalThis["${sandboxRuntimeKey}"].preact;
export const Fragment = runtime.Fragment;
export const jsx = runtime.createElement;
export const jsxs = runtime.createElement;
export default { Fragment, jsx, jsxs };
`),
    "preact/package.json": createModuleUrl(`
const packageJson = globalThis["${sandboxRuntimeKey}"].packageJson;
export const version = packageJson.version;
export default packageJson;
`),
  };
}

function rewritePreactImports(source: string): string {
  return source.replaceAll(
    /(from\s*["']|import\s*["'])(preact(?:\/hooks|\/jsx-dev-runtime|\/jsx-runtime|\/package\.json)?)(["'])/gu,
    (match, prefix: string, specifier: string, suffix: string) => {
      const moduleUrl = sandboxPreactModules[specifier];

      if (moduleUrl === undefined) {
        return match;
      }

      return `${prefix}${moduleUrl}${suffix}`;
    },
  );
}

function createModuleUrl(source: string): string {
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
}

function sendSnapshot(): void {
  revision += 1;
  send({
    data: {
      revision,
      tree: serializeRoot(worker.root),
    },
    type: "snapshot",
  });
}

function flushPatches(): void {
  flushQueued = false;
  if (pendingPatches.length === 0) {
    return;
  }
  revision += 1;
  send({
    data: {
      patches: pendingPatches.splice(0),
      revision,
    },
    type: "patches",
  });
}

function schedulePatchFlush(): void {
  if (flushQueued) {
    return;
  }
  flushQueued = true;
  queueMicrotask(flushPatches);
}

worker.document.setMutationHandler((record) => {
  try {
    if (suppressPatches) {
      return;
    }
    pendingPatches.push(mutationToPatch(record));
    schedulePatchFlush();
  } catch (error) {
    sendError(error);
  }
});

setAnimationPostMessage(() => send({ data: {}, type: "requestAnimationFrame" }));

self.addEventListener("message", (event) => {
  const payload = HostToWorkerPayload.parse(event.data);

  void (async () => {
    switch (payload.type) {
      case "init": {
        if (loadedAppUrl !== payload.data.appUrl) {
          suppressPatches = true;
          try {
            await loadApp(payload.data.appUrl, payload.data.props);
          } finally {
            suppressPatches = false;
          }
        } else if (payload.data.props) {
          await loadApp(payload.data.appUrl, payload.data.props);
        }
        sendSnapshot();
        break;
      }
      case "animationFrame": {
        fireAnimationFrame(payload.data.timestamp);
        break;
      }
      case "dispatchCallback": {
        const target = findElementByRemoteId(worker.root, payload.data.nodeId);
        if (!target) {
          throw new Error(`Cannot dispatch callback to unknown node "${payload.data.nodeId}".`);
        }
        target.dispatchEvent(
          new DomEvent(payload.data.event, {
            bubbles: false,
            cancelable: true,
            detail: payload.data.args ?? [],
          }),
        );
        break;
      }
      default: {
        throw new Error(`Unknown payload: ${JSON.stringify(payload)}`);
      }
    }
  })().catch(sendError);
});

send({ type: "ready" });

interface TailorKitAppClient {
  $meta?: {
    preactVersion?: unknown;
  };
  $runtime?: {
    h?: typeof h;
    render?: typeof render;
  };
  screens?: Record<string, TailorKitScreenDefinition>;
}

interface TailorKitScreenDefinition {
  component?: ComponentType<Record<string, unknown>>;
  path?: string;
}

function assertAppPreactVersion(
  appExport: ComponentType<Record<string, unknown>> | TailorKitAppClient | undefined,
): void {
  if (!isTailorKitAppClient(appExport)) {
    return;
  }

  const preactVersion = appExport.$meta?.preactVersion;

  if (typeof preactVersion !== "string") {
    throw new TypeError("TailorKit app metadata is missing $meta.preactVersion.");
  }

  assertSupportedPreactVersion(preactVersion, "app Preact");
}

function isTailorKitAppClient(value: unknown): value is TailorKitAppClient {
  return typeof value === "object" && value !== null && "$meta" in value;
}

function renderTailorKitClient(client: TailorKitAppClient, props: Record<string, unknown>): void {
  const screens = client.screens;
  if (!screens) {
    throw new Error("TailorKit app client is missing screens.");
  }

  let requestedScreen = Object.keys(screens)[0];
  if (typeof props.screen === "string") {
    requestedScreen = props.screen;
  } else if (typeof props.path === "string") {
    requestedScreen = props.path;
  }

  if (!requestedScreen) {
    throw new Error("TailorKit app client does not define any screens.");
  }

  const screen = screens[requestedScreen];
  if (screen === undefined) {
    throw new Error(`TailorKit app client does not define screen "${requestedScreen}".`);
  }

  const Screen = screen.component;
  if (typeof Screen !== "function") {
    throw new TypeError(`TailorKit app client screen "${requestedScreen}" is missing a component.`);
  }

  const appH = client.$runtime?.h ?? h;
  const appRender = client.$runtime?.render ?? render;

  appRender(appH(Screen, props), worker.root);
}
