import { env } from "@tailorkit/env/server";
import { withSpan } from "@tailorkit/observability";
import { Redis } from "@upstash/redis";
import type { KV, SetOptions } from "./types.js";

const INCREMENT_WITH_TTL_SCRIPT = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return value
`;

export function createUpstashKV(): KV<"upstash"> {
  const redis = new Redis({
    url: env.KV_REST_API_URL as string,
    token: env.KV_REST_API_TOKEN as string,
  });

  return {
    type: "upstash",
    engine: redis,
    get: (key) =>
      withSpan(
        "kv.get",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        async () => {
          const val = await redis.get<string>(key);
          return val ?? null;
        },
      ),
    getAndDelete: (key) =>
      withSpan(
        "kv.get_and_delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        async () => {
          const value = await redis.getdel<string>(key);
          return value ?? null;
        },
      ),
    increment: (key, ttl) =>
      withSpan(
        "kv.increment",
        {
          attributes: {
            "tailorkit.package": "kv",
            "kv.type": "upstash",
            "kv.ttl_seconds": ttl,
          },
        },
        async () => {
          if (!Number.isInteger(ttl) || ttl <= 0) {
            throw new TypeError("Redis increment TTL must be a positive integer");
          }

          return Number(await redis.eval(INCREMENT_WITH_TTL_SCRIPT, [key], [ttl]));
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
              "kv.type": "upstash",
              "kv.ttl_seconds": ttl,
            },
          },
          () => redis.set(key, value, { ex: ttl }),
        );
      } else {
        await withSpan(
          "kv.set",
          { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
          () => redis.set(key, value),
        );
      }
    },
    delete: async (key) => {
      await withSpan(
        "kv.delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        () => redis.del(key),
      );
    },
  };
}
