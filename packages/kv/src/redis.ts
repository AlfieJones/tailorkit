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
    getAndDelete: (key) =>
      withSpan(
        "kv.get_and_delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
        () => redis.getdel(key),
      ),
    increment: (key, ttl) =>
      withSpan(
        "kv.increment",
        {
          attributes: {
            "tailorkit.package": "kv",
            "kv.type": "redis",
            "kv.ttl_seconds": ttl,
          },
        },
        async () => {
          if (!Number.isInteger(ttl) || ttl <= 0) {
            throw new TypeError("Redis increment TTL must be a positive integer");
          }

          const results = await redis.multi().incr(key).expire(key, ttl, "NX").exec();
          const incrementResult = results?.[0];

          if (!incrementResult) {
            throw new Error("Redis increment transaction returned no result");
          }

          const [error, value] = incrementResult;
          if (error) {
            throw error;
          }

          return Number(value);
        },
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
