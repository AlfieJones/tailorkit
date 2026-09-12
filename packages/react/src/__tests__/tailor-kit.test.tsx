import { Root, AppView, useApps, useScope } from "../index";
import { act, cleanup, render, screen as testingScreen, waitFor } from "@testing-library/react";
import { createElement, StrictMode } from "react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTailorKitServer } from "@tailorkit/core/server";
import type { IframeUiHost } from "@tailorkit/sandbox/host";
import type { HostToIframePayload, RemoteNode } from "@tailorkit/sandbox/protocol";
import { createTailorKitClient } from "../tailor-kit";
import type { TailorKitApp } from "../tailor-kit";

const hostRecords: { appUrl: string; props: Record<string, unknown> | undefined }[] = [];

vi.mock("@tailorkit/sandbox/host", () => ({
  createIframeUiHost: (
    appUrl: string | URL,
    options: { props?: Record<string, unknown> } = {},
  ): IframeUiHost => {
    const record = { appUrl: appUrl.toString(), props: options.props };
    hostRecords.push(record);

    const tree: RemoteNode = {
      children: [{ id: `text-${hostRecords.length}`, kind: "text", text: appUrl.toString() }],
      id: `root-${hostRecords.length}`,
      kind: "element",
      props: {},
      type: appUrl.toString().includes("missing-component") ? "MissingComponent" : "Button",
    };
    let listener: (() => void) | null = null;

    return {
      destroy: () => {},
      setProps: (props: Record<string, unknown> | undefined) => {
        record.props = props;
      },
      dispatch: (_payload: HostToIframePayload) => {},
      getSnapshot: () => tree,
      iframe: document.createElement("iframe"),
      mount: () => {
        listener?.();
      },
      subscribe: (nextListener: () => void) => {
        listener = nextListener;
        return () => {
          listener = null;
        };
      },
    } as unknown as IframeUiHost;
  },
}));

const emptySchema = {
  "~standard": {
    jsonSchema: {
      input: () => ({}),
      output: () => ({}),
    },
    validate: (value: unknown) => ({ value }),
    vendor: "test",
    version: 1,
  },
} as const;

const server = createTailorKitServer({
  viewports: { panel: {}, navbar: {} },
  components: {
    Button: { children: true },
  },
  scopes: {
    "/": { context: emptySchema },
    "/home": { context: emptySchema },
    "/home/detail": { context: emptySchema },
    "/user": { context: emptySchema },
  },
});

const components = {
  Button: ({ children }: { children?: ReactNode }) => createElement("button", null, children),
};

const schema = server.$internal.schema;

