import { createRemoteComponent, createWorkerPreactRuntime, exposePreactWorker } from "./worker";
import type { WorkerToHostMessage } from "./protocol";
import type { RemoteElementNode } from "@tailorkit/core/remote";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { describe, expect, it } from "vitest";

const Button = createRemoteComponent<{ onClick?: () => void }>("Button", {
  slots: ["default"],
});

const wait = (duration = 0): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

const snapshots = (messages: WorkerToHostMessage[]) =>
  messages.filter((message) => message.type === "snapshot");

const waitForSnapshotText = async (
  messages: WorkerToHostMessage[],
  text: string,
): Promise<void> => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (snapshots(messages).some((message) => JSON.stringify(message.tree).includes(`"${text}"`))) {
      return;
    }
    await wait(5);
  }
};

const firstElementChild = (message: WorkerToHostMessage | undefined): RemoteElementNode | null => {
  if (message?.type !== "snapshot" || message.tree.kind !== "fragment") {
    return null;
  }
  const child = message.tree.children[0];
  return child?.kind === "element" ? child : null;
};

describe("worker runtime", () => {
  it("streams snapshots after async Preact state updates", async () => {
    const messages: WorkerToHostMessage[] = [];
    const App = () => {
      const [count, setCount] = useState(0);

      useEffect(() => {
        const timeout = setTimeout(() => {
          setCount(1);
        }, 0);
        return () => {
          clearTimeout(timeout);
        };
      }, []);

      return h(Button, null, String(count));
    };

    const runtime = createWorkerPreactRuntime(
      () => h(App, null),
      (message) => {
        messages.push(message);
      },
    );

    runtime.mount({});
    await waitForSnapshotText(messages, "1");

    expect(
      snapshots(messages).some((message) => JSON.stringify(message.tree).includes('"1"')),
    ).toBe(true);
  });

  it("dispatches events into worker handlers and streams updated state", async () => {
    const messages: WorkerToHostMessage[] = [];
    const App = () => {
      const [count, setCount] = useState(0);
      return h(
        Button,
        {
          onClick: () => {
            setCount((value) => value + 1);
          },
        },
        String(count),
      );
    };

    const runtime = createWorkerPreactRuntime(
      () => h(App, null),
      (message) => {
        messages.push(message);
      },
    );

    runtime.mount({});
    await wait();

    const firstSnapshot = snapshots(messages).at(-1);
    expect(firstSnapshot?.type).toBe("snapshot");
    const button = firstElementChild(firstSnapshot);
    expect(button).not.toBeNull();
    const clickHandler = button?.events?.find((binding) => binding.event === "click")?.handlerId;
    expect(clickHandler).toBeDefined();

    await runtime.dispatchEvent(clickHandler as string, {
      currentTargetId: "host-button",
      name: "click",
      targetId: "host-button",
    });
    await wait();

    expect(
      snapshots(messages).some((message) => JSON.stringify(message.tree).includes('"1"')),
    ).toBe(true);
  });

  it("rejects native HTML elements from worker output", async () => {
    const messages: WorkerToHostMessage[] = [];
    const runtime = createWorkerPreactRuntime(
      () => h("div", null, "not allowed"),
      (message) => {
        messages.push(message);
      },
    );

    runtime.mount({});
    await wait();

    expect(messages).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('Native HTML element "div" is not supported'),
        type: "error",
      }),
    );
  });

  it("validates host messages before invoking worker handlers", () => {
    const messages: WorkerToHostMessage[] = [];
    const listeners: ((event: MessageEvent<unknown>) => void)[] = [];
    const port: Pick<MessagePort, "addEventListener" | "postMessage" | "start"> = {
      addEventListener(_name: string, listener: EventListenerOrEventListenerObject) {
        if (typeof listener === "function") {
          listeners.push(listener as (event: MessageEvent<unknown>) => void);
        }
      },
      postMessage(message: unknown) {
        messages.push(message as WorkerToHostMessage);
      },
      start() {},
    };

    exposePreactWorker(port, () => h(Button, null, "ready"));
    listeners[0]?.({ data: { type: "event", handlerId: 123 } } as MessageEvent<unknown>);

    expect(messages).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("Invalid host message"),
        type: "error",
      }),
    );
  });
});
