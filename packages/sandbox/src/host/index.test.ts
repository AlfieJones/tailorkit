import { describe, expect, it, vi } from "vitest";
import { createWorkerUiHost } from "./index.js";

class FakeWorker extends EventTarget {
  readonly options: WorkerOptions;
  readonly url: URL;

  constructor(url = new URL("http://localhost/runtime-worker.js"), options: WorkerOptions = {}) {
    super();
    this.url = url;
    this.options = options;
  }

  messages: unknown[] = [];

  postMessage(message: unknown): void {
    this.messages.push(message);
  }

  emit(message: unknown): void {
    this.dispatchEvent(new MessageEvent("message", { data: message }));
  }
}

describe("createWorkerUiHost", () => {
  const createWorker = (url: URL, options: WorkerOptions): Worker =>
    new FakeWorker(url, options) as unknown as Worker;

  it("mounts and stores worker snapshots", () => {
    const host = createWorkerUiHost("http://localhost/app.js", {
      createWorker,
      workerUrl: "http://localhost/runtime-worker.js",
    });
    const worker = host.worker as unknown as FakeWorker;

    host.mount();
    worker.emit({
      data: {
        revision: 1,
        tree: {
          children: [{ id: "text", kind: "text", text: "Hello" }],
          id: "root",
          kind: "fragment",
        },
      },
      type: "snapshot",
    });

    expect(worker.url.toString()).toBe("http://localhost/runtime-worker.js");
    expect(worker.options).toEqual({ type: "module" });
    expect(worker.messages).toEqual([
      {
        data: {
          appUrl: "http://localhost/app.js",
          props: undefined,
        },
        type: "init",
      },
    ]);
    expect(host.getSnapshot()).toMatchObject({ children: [{ text: "Hello" }] });
  });

  it("bridges requestAnimationFrame messages back to the worker", () => {
    Object.defineProperty(globalThis, "requestAnimationFrame", {
      configurable: true,
      value: (_callback: FrameRequestCallback) => 0,
      writable: true,
    });
    const requestFrame = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(123);
        return 1;
      });
    const host = createWorkerUiHost("http://localhost/app.js", { createWorker });
    const worker = host.worker as unknown as FakeWorker;

    worker.emit({ data: {}, type: "requestAnimationFrame" });

    expect(worker.messages).toEqual([{ data: { timestamp: 123 }, type: "animationFrame" }]);
    requestFrame.mockRestore();
  });

  it("reports invalid worker messages through onError", () => {
    const onError = vi.fn();
    const host = createWorkerUiHost("http://localhost/app.js", { createWorker, onError });
    const worker = host.worker as unknown as FakeWorker;

    worker.emit({ type: "wat" });

    expect(onError).toHaveBeenCalledOnce();
  });
});
