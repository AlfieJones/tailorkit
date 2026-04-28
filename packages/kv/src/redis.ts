import IORedis from "ioredis";
import type { KV, SetOptions } from "./types.js";

export function createRedisKV(url: string): KV<"redis"> {
  const redis = new IORedis(url);

  return {
    type: "redis",
    engine: redis,
    get: (key) => redis.get(key),
    set: async (key, value, options?: SetOptions) => {
      if (options?.ttl) {
        await redis.set(key, value, "EX", options.ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  };
}
