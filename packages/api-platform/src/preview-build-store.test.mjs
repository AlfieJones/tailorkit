/* oxlint-disable require-await, require-unicode-regexp, unicorn/no-await-expression-member -- the in-memory KV fake mirrors async adapter methods. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "vitest";
import {
  createPreviewBuildStore,
  previewChunkBytes,
  previewMessageBytes,
} from "./preview-build-store.ts";

function fakeKV() {
  const data = new Map();
  const listeners = new Map();
  let revision = 0;
  return {
    get: async (key) => data.get(key) ?? null,
    getAndDelete: async (key) => {
      const value = data.get(key) ?? null;
      data.delete(key);
      return value;
    },
    set: async (key, value) => {
      data.set(key, value);
    },
    delete: async (key) => {
      data.delete(key);
    },
    increment: async () => ++revision,
    publish: async (channel, message) => {
      for (const listener of listeners.get(channel) ?? []) {
        listener(message);
      }
      return listeners.get(channel)?.size ?? 0;
    },
    subscribe: async (channel, listener) => {
      const set = listeners.get(channel) ?? new Set();
      set.add(listener);
      listeners.set(channel, set);
      return async () => {
        set.delete(listener);
      };
    },
  };
}

const checksum = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifestFor = (files) => ({
  files: files.map(([path, bytes]) => ({
    path,
    contentType: "text/javascript",
    size: bytes.length,
    chunks: Math.ceil(bytes.length / previewChunkBytes),
    sha256: checksum(bytes),
  })),
});

test("only complete verified builds replace the current pointer", async () => {
  const kv = fakeKV();
  const store = createPreviewBuildStore(kv);
  const first = Buffer.from("first");
  const firstId = await store.begin(
    "session",
    manifestFor([
      ["client.js", first],
      ["removed.js", Buffer.alloc(0)],
    ]),
  );
  await assert.rejects(store.commit("session", firstId), /incomplete/);
  assert.equal(await store.current("session"), null);
  await store.upload("session", firstId, 0, 0, first.toString("base64"));
  const committed = await store.commit("session", firstId);
  assert.equal(committed.revision, 1);
  assert.equal(await store.chunk("session", firstId, 0, 0), first.toString("base64"));

  const second = Buffer.from("second");
  const secondId = await store.begin("session", manifestFor([["client.js", second]]));
  await assert.rejects(store.upload("session", secondId, 0, 0, first.toString("base64")), /size/);
  await store.upload("session", secondId, 0, 0, second.toString("base64"));
  await store.commit("session", secondId);
  assert.deepEqual(
    (await store.current("session")).manifest.files.map((file) => file.path),
    ["client.js"],
  );
  await store.end("session");
  assert.equal(await store.current("session"), null);
  assert.equal(await store.chunk("session", secondId, 0, 0), null);
});

test("a failed pointer write leaves a verified build retryable with the same revision", async () => {
  const kv = fakeKV();
  const store = createPreviewBuildStore(kv);
  const first = Buffer.from("first");
  const firstId = await store.begin("session", manifestFor([["client.js", first]]));
  await store.upload("session", firstId, 0, 0, first.toString("base64"));
  await store.commit("session", firstId);

  const next = Buffer.from("next");
  const nextId = await store.begin("session", manifestFor([["client.js", next]]));
  await store.upload("session", nextId, 0, 0, next.toString("base64"));
  const write = kv.set;
  let failPointer = true;
  kv.set = async (key, value, options) => {
    if (key === "preview:current:session" && failPointer) {
      failPointer = false;
      throw new Error("pointer write failed");
    }
    return write(key, value, options);
  };
  await assert.rejects(store.commit("session", nextId), /pointer write failed/);
  assert.equal((await store.current("session")).buildId, firstId);
  assert.equal(await kv.get("preview:uploading:session"), nextId);
  assert.equal(JSON.parse(await kv.get(`preview:build:session:${nextId}`)).state, "ready");

  const committed = await store.commit("session", nextId);
  assert.equal(committed.revision, 2);
  assert.equal((await store.current("session")).buildId, nextId);
  assert.equal(await store.chunk("session", nextId, 0, 0), next.toString("base64"));
});

test("reads builds committed before the retryable-state rollout", async () => {
  const kv = fakeKV();
  const store = createPreviewBuildStore(kv);
  const bytes = Buffer.from("published before rollout");
  await kv.set(
    "preview:build:session:legacy",
    JSON.stringify({ manifest: manifestFor([["client.js", bytes]]), state: "committed" }),
  );
  await kv.set("preview:build:session:legacy:0:0", bytes.toString("base64"));
  assert.equal(await store.chunk("session", "legacy", 0, 0), bytes.toString("base64"));
});

test("large aggregate builds use bounded chunks and messages", async () => {
  const store = createPreviewBuildStore(fakeKV());
  const files = Array.from({ length: 6 }, (_, index) => [
    index === 0 ? "client.js" : `file-${index}.js`,
    Buffer.alloc(900_000, index),
  ]);
  const id = await store.begin("session", manifestFor(files));
  for (const [fileIndex, [, bytes]] of files.entries()) {
    for (
      let chunkIndex = 0;
      chunkIndex < Math.ceil(bytes.length / previewChunkBytes);
      chunkIndex++
    ) {
      const base64 = bytes
        .subarray(chunkIndex * previewChunkBytes, (chunkIndex + 1) * previewChunkBytes)
        .toString("base64");
      assert.ok(
        Buffer.byteLength(JSON.stringify({ fileIndex, chunkIndex, base64 })) < previewMessageBytes,
      );
      await store.upload("session", id, fileIndex, chunkIndex, base64);
    }
  }
  assert.equal((await store.commit("session", id)).manifest.files.length, 6);
});

test("corrupt and missing chunks never become visible", async () => {
  const store = createPreviewBuildStore(fakeKV());
  const bytes = Buffer.alloc(previewChunkBytes + 3, 7);
  const id = await store.begin("session", manifestFor([["client.js", bytes]]));
  await store.upload("session", id, 0, 0, bytes.subarray(0, previewChunkBytes).toString("base64"));
  await assert.rejects(store.commit("session", id), /incomplete/);
  await store.upload("session", id, 0, 1, Buffer.from([1, 2, 3]).toString("base64"));
  await assert.rejects(store.commit("session", id), /checksum/);
  assert.equal(await store.current("session"), null);
  await assert.rejects(
    store.upload("session", id, 0, 1, bytes.subarray(previewChunkBytes).toString("base64")),
    /Conflicting/,
  );
});

test("begin replaces only the previous unfinished upload and removes its chunks", async () => {
  const kv = fakeKV();
  const store = createPreviewBuildStore(kv);
  const oldBytes = Buffer.alloc(previewChunkBytes + 1, 7);
  const extraBytes = Buffer.from("old asset");
  const oldId = await store.begin(
    "session",
    manifestFor([
      ["client.js", oldBytes],
      ["asset.js", extraBytes],
    ]),
  );
  await store.upload(
    "session",
    oldId,
    0,
    0,
    oldBytes.subarray(0, previewChunkBytes).toString("base64"),
  );
  await store.upload(
    "session",
    oldId,
    0,
    1,
    oldBytes.subarray(previewChunkBytes).toString("base64"),
  );
  await store.upload("session", oldId, 1, 0, extraBytes.toString("base64"));
  const nextBytes = Buffer.from("new build");
  const nextId = await store.begin("session", manifestFor([["client.js", nextBytes]]));
  assert.equal(await kv.get(`preview:build:session:${oldId}`), null);
  assert.equal(await kv.get(`preview:build:session:${oldId}:0:0`), null);
  assert.equal(await kv.get(`preview:build:session:${oldId}:0:1`), null);
  assert.equal(await kv.get(`preview:build:session:${oldId}:1:0`), null);
  assert.equal(await kv.get("preview:uploading:session"), nextId);
  await assert.rejects(
    store.upload("session", oldId, 0, 0, oldBytes.toString("base64")),
    /unavailable/,
  );
  await assert.rejects(store.commit("session", oldId), /unavailable/);
  await store.upload("session", nextId, 0, 0, nextBytes.toString("base64"));
  await store.commit("session", nextId);
  assert.equal(await kv.get("preview:uploading:session"), null);
  const abandonedId = await store.begin("session", manifestFor([["client.js", extraBytes]]));
  await store.upload("session", abandonedId, 0, 0, extraBytes.toString("base64"));
  assert.equal((await store.current("session")).buildId, nextId);
  await store.end("session");
  assert.equal(await kv.get(`preview:build:session:${abandonedId}`), null);
  assert.equal(await kv.get(`preview:build:session:${abandonedId}:0:0`), null);
});

test("revision subscription can be released", async () => {
  const store = createPreviewBuildStore(fakeKV());
  const revisions = [];
  const unsubscribe = await store.subscribe("session", (revision) => revisions.push(revision));
  const empty = manifestFor([["client.js", Buffer.alloc(0)]]);
  await store.commit("session", await store.begin("session", empty));
  await unsubscribe();
  await store.commit("session", await store.begin("session", empty));
  assert.deepEqual(revisions, [1]);
});
