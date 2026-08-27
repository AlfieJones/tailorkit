// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createIframeUiHost } from "./index.js";

const iframeReadyType = "tailorkit:iframe-ready";
const workerMessageType = "tailorkit:worker-message";

function getChannel(iframe: HTMLIFrameElement): string {
  const match = /const channel = "([a-f0-9]+)"/u.exec(iframe.srcdoc);
  if (!match?.[1]) {
    throw new Error("Unable to find iframe channel.");
  }
  return match[1];
}

function emitFromIframe(iframe: HTMLIFrameElement, data: unknown): void {
  window.dispatchEvent(
    new MessageEvent("message", {
      data,
      source: iframe.contentWindow,
    }),
  );
}

function getContentWindow(iframe: HTMLIFrameElement): Window {
  const contentWindow = iframe.contentWindow;
  if (!contentWindow) {
    throw new Error("Expected iframe content window.");
  }
  return contentWindow;
}

function createFetch() {
  return vi.fn<typeof fetch>((input) => {
    const url = input.toString();
    return Promise.resolve(new Response(url.includes("runtime") ? "// runtime" : "// app"));
  });
}

describe("createIframeUiHost", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("runs the extension behind a hidden, opaque-origin iframe", async () => {
    const fetch = createFetch();
    const host = createIframeUiHost("https://assets.test/app.js", {
      fetch,
      runtimeUrl: "https://host.test/runtime.js",
    });
    host.mount();
    const postMessage = vi.spyOn(getContentWindow(host.iframe), "postMessage");
    const channel = getChannel(host.iframe);

    emitFromIframe(host.iframe, { channel, type: iframeReadyType });

    await vi.waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        {
          channel,
          type: "tailorkit:bootstrap",
          workerSource: "// runtime",
        },
        "*",
      );
    });

    expect(host.iframe.hidden).toBe(true);
    expect(host.iframe.getAttribute("sandbox")).toBe("allow-scripts");
    expect(host.iframe.getAttribute("sandbox")).not.toContain("allow-same-origin");
    expect(host.iframe.srcdoc).toContain("connect-src 'none'");
    expect(fetch).toHaveBeenCalledWith(new URL("https://assets.test/app.js"), {
      credentials: "omit",
    });
    expect(fetch).toHaveBeenCalledWith(new URL("https://host.test/runtime.js"), {
      credentials: "omit",
    });

    emitFromIframe(host.iframe, {
      channel,
      payload: { type: "ready" },
      type: workerMessageType,
    });

    await vi.waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        {
          channel,
          payload: {
            data: {
              appSource: "// app",
              appUrl: "https://assets.test/app.js",
              props: undefined,
            },
            type: "init",
          },
          type: workerMessageType,
        },
        "*",
      );
    });
  });

  it("stores snapshots received through the iframe bridge", () => {
    const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
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
      type: workerMessageType,
    });

    expect(host.getSnapshot()).toMatchObject({ children: [{ text: "Hello" }] });
  });

  it("bridges animation frames back into the sandbox", () => {
    const requestFrame = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(123);
        return 1;
      });
    const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
    host.mount();
    const channel = getChannel(host.iframe);
    const postMessage = vi.spyOn(getContentWindow(host.iframe), "postMessage");

    emitFromIframe(host.iframe, {
      channel,
      payload: { data: {}, type: "requestAnimationFrame" },
      type: workerMessageType,
    });

    expect(postMessage).toHaveBeenCalledWith(
      {
        channel,
        payload: { data: { timestamp: 123 }, type: "animationFrame" },
        type: workerMessageType,
      },
      "*",
    );
    requestFrame.mockRestore();
  });

  it("rejects messages from other windows and reports invalid sandbox messages", () => {
    const onError = vi.fn();
    const host = createIframeUiHost("https://assets.test/app.js", {
      fetch: createFetch(),
      onError,
    });
    const channel = getChannel(host.iframe);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { channel, payload: { type: "wat" }, type: workerMessageType },
        source: window,
      }),
    );
    expect(onError).not.toHaveBeenCalled();

    emitFromIframe(host.iframe, {
      channel,
      payload: { type: "wat" },
      type: workerMessageType,
    });
    expect(onError).toHaveBeenCalledOnce();
  });

  it("removes the iframe when destroyed", () => {
    const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
    host.mount();
    expect(document.body.contains(host.iframe)).toBe(true);

    host.destroy();
    expect(document.body.contains(host.iframe)).toBe(false);
  });
});
