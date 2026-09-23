/* oxlint-disable require-await, unicorn/no-await-expression-member -- the RPC mock acknowledges calls asynchronously. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import type { PreviewWebSocketClient } from "@tailorkit/client-platform/preview";
import { capturePreviewSnapshot, uploadPreviewSnapshot } from "./preview";

const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

it("uploads a build larger than 4.5 MiB in sequential bounded messages", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "tailorkit-preview-"));
  dirs.push(root);
  await writeFile(path.join(root, "client.js"), Buffer.alloc(900_000, 1));
  for (let index = 0; index < 5; index++) {
    await writeFile(path.join(root, `asset-${index}.js`), Buffer.alloc(900_000, index + 2));
  }
  const snapshot = await capturePreviewSnapshot(root);
  expect(snapshot.manifest.files.reduce((total, file) => total + file.size, 0)).toBeGreaterThan(
    4.5 * 1024 * 1024,
  );
  const calls: string[] = [];
  const client = {
    beginBuild: vi.fn(async () => {
      calls.push("begin");
      return { buildId: "build" };
    }),
    uploadChunk: vi.fn(async (input: { base64: string }) => {
      calls.push("chunk");
      expect(Buffer.byteLength(JSON.stringify(input))).toBeLessThan(512 * 1024);
      expect(
        Buffer.byteLength(
          JSON.stringify({
            type: "chunk",
            revision: 1,
            fileIndex: 0,
            chunkIndex: 0,
            base64: input.base64,
          }),
        ),
      ).toBeLessThan(512 * 1024);
      expect(Buffer.from(input.base64, "base64").length).toBeLessThanOrEqual(256 * 1024);
      return { accepted: true as const };
    }),
    commitBuild: vi.fn(async () => {
      calls.push("commit");
      return { revision: 1 };
    }),
  } as unknown as PreviewWebSocketClient;
  await uploadPreviewSnapshot(client, snapshot);
  expect(calls[0]).toBe("begin");
  expect(calls.at(-1)).toBe("commit");
  expect(calls.filter((value) => value === "chunk")).toHaveLength(24);
});

it("detects unchanged output and refuses an oversized rebuild snapshot", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "tailorkit-preview-"));
  dirs.push(root);
  await writeFile(path.join(root, "client.js"), "export default 1");
  const first = await capturePreviewSnapshot(root);
  const unchanged = await capturePreviewSnapshot(root);
  expect(unchanged.fingerprint).toBe(first.fingerprint);
  await writeFile(path.join(root, "client.js"), "export default 2");
  expect((await capturePreviewSnapshot(root)).fingerprint).not.toBe(first.fingerprint);
  await writeFile(path.join(root, "client.js"), Buffer.alloc(1024 * 1024 + 1));
  await expect(capturePreviewSnapshot(root)).rejects.toThrow("exceeds 1 MiB");
});