function CurrentScreenRoute({
  nested,
}: {
  nested: boolean;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  useScope(
    nested
      ? {
          context: { detail: { id: "profile" } },
          scope: "/home/detail",
        }
      : {
          context: { page: { title: "home" } },
          scope: "/home",
        },
  );

  return <AppView viewport="panel" app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
}

function CurrentScreenHost({
  nested,
  tailor,
}: {
  nested: boolean;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  return (
    <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
      <CurrentScreenRoute nested={nested} tailor={tailor} />
    </Root>
  );
}

function HomeAppView({
  app,
}: {
  app: TailorKitApp;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  useScope({ context: { page: { title: "home" } }, scope: "/home" });
  return <AppView viewport="panel" app={app} />;
}

describe("tailorKitClient React adapter", () => {
  beforeEach(() => {
    hostRecords.length = 0;
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        assetsBaseUrl: "http://assets.test/",
        schema: schema.serialize(),
      }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("fetches and caches apps", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([{ id: "todo", name: "Todo" }]));
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test/api/tailorkit",
      components,
    });

    function AppList() {
      const { data, status } = useApps();
      return createElement("p", null, `${status}:${(data ?? []).map((app) => app.id).join(",")}`);
    }

    render(
      <Root client={tailor}>
        <AppList />
        <AppList />
      </Root>,
    );

    await waitFor(() => {
      expect(testingScreen.getAllByText("ready:todo")).toHaveLength(2);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("apps", "http://runtime.test/api/tailorkit/"),
    );
  });

  it("derives the hierarchy from the current screen and reuses its extended context", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    const view = render(<CurrentScreenHost nested tailor={tailor} />);

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        layers: [
          {
            context: { detail: { id: "profile" } },
            path: "/home/detail",
            status: "ready",
          },
        ],
      });
    });

    await act(() => {
      view.rerender(<CurrentScreenHost nested={false} tailor={tailor} />);
    });

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        layers: [
          {
            context: { page: { title: "home" } },
            path: "/home",
            status: "ready",
          },
        ],
      });
    });
  });

  it("publishes loading and error states without stale context", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    function Route({ status }: { status: "error" | "loading" }) {
      useScope({ scope: "/home/detail", status });
      return <AppView viewport="panel" app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
    }

    const view = render(
      <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <Route status="loading" />
      </Root>,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        layers: [{ context: undefined, path: "/home/detail", status: "loading" }],
      });
    });

    view.rerender(
      <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <Route status="error" />
      </Root>,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        layers: [{ context: undefined, path: "/home/detail", status: "error" }],
      });
    });
  });

  it("renders the current match for multiple direct app props", async () => {
    hostRecords.length = 0;
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    function Route() {
      useScope({ context: { page: { title: "home" } }, scope: "/home" });
      return (
        <>
          <AppView viewport="panel" app={{ clientPath: "/apps/b.js", id: "b" }} />
          <AppView
            viewport="panel"
            app={{
              currentDeployment: { id: "deployment_1" },
              id: "a",
              projectId: "project_1",
            }}
          />
        </>
      );
    }

    render(
      <Root
        client={tailor}
        apps={[
          { clientPath: "/apps/b.js", id: "b" },
          {
            currentDeployment: { id: "deployment_1" },
            id: "a",
            projectId: "project_1",
          },
        ]}
      >
        <Route />
      </Root>,
    );

    await waitFor(() => {
      expect(hostRecords).toHaveLength(2);
    });
    expect(hostRecords.map((record) => record.appUrl)).toEqual([
      "http://runtime.test/apps/b.js",
      "http://assets.test/projects/project_1/apps/a/deployments/deployment_1/files/client.js",
    ]);
    expect(hostRecords.map((record) => (record.props?.layers as unknown[])?.[0])).toEqual([
      { context: { page: { title: "home" } }, path: "/home", status: "ready" },
      { context: { page: { title: "home" } }, path: "/home", status: "ready" },
    ]);
  });

  it("renders an explicit screen override without a registered current screen", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    render(
      <Root client={tailor}>
        <AppView
          viewport="panel"
          app={{ clientPath: "/apps/todo.js", id: "todo" }}
          context={{ userId: "user_1" }}
          scope="/user"
        />
      </Root>,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        layers: [
          {
            context: { userId: "user_1" },
            path: "/user",
            status: "ready",
          },
        ],
      });
    });
  });

  it("warns when multiple hooks register screens at the same hierarchy depth", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    function HomeRoute() {
      useScope({ context: { page: { title: "home" } }, scope: "/home" });
      return null;
    }

    function UserRoute() {
      useScope({ context: { userId: "user_1" }, scope: "/user" });
      return <AppView viewport="panel" app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
    }

    render(
      <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeRoute />
        <UserRoute />
      </Root>,
    );

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('"/home", "/user"'));
    });
  });

  it("passes primitive theme tokens into mounted screens", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
      theme: {
        tokens: {
          background: {
            surface: "var(--card)",
          },
        },
      },
    });

    render(
      <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeAppView app={{ clientPath: "/apps/todo.js", id: "todo" }} tailor={tailor} />
      </Root>,
    );

    await waitFor(() => {
      expect(hostRecords).toHaveLength(1);
    });
    expect(document.querySelector("[data-tailorkit-theme-style]")?.textContent).toContain(
      "--tailorkit-background-surface: var(--card);",
    );
  });

  it("renders missing component errors inside the app container", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
    });

    render(
      <Root client={tailor} apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeAppView app={{ clientPath: "/apps/todo.js", id: "todo" }} tailor={tailor} />
      </Root>,
    );

    await waitFor(() => {
      expect(
        testingScreen.getByText('TailorKit component "Button" is not registered.'),
      ).toBeTruthy();
    });
    expect(consoleError).toHaveBeenCalled();
  });

  it("clears a missing component error when switching apps", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    const view = render(
      <Root client={tailor} apps={[{ clientPath: "/apps/missing-component.js", id: "bad" }]}>
        <HomeAppView
          app={{ clientPath: "/apps/missing-component.js", id: "bad" }}
          tailor={tailor}
        />
      </Root>,
    );

    await waitFor(() => {
      expect(
        testingScreen.getByText('TailorKit component "MissingComponent" is not registered.'),
      ).toBeTruthy();
    });

    await act(() => {
      view.rerender(
        <Root client={tailor} apps={[{ clientPath: "/apps/email.js", id: "email" }]}>
          <HomeAppView app={{ clientPath: "/apps/email.js", id: "email" }} tailor={tailor} />
        </Root>,
      );
    });

    await waitFor(() => {
      expect(
        testingScreen.queryByText('TailorKit component "MissingComponent" is not registered.'),
      ).toBeNull();
      expect(testingScreen.getByRole("button").textContent).toContain("/apps/email.js");
    });
  });
});

