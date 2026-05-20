import { act, render, screen as testingScreen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTailorKitServer } from "@tailorkit/core/server";
import type { WorkerUiHost } from "@tailorkit/sandbox/host";
import type { HostToWorkerPayload, RemoteNode } from "@tailorkit/sandbox/protocol";
import { createTailorKitClient } from "../tailor-kit";

const hostRecords: { appUrl: string; props: Record<string, unknown> | undefined }[] = [];

vi.mock("@tailorkit/sandbox/host", () => ({
  createWorkerUiHost: (
    appUrl: string | URL,
    options: { props?: Record<string, unknown> } = {},
  ): WorkerUiHost => {
    hostRecords.push({ appUrl: appUrl.toString(), props: options.props });

    const tree: RemoteNode = {
      children: [{ id: `text-${hostRecords.length}`, kind: "text", text: appUrl.toString() }],
      id: `root-${hostRecords.length}`,
      kind: "element",
      props: {},
      type: "Button",
    };
    let listener: (() => void) | null = null;

    return {
      dispatch: (_payload: HostToWorkerPayload) => {},
      getSnapshot: () => tree,
      mount: () => {
        listener?.();
      },
      subscribe: (nextListener: () => void) => {
        listener = nextListener;
        return () => {
          listener = null;
        };
      },
      worker: {
        terminate: () => {},
      } as Worker,
    } as unknown as WorkerUiHost;
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
    "/home": { context: emptySchema },
    "/user": { context: emptySchema },
  },
});

const components = {
  Button: ({ slots }: { slots: { default?: ReactNode } }) =>
    createElement("button", null, slots.default),
};

const schema = server.$internal.schema;

function ScreenMatchHost({
  nested,
  tailor,
}: {
  nested: boolean;
  tailor: ReturnType<typeof createTailorKitClient<typeof server>>;
}) {
  return (
    <tailor.ScreenMatch pattern="/" screen="/home" context={{ page: "home" }}>
      {nested && (
        <tailor.ScreenMatch
          pattern="/users/:userId"
          params={{ userId: "user_1" }}
          screen="/user"
          context={{ userId: "user_1" }}
        >
          <tailor.Screen app={{ id: "todo" }} />
        </tailor.ScreenMatch>
      )}
      {!nested && <tailor.Screen app={{ id: "todo" }} />}
    </tailor.ScreenMatch>
  );
}

describe("tailorKitClient React adapter", () => {
  beforeEach(() => {
    hostRecords.length = 0;
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(schema.serialize()));
  });

  it("fetches and caches apps", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([{ id: "todo", name: "Todo" }]));
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test/api/tailorkit",
      components,
    });

    function AppList() {
      const { apps, status } = tailor.useApps();
      return createElement("p", null, `${status}:${apps.map((app) => app.id).join(",")}`);
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

  it("selects the deepest mounted ScreenMatch and restores the parent on unmount", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    const view = render(<ScreenMatchHost nested tailor={tailor} />);

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        context: { userId: "user_1" },
        isLoading: false,
        screen: "/user",
      });
    });

    await act(() => {
      view.rerender(<ScreenMatchHost nested={false} tailor={tailor} />);
    });

    await waitFor(() => {
      expect(hostRecords.at(-1)?.props).toMatchObject({
        context: { page: "home" },
        isLoading: false,
        screen: "/home",
      });
    });
  });

  it("renders the current match for multiple direct app props", async () => {
    const tailor = createTailorKitClient<typeof server>({
      baseUrl: "http://runtime.test",
      components,
    });

    render(
      <tailor.ScreenMatch pattern="/" screen="/home" context={{ page: "home" }}>
        <tailor.Screen app={{ clientUrl: "http://cdn.test/a.js", id: "a" }} />
        <tailor.Screen app={{ clientPath: "/apps/b.js", id: "b" }} />
      </tailor.ScreenMatch>,
    );

    await waitFor(() => {
      expect(hostRecords).toHaveLength(2);
    });
    expect(hostRecords.map((record) => record.appUrl)).toEqual([
      "http://cdn.test/a.js",
      "http://runtime.test/apps/b.js",
    ]);
    expect(hostRecords.map((record) => record.props?.screen)).toEqual(["/home", "/home"]);
  });
});
