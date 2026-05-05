import { h, render } from "preact";
import type { ComponentType } from "preact";
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
  const module = (await import(/* @vite-ignore */ appUrl)) as {
    default?: ComponentType<Record<string, unknown>>;
    mount?: (context: {
      document: typeof worker.document;
      props: Record<string, unknown>;
      root: typeof worker.root;
    }) => unknown | Promise<unknown>;
  };
  loadedAppUrl = appUrl;

  if (typeof module.mount === "function") {
    await module.mount({ document: worker.document, props, root: worker.root });
    return;
  }

  if (typeof module.default === "function") {
    render(h(module.default, props), worker.root);
  }
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
      case "dispatchEvent": {
        const target = findElementByRemoteId(worker.root, payload.data.nodeId);
        if (!target) {
          throw new Error(`Cannot dispatch event to unknown node "${payload.data.nodeId}".`);
        }
        target.value = payload.data.value ?? target.value;
        target.checked = payload.data.checked ?? target.checked;
        target.dispatchEvent(
          new DomEvent(payload.data.type, {
            bubbles: payload.data.bubbles ?? true,
            cancelable: payload.data.cancelable ?? true,
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
