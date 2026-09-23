import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  build: vi.fn(),
  client: vi.fn(),
  close: vi.fn(),
  load: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  token: vi.fn(),
  whoami: vi.fn(),
}));

vi.mock("@tailorkit/app/config/loader", () => ({ loadTailorKitConfig: mocks.load }));
vi.mock("@tailorkit/app/builder", () => ({ buildApp: mocks.build }));
vi.mock("@tailorkit/core/server", () => ({ createTailorKitClient: mocks.client }));
vi.mock("./auth", () => ({ getDeployToken: mocks.token, runWhoami: mocks.whoami }));

const { runPreview } = await import("./preview");
const dirs: string[] = [];

beforeEach(() => {
  vi.resetAllMocks();
  mocks.build.mockResolvedValue({ close: mocks.close });
  mocks.close.mockImplementation(async () => {});
  mocks.client.mockReturnValue({ preview: { start: mocks.start, stop: mocks.stop } });
  mocks.start.mockResolvedValue({ data: { sessionId: "session" } });
  mocks.stop.mockImplementation(async () => {});
  mocks.token.mockResolvedValue({ deployToken: "token" });
  mocks.whoami.mockResolvedValue({ hostUrl: "https://host.test" });
});

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

it.each([
  ["output resolution", false, /ENOENT/u],
  ["initial snapshot validation", true, /missing client\.js/u],
])("cleans up after %s fails", async (_case, createOutput, expected) => {
  const cwd = await mkdtemp(path.join(tmpdir(), "tailorkit-preview-startup-"));
  dirs.push(cwd);
  if (createOutput) {
    await mkdir(path.join(cwd, "output"));
  }
  mocks.load.mockResolvedValue({ root: cwd, config: { appId: "app" } });

  await expect(runPreview({ cwd, outDir: "output" })).rejects.toThrow(expected);
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(mocks.stop).toHaveBeenCalledWith({ sessionId: "session" });
  const closeOrder = mocks.close.mock.invocationCallOrder[0] ?? Infinity;
  const stopOrder = mocks.stop.mock.invocationCallOrder[0] ?? -Infinity;
  expect(closeOrder).toBeLessThan(stopOrder);
});
