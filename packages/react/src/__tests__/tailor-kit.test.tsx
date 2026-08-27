import { act, cleanup, render, screen as testingScreen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTailorKitServer } from "@tailorkit/core/server";
import type { IframeUiHost } from "@tailorkit/sandbox/host";
import type { HostToWorkerPayload, RemoteNode } from "@tailorkit/sandbox/protocol";
import { createTailorKitClient } from "../tailor-kit";
import type { TailorKitApp } from "../tailor-kit";

const hostRecords: { appUrl: string; props: Record<string, unknown> | undefined }[] = [];

vi.mock("@tailorkit/sandbox/host", () => ({
  createIframeUiHost: (
    appUrl: string | URL,
    options: { props?: Record<string, unknown> } = {},
  ): IframeUiHost => {
    hostRecords.push({ appUrl: appUrl.toString(), props: options.props });

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
      dispatch: (_payload: HostToWorkerPayload) => {},
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
  components: {
    Button: {},
  },
  screens: {
    "/": { context: emptySchema },
    "/home": { context: emptySchema },
    "/home/detail": { context: emptySchema },
    "/user": { context: emptySchema },
  },
});

const components = {
  Button: ({ slots }: { slots: { default?: ReactNode } }) =>
    createElement("button", null, slots.default),
};

const schema = server.$internal.schema;

function CurrentScreenRoute({
  nested,
  tailor,
}: {
  nested: boolean;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  tailor.useCurrentScreen(
    nested
      ? {
          context: { detail: "profile", page: "home" },
          screen: "/home/detail",
        }
      : {
          context: { page: "home" },
          screen: "/home",
        },
  );

  return <tailor.AppView app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
}

function CurrentScreenHost({
  nested,
  tailor,
}: {
  nested: boolean;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  return (
    <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
      <CurrentScreenRoute nested={nested} tailor={tailor} />
    </tailor.Root>
  );
}

function HomeAppView({
  app,
  tailor,
}: {
  app: TailorKitApp;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  tailor.useCurrentScreen({ context: { page: "home" }, screen: "/home" });
  return <tailor.AppView app={app} />;
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
      const { data, status } = tailor.useApps();
      return createElement("p", null, `${status}:${(data ?? []).map((app) => app.id).join(",")}`);
    }

    render(createElement("div", null, createElement(AppList), createElement(AppList)));

    await waitFor(() => {
      expect(testingScreen.getAllByText("ready:todo")).toHaveLength(2);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("apps", "http://runtime.test/api/tailorkit/"),
    );
    expect(tailor.getApps()).toEqual([{ id: "todo", name: "Todo" }]);
    expect(tailor.getApp("todo")).toEqual({ id: "todo", name: "Todo" });
  });

  it("derives the hierarchy from the current screen and reuses its extended context", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    const view = render(<CurrentScreenHost nested tailor={tailor} />);

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        screen: {
          context: { detail: "profile", page: "home" },
          path: "/home/detail",
          status: "ready",
        },
      });
    });

    await act(() => {
      view.rerender(<CurrentScreenHost nested={false} tailor={tailor} />);
    });

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        screen: {
          context: { page: "home" },
          path: "/home",
          status: "ready",
        },
      });
    });
  });

  it("publishes loading and error states without stale context", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    function Route({ status }: { status: "error" | "loading" }) {
      tailor.useCurrentScreen({ screen: "/home/detail", status });
      return <tailor.AppView app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
    }

    const view = render(
      <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <Route status="loading" />
      </tailor.Root>,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toEqual({
        screen: { context: undefined, path: "/home/detail", status: "loading" },
      });
    });

    view.rerender(
      <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <Route status="error" />
      </tailor.Root>,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toEqual({
        screen: { context: undefined, path: "/home/detail", status: "error" },
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
      tailor.useCurrentScreen({ context: { page: "home" }, screen: "/home" });
      return (
        <>
          <tailor.AppView app={{ clientPath: "/apps/b.js", id: "b" }} />
          <tailor.AppView
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
      <tailor.Root
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
      </tailor.Root>,
    );

    await waitFor(() => {
      expect(hostRecords).toHaveLength(2);
    });
    expect(hostRecords.map((record) => record.appUrl)).toEqual([
      "http://runtime.test/apps/b.js",
      "http://assets.test/projects/project_1/apps/a/deployments/deployment_1/files/client.js",
    ]);
    expect(hostRecords.map((record) => record.props?.screen)).toEqual([
      { context: { page: "home" }, path: "/home", status: "ready" },
      { context: { page: "home" }, path: "/home", status: "ready" },
    ]);
  });

  it("renders an explicit screen override without a registered current screen", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    render(
      <tailor.AppView
        app={{ clientPath: "/apps/todo.js", id: "todo" }}
        context={{ userId: "user_1" }}
        screen="/user"
      />,
    );

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        screen: {
          context: { userId: "user_1" },
          path: "/user",
          status: "ready",
        },
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
      tailor.useCurrentScreen({ context: { page: "home" }, screen: "/home" });
      return null;
    }

    function UserRoute() {
      tailor.useCurrentScreen({ context: { userId: "user_1" }, screen: "/user" });
      return <tailor.AppView app={{ clientPath: "/apps/todo.js", id: "todo" }} />;
    }

    render(
      <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeRoute />
        <UserRoute />
      </tailor.Root>,
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
      <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeAppView app={{ clientPath: "/apps/todo.js", id: "todo" }} tailor={tailor} />
      </tailor.Root>,
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
      <tailor.Root apps={[{ clientPath: "/apps/todo.js", id: "todo" }]}>
        <HomeAppView app={{ clientPath: "/apps/todo.js", id: "todo" }} tailor={tailor} />
      </tailor.Root>,
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
      <tailor.Root apps={[{ clientPath: "/apps/missing-component.js", id: "bad" }]}>
        <HomeAppView
          app={{ clientPath: "/apps/missing-component.js", id: "bad" }}
          tailor={tailor}
        />
      </tailor.Root>,
    );

    await waitFor(() => {
      expect(
        testingScreen.getByText('TailorKit component "MissingComponent" is not registered.'),
      ).toBeTruthy();
    });

    await act(() => {
      view.rerender(
        <tailor.Root apps={[{ clientPath: "/apps/email.js", id: "email" }]}>
          <HomeAppView app={{ clientPath: "/apps/email.js", id: "email" }} tailor={tailor} />
        </tailor.Root>,
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
