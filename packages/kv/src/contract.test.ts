/* oxlint-disable max-classes-per-file, no-useless-constructor, class-methods-use-this, require-await, typescript/no-explicit-any, typescript/no-non-null-assertion, unicorn/no-await-expression-member, import/first -- adapter mocks implement the Redis clients' asynchronous shape. */
import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

interface RecordValue {
  value: string;
  until: number | null;
}
const state = vi.hoisted(() => ({
  redis: { clock: 0, data: new Map<string, RecordValue>(), subscribers: new Set<any>() },
  upstash: { clock: 0, data: new Map<string, RecordValue>(), subscribers: new Set<any>() },
}));

function read(store: typeof state.redis, key: string): string | null {
  const record = store.data.get(key);
  if (!record || (record.until !== null && record.until <= store.clock)) {
    return null;
  }
  return record.value;
}

vi.mock("@tailorkit/env/server", () => ({
  env: { KV_REST_API_URL: "https://kv.test", KV_REST_API_TOKEN: "token" },
}));
vi.mock("ioredis", () => ({
  default: class FakeRedis {
    channels = new Set<string>();
    handlers = new Map<string, (...args: string[]) => void>();
    constructor(_url: string) {}
    duplicate() {
      return new FakeRedis("");
    }
    on(name: string, handler: (...args: string[]) => void) {
      this.handlers.set(name, handler);
    }
    removeAllListeners(name?: string) {
      if (name) {
        this.handlers.delete(name);
      } else {
        this.handlers.clear();
      }
    }
    async subscribe(channel: string) {
      this.channels.add(channel);
      state.redis.subscribers.add(this);
      return 1;
    }
    async unsubscribe(channel: string) {
      this.channels.delete(channel);
      state.redis.subscribers.delete(this);
      return 1;
    }
    disconnect() {
      state.redis.subscribers.delete(this);
    }
    async get(key: string) {
      return read(state.redis, key);
    }
    async getdel(key: string) {
      const value = read(state.redis, key);
      state.redis.data.delete(key);
      return value;
    }
    async set(key: string, value: string) {
      state.redis.data.set(key, { value, until: null });
      return "OK";
    }
    async setex(key: string, ttl: number, value: string) {
      state.redis.data.set(key, { value, until: state.redis.clock + ttl * 1000 });
      return "OK";
    }
    async del(key: string) {
      state.redis.data.delete(key);
      return 1;
    }
    async eval(
      script: string,
      _count: number,
      key: string,
      ttl: number,
      pointer?: string,
      pointerTtl?: number,
    ) {
      if (script.includes("cjson.decode")) {
        const current = read(state.redis, key);
        if (current && JSON.parse(current).revision >= ttl) {
          return 0;
        }
        state.redis.data.set(key, {
          value: pointer!,
          until: state.redis.clock + pointerTtl! * 1000,
        });
        return 1;
      }
      const value = Number(read(state.redis, key) ?? "0") + 1;
      state.redis.data.set(key, { value: String(value), until: state.redis.clock + ttl * 1000 });
      return value;
    }
    async publish(channel: string, message: string) {
      let count = 0;
      for (const subscriber of state.redis.subscribers) {
        if (subscriber.channels.has(channel)) {
          subscriber.handlers.get("message")?.(channel, message);
          count++;
        }
      }
      return count;
    }
  },
}));
vi.mock("@upstash/redis", () => ({
  Redis: class FakeUpstash {
    constructor(_options: unknown) {}
    async get(key: string) {
      return read(state.upstash, key);
    }
    async getdel(key: string) {
      const value = read(state.upstash, key);
      state.upstash.data.delete(key);
      return value;
    }
    async set(key: string, value: string, options?: { ex?: number }) {
      state.upstash.data.set(key, {
        value,
        until: options?.ex ? state.upstash.clock + options.ex * 1000 : null,
      });
      return "OK";
    }
    async del(key: string) {
      state.upstash.data.delete(key);
      return 1;
    }
    async eval(script: string, keys: string[], args: (number | string)[]) {
      if (script.includes("cjson.decode")) {
        const current = read(state.upstash, keys[0]!);
        if (current && JSON.parse(current).revision >= Number(args[0])) {
          return 0;
        }
        state.upstash.data.set(keys[0]!, {
          value: String(args[1]),
          until: state.upstash.clock + Number(args[2]) * 1000,
        });
        return 1;
      }
      const value = Number(read(state.upstash, keys[0]!) ?? "0") + 1;
      state.upstash.data.set(keys[0]!, {
        value: String(value),
        until: state.upstash.clock + Number(args[0]) * 1000,
      });
      return value;
    }
    subscribe(channel: string) {
      const handlers = new Map<string, (...args: any[]) => void>();
      const subscriber = {
        channel,
        handlers,
        on(name: string, handler: (...args: any[]) => void) {
          handlers.set(name, handler);
        },
        removeAllListeners() {
          handlers.clear();
        },
        async unsubscribe() {
          state.upstash.subscribers.delete(subscriber);
        },
      };
      state.upstash.subscribers.add(subscriber);
      queueMicrotask(() => handlers.get("subscribe")?.());
      return subscriber;
    }
    async publish(channel: string, message: string) {
      let count = 0;
      for (const subscriber of state.upstash.subscribers) {
        if (subscriber.channel === channel) {
          subscriber.handlers.get("message")?.({ message });
          count++;
        }
      }
      return count;
    }
  },
}));