describe("scope registries", () => {
  beforeEach(() => {
    hostRecords.length = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(Response.json({ schema: schema.serialize() })),
    );
  });
  afterEach(cleanup);

  function Layers({ detail = true }: { detail?: boolean }) {
    useScope({ scope: "/", context: { user: { id: "u1" } } });
    useScope({ scope: "/home", context: { page: { title: "Home" } } });
    return (
      <>
        {detail ? <Detail /> : null}
        <AppView viewport="navbar" app={{ id: "nav", clientPath: "/nav.js" }} />
        <AppView viewport="panel" app={{ id: "panel", clientPath: "/panel.js" }} />
      </>
    );
  }
  function Detail() {
    useScope({ scope: "/home/detail", status: "loading" });
    return null;
  }

  it("publishes the same active chain to simultaneous viewports and removes unmounted layers", async () => {
    const client = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });
    const view = render(
      <Root client={client}>
        <Layers />
      </Root>,
    );
    await waitFor(() => expect(hostRecords).toHaveLength(2));
    expect(hostRecords.map((record) => record.props?.viewport)).toEqual(["navbar", "panel"]);
    expect(hostRecords[0]?.props).toMatchObject({
      scope: "/home/detail",
      layers: [
        { path: "/", context: { user: { id: "u1" } }, status: "ready" },
        { path: "/home", context: { page: { title: "Home" } }, status: "ready" },
        { path: "/home/detail", status: "loading" },
      ],
    });
    view.rerender(
      <Root client={client}>
        <Layers detail={false} />
      </Root>,
    );
    await waitFor(() => expect(hostRecords.at(-1)?.props?.scope).toBe("/home"));
    expect(hostRecords.at(-1)?.props?.layers).toHaveLength(2);
    expect(hostRecords).toHaveLength(2); // Context changes must not remount either viewport.
  });

  it("isolates roots sharing a client and survives Strict Mode effect replay", async () => {
    const client = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });
    function OtherRoute() {
      useScope({ scope: "/user", context: { userId: "other" } });
      return <AppView viewport="panel" app={{ id: "other", clientPath: "/other.js" }} />;
    }
    render(
      <StrictMode>
        <Root client={client}>
          <Layers />
        </Root>
        <Root client={client}>
          <OtherRoute />
        </Root>
      </StrictMode>,
    );
    await waitFor(() =>
      expect(hostRecords.some((record) => record.appUrl.endsWith("other.js"))).toBe(true),
    );
    const other = hostRecords.find((record) => record.appUrl.endsWith("other.js"));
    expect(other?.props).toMatchObject({
      scope: "/user",
      layers: [{ path: "/user", context: { userId: "other" } }],
    });
    expect(other?.props?.layers).toHaveLength(1);
    expect(hostRecords.find((record) => record.appUrl.endsWith("panel.js"))?.props?.scope).toBe(
      "/home/detail",
    );
  });
});
