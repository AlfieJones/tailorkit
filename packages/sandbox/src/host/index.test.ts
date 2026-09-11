// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createIframeUiHost } from "./index.js";

const iframeReadyType = "tailorkit:iframe-ready";
const sandboxMessageType = "tailorkit:worker-message";

function getChannel(iframe: HTMLIFrameElement): string {
  const match = /const channel = "([a-f0-9]+)"/u.exec(iframe.srcdoc);
  if (!match?.[1]) {
    throw new Error("Unable to find iframe channel.");
  }
  return match[1];
}

function emitFromIframe(iframe: HTMLIFrameElement, data: unknown): void {
  window.dispatchEvent(new MessageEvent("message", { data, source: iframe.contentWindow }));
}

function getContentWindow(iframe: HTMLIFrameElement): Window {
  if (!iframe.contentWindow) {
    throw new Error("Expected iframe content window.");
  }
  return iframe.contentWindow;
}

function createFetch(source = "// bundled app client") {
  return vi.fn<typeof fetch>(() => Promise.resolve(new Response(source)));
}

describe("createIframeUiHost", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("loads app code directly into a hidden opaque-origin iframe", async () => {
    const fetch = createFetch();
    const host = createIframeUiHost("https://assets.test/app.js", { fetch });
    host.mount();
    const postMessage = vi.spyOn(getContentWindow(host.iframe), "postMessage");
    const channel = getChannel(host.iframe);

    emitFromIframe(host.iframe, { channel, type: iframeReadyType });

    await vi.waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        {
          channel,
          payload: {
            data: {
              appSource: "// bundled app client",
              appUrl: "https://assets.test/app.js",
              props: undefined,
            },
            type: "init",
          },
          type: sandboxMessageType,
        },
        "*",
      );
    });

    expect(host.iframe.hidden).toBe(true);
    expect(host.iframe.getAttribute("sandbox")).toBe("allow-scripts");
    expect(host.iframe.getAttribute("sandbox")).not.toContain("allow-same-origin");
    expect(host.iframe.srcdoc).toContain("connect-src 'none'");
    expect(host.iframe.srcdoc).toContain("worker-src 'none'");
    expect(host.iframe.srcdoc).toContain("loadedModule = await import(moduleUrl)");
    expect(host.iframe.srcdoc).toContain("new MutationObserver");
    expect(host.iframe.srcdoc).not.toContain("new Worker");
    expect(fetch).toHaveBeenCalledWith(new URL("https://assets.test/app.js"), {
      credentials: "omit",
    });
  });

  it("queues callback events until the iframe is ready", async () => {
    const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
    host.mount();
    const postMessage = vi.spyOn(getContentWindow(host.iframe), "postMessage");
    const channel = getChannel(host.iframe);
    const callback = {
      data: { event: "tailorkitcallbackonclick", nodeId: "n:2" },
      type: "dispatchCallback" as const,
    };

    host.dispatch(callback);
    expect(postMessage).not.toHaveBeenCalled();
    emitFromIframe(host.iframe, { channel, type: iframeReadyType });

    await vi.waitFor(() => {
      expect(postMessage).toHaveBeenLastCalledWith(
        { channel, payload: callback, type: sandboxMessageType },
        "*",
      );
    });
  });

  it("stores strictly validated snapshots received through the iframe bridge", () => {
    const onError = vi.fn();
    const host = createIframeUiHost("https://assets.test/app.js", {
      fetch: createFetch(),
      onError,
    });
    const channel = getChannel(host.iframe);

    emitFromIframe(host.iframe, {
      channel,
      payload: {
        data: {
          revision: 1,
          tree: {
            children: [{ id: "text", kind: "text", text: "Hello" }],
            id: "root",
            kind: "fragment",
          },
        },
        type: "snapshot",
      },
      type: sandboxMessageType,
    });
    expect(host.getSnapshot()).toMatchObject({ children: [{ text: "Hello" }] });

    emitFromIframe(host.iframe, {
      channel,
      payload: { data: { revision: "2", tree: {} }, type: "snapshot" },
      type: sandboxMessageType,
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(host.getRevision()).toBe(1);
  });

  it("rejects messages from other windows", () => {
    const onError = vi.fn();
    const host = createIframeUiHost("https://assets.test/app.js", {
      fetch: createFetch(),
      onError,
    });
    const channel = getChannel(host.iframe);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { channel, payload: { type: "wat" }, type: sandboxMessageType },
        source: window,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it("removes the iframe when destroyed", () => {
    const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
    host.mount();
    expect(document.body.contains(host.iframe)).toBe(true);
    host.destroy();
    expect(document.body.contains(host.iframe)).toBe(false);
  });
});
