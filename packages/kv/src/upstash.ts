import { env } from "@tailorkit/env/server";
import { Redis } from "@upstash/redis";
import type { KV, SetOptions } from "./types.js";

export function createUpstashKV(): KV<"upstash"> {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL as string,
    token: env.UPSTASH_REDIS_REST_TOKEN as string,
  });

  return {
    type: "upstash",
    engine: redis,
    get: async (key) => {
      const val = await redis.get<string>(key);
      return val ?? null;
    },
    set: async (key, value, options?: SetOptions) => {
      if (options?.ttl) {
        await redis.set(key, value, { ex: options.ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  };
}
