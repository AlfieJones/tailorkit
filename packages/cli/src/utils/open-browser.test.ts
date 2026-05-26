import { spawn } from "node:child_process";
import { platform } from "node:os";
import { EventEmitter } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { openUrlInBrowser } from "./open-browser";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

vi.mock("node:os", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:os")>()),
  platform: vi.fn(),
}));

const createChildProcess = () => {
  const child = new EventEmitter() as EventEmitter & { unref: ReturnType<typeof vi.fn> };
  child.unref = vi.fn();
  return child;
};

describe("openUrlInBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(platform).mockReturnValue("darwin");
  });

  it("opens URLs with the platform browser command", async () => {
    const child = createChildProcess();
    vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);

    const result = openUrlInBrowser("https://example.com/approve");
    child.emit("spawn");

    await expect(result).resolves.toBe(true);
    expect(spawn).toHaveBeenCalledWith("open", ["https://example.com/approve"], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    expect(child.unref).toHaveBeenCalledOnce();
  });

  it("returns false when the browser command cannot start", async () => {
    const child = createChildProcess();
    vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);

    const result = openUrlInBrowser("https://example.com/approve");
    child.emit("error", new Error("missing opener"));

    await expect(result).resolves.toBe(false);
    expect(child.unref).not.toHaveBeenCalled();
  });
});
