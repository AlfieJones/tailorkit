import IORedis from "ioredis";
import { withSpan } from "@tailorkit/observability";
import type { KV, SetOptions } from "./types.js";

export function createRedisKV(url: string): KV<"redis"> {
  const redis = new IORedis(url);

  return {
    type: "redis",
    engine: redis,
    get: (key) =>
      withSpan("kv.get", { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } }, () =>
        redis.get(key),
      ),
    set: async (key, value, options?: SetOptions) => {
      if (options?.ttl) {
        const ttl = options.ttl;
        await withSpan(
          "kv.set",
          {
            attributes: {
              "tailorkit.package": "kv",
              "kv.type": "redis",
              "kv.ttl_seconds": ttl,
            },
          },
          () => redis.setex(key, ttl, value),
        );
      } else {
        await withSpan(
          "kv.set",
          { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
          () => redis.set(key, value),
        );
      }
    },
    delete: async (key) => {
      await withSpan(
        "kv.delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
        () => redis.del(key),
      );
    },
  };
}