import { createRedisKV } from "./redis";
import { createUpstashKV } from "./upstash";

describe.each([
  ["redis", () => createRedisKV("redis://test"), state.redis],
  ["upstash", () => createUpstashKV(), state.upstash],
] as const)("%s KV contract", (_name, create, store) => {
  it("round-trips strings, replaces pointers, expires values, and cleans up subscriptions", async () => {
    store.data.clear();
    store.subscribers.clear();
    store.clock = 0;
    const writer = create();
    const reader = create();
    await writer.set("string", 'quoted "value"');
    expect(await reader.get("string")).toBe('quoted "value"');
    await writer.set("pointer", "build-1");
    await writer.set("pointer", "build-2");
    expect(await reader.get("pointer")).toBe("build-2");
    expect(
      await writer.setIfNewerRevision("revision-pointer", JSON.stringify({ revision: 2 }), 2, 1),
    ).toBe(true);
    expect(
      await writer.setIfNewerRevision("revision-pointer", JSON.stringify({ revision: 1 }), 1, 1),
    ).toBe(false);
    expect(await reader.get("revision-pointer")).toBe(JSON.stringify({ revision: 2 }));
    expect(
      await writer.setIfNewerRevision("revision-pointer", JSON.stringify({ revision: 3 }), 3, 1),
    ).toBe(true);
    expect(await reader.get("revision-pointer")).toBe(JSON.stringify({ revision: 3 }));
    await writer.set("expiring", "value", { ttl: 1 });
    store.clock += 1001;
    expect(await reader.get("expiring")).toBeNull();
    expect(await reader.get("revision-pointer")).toBeNull();
    const messages: string[] = [];
    const unsubscribe = await reader.subscribe("changes", (message) => messages.push(message));
    await writer.publish("changes", "revision-1");
    expect(messages).toEqual(["revision-1"]);
    await unsubscribe();
    await writer.publish("changes", "revision-2");
    expect(messages).toEqual(["revision-1"]);
    expect(store.subscribers.size).toBe(0);
  });
  it("delivers a committed preview across two platform instances", async () => {
    const moduleUrl = new URL("../../api-platform/src/preview-build-store.ts", import.meta.url)
      .href;
    const { createPreviewBuildStore } = await import(moduleUrl);
    store.data.clear();
    store.subscribers.clear();
    store.clock = 0;
    const uploader = createPreviewBuildStore(create());
    const viewer = createPreviewBuildStore(create());
    const notifications: (number | null)[] = [];
    const unsubscribe = await viewer.subscribe("session", (revision: number | null) =>
      notifications.push(revision),
    );
    const bytes = Buffer.from("export default 1");
    const buildId = await uploader.begin("session", {
      files: [
        {
          path: "client.js",
          contentType: "text/javascript",
          size: bytes.length,
          chunks: 1,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        },
      ],
    });
    expect(await viewer.current("session")).toBeNull();
    await uploader.upload("session", buildId, 0, 0, bytes.toString("base64"));
    const committed = await uploader.commit("session", buildId);
    expect(notifications).toEqual([committed.revision]);
    expect((await viewer.current("session"))?.buildId).toBe(buildId);
    expect(await viewer.chunk("session", buildId, 0, 0)).toBe(bytes.toString("base64"));
    await uploader.end("session");
    expect(notifications).toEqual([committed.revision, null]);
    expect(await viewer.current("session")).toBeNull();
    await unsubscribe();
  });
});
