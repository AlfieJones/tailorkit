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
    expect(host.iframe.srcdoc).toContain("nodes.set(id, new WeakRef(node))");
    expect(host.iframe.srcdoc).toContain("const target = derefNode(payload.data.nodeId)");
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

// Execute the actual resolver embedded in srcdoc, without relying on an iframe
// implementation to support dynamic module imports in the test environment.
function screenResolver() {
  const host = createIframeUiHost("https://assets.test/app.js", { fetch: createFetch() });
  const source = host.iframe.srcdoc;
  const start = source.indexOf("const createScreenHierarchy =");
  const end = source.indexOf("const loadApp =", start);
  // oxlint-disable-next-line no-new-func -- Execute the actual sandbox program in this resolver test.
  const resolve = new Function("root", `${source.slice(start, end)}; return renderClient;`)(
    document.createElement("div"),
  );
  host.destroy();
  return resolve;
}

function screenClient() {
  const render = vi.fn();
  const navigation = { component: vi.fn() };
  const general = { component: vi.fn() };
  const detail = { component: vi.fn() };
  return {
    navigation,
    general,
    detail,
    render,
    client: {
      viewports: {
        navbar: { screens: { "/": navigation } },
        panel: { screens: { "/users": general, "/users/detail": detail } },
      },
      $runtime: { h: (component: unknown, props: unknown) => ({ component, props }), render },
    },
  };
}

const scopeLayers = [
  { path: "/", context: { workspaceId: "w1" }, status: "ready" },
  { path: "/users", context: { canManageUsers: true }, status: "ready" },
  { path: "/users/detail", context: { userId: "u1" }, status: "ready" },
];

function resolveProps(viewport: string, layers = scopeLayers) {
  return {
    viewport,
    scope: "/users/detail",
    layers,
    declaredScopes: scopeLayers.map((layer) => layer.path),
  };
}

describe("viewport screen resolution", () => {
  it("selects one screen per viewport and composes only its ancestors", () => {
    const resolve = screenResolver();
    const { client, navigation, detail, general, render } = screenClient();
    resolve(client, resolveProps("navbar"));
    expect(render.mock.calls[0]?.[0]).toEqual({
      component: navigation.component,
      props: {
        screen: "/",
        status: "ready",
        context: { workspaceId: "w1" },
      },
    });
    resolve(client, resolveProps("panel"));
    expect(render.mock.calls[1]?.[0]).toEqual({
      component: detail.component,
      props: {
        screen: "/users/detail",
        status: "ready",
        context: { workspaceId: "w1", canManageUsers: true, userId: "u1" },
      },
    });
    expect(render.mock.calls.some(([node]) => node?.component === general.component)).toBe(false);
  });

  it.each(["loading", "error"])("keeps navbar ready when detail is %s", (status) => {
    const resolve = screenResolver();
    const { client, render } = screenClient();
    const layers = scopeLayers.map((layer) =>
      layer.path === "/users/detail" ? { ...layer, status } : layer,
    );
    resolve(client, resolveProps("navbar", layers));
    expect(render.mock.calls[0]?.[0].props.status).toBe("ready");
    resolve(client, resolveProps("panel", layers));
    expect(render.mock.calls[1]?.[0].props).toMatchObject({
      screen: "/users/detail",
      status,
      context: undefined,
    });
  });

  it("falls back within a viewport using the parent's own readiness", () => {
    const resolve = screenResolver();
    const { client, general, render } = screenClient();
    const fallbackClient = { ...client, viewports: { panel: { screens: { "/users": general } } } };
    resolve(
      fallbackClient,
      resolveProps(
        "panel",
        scopeLayers.map((layer) => ({
          ...layer,
          status: layer.path === "/users/detail" ? "error" : "ready",
        })),
      ),
    );
    expect(render.mock.calls[0]?.[0]).toEqual({
      component: general.component,
      props: {
        screen: "/users",
        status: "ready",
        context: { workspaceId: "w1", canManageUsers: true },
      },
    });
  });

  it("clears an existing view for unsupported viewports and blocked fallback", () => {
    const resolve = screenResolver();
    const { client, render } = screenClient();
    resolve(client, resolveProps("panel"));
    resolve(client, resolveProps("missing"));
    expect(render.mock.calls.at(-1)?.[0]).toBeNull();
    resolve(
      {
        ...client,
        viewports: {
          panel: { screens: { "/": client.viewports.navbar.screens["/"], "/users": false } },
        },
      },
      resolveProps("panel"),
    );
    expect(render.mock.calls.at(-1)?.[0]).toBeNull();
  });

  it("does not expose partial context when an ancestor is missing or unavailable", () => {
    const resolve = screenResolver();
    const { client, render } = screenClient();
    resolve(client, resolveProps("panel", scopeLayers.slice(1)));
    expect(render.mock.calls.at(-1)?.[0].props).toMatchObject({
      status: "error",
      context: undefined,
    });
    resolve(
      client,
      resolveProps(
        "panel",
        scopeLayers.map((layer) => ({
          ...layer,
          status: layer.path === "/" ? "loading" : "ready",
        })),
      ),
    );
    expect(render.mock.calls.at(-1)?.[0].props).toMatchObject({
      status: "loading",
      context: undefined,
    });
  });
});

it("updates a mounted viewport without fetching its app bundle again", async () => {
  const fetch = createFetch();
  const host = createIframeUiHost("https://assets.test/app.js", {
    fetch,
    props: { viewport: "navbar", scope: "/users" },
  });
  host.mount();
  const postMessage = vi.spyOn(getContentWindow(host.iframe), "postMessage");
  const channel = getChannel(host.iframe);
  emitFromIframe(host.iframe, { channel, type: iframeReadyType });
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
  host.setProps({ viewport: "navbar", scope: "/users/detail" });
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(2));
  expect(postMessage.mock.calls[1]?.[0]).toMatchObject({
    payload: {
      data: {
        props: { viewport: "navbar", scope: "/users/detail" },
      },
    },
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(host.iframe.isConnected).toBe(true);
  host.destroy();
});
