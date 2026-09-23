import { env } from "@tailorkit/env/server";
import { sanitizeErrorForLog, withSpan } from "@tailorkit/observability";
import { Redis } from "@upstash/redis";
import type { KV, MessageHandler, SetOptions, Unsubscribe } from "./types.js";

const INCREMENT_WITH_TTL_SCRIPT = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return value
`;
const PROMOTE_IF_OWNER_AND_NEWER_SCRIPT = `
if redis.call("GET", KEYS[2]) ~= ARGV[1] then
  return 0
end
local current = redis.call("GET", KEYS[1])
if current and cjson.decode(current).revision >= tonumber(ARGV[2]) then
  return 0
end
redis.call("SET", KEYS[1], ARGV[3], "EX", ARGV[4])
redis.call("DEL", KEYS[2])
return 1
`;

function subscribe(redis: Redis, channel: string, handler: MessageHandler): Promise<Unsubscribe> {
  const subscriber = redis.subscribe<string>(channel);
  return new Promise((resolve, reject) => {
    let setupSettled = false;
    const rejectSetup = (error: Error): void => {
      if (setupSettled) {
        return;
      }
      setupSettled = true;
      subscriber.removeAllListeners();
      void finishSetupFailure(error);
    };
    const finishSetupFailure = async (error: Error): Promise<void> => {
      try {
        await subscriber.unsubscribe();
      } catch {
        // Keep the original subscription error.
      }
      reject(error);
    };
    subscriber.on("message", ({ message }) => handler(message));
    subscriber.on("subscribe", () => {
      if (setupSettled) {
        return;
      }
      setupSettled = true;
      resolve(async () => {
        subscriber.removeAllListeners();
        await subscriber.unsubscribe();
      });
    });
    subscriber.on("error", (error) => {
      if (setupSettled) {
        // The subscription is already live; there is no setup promise left to
        // reject. Surface the error instead of dropping it so a dead
        // connection doesn't silently stop delivering messages.
        console.error("Upstash subscription error", sanitizeErrorForLog(error));
        return;
      }
      rejectSetup(error);
    });
  });
}

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
    promoteIfOwnerAndNewer: (pointerKey, ownerKey, expectedOwner, value, revision, ttl) =>
      withSpan(
        "kv.promote_if_owner_and_newer",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        async () => {
          if (
            !Number.isSafeInteger(revision) ||
            revision <= 0 ||
            !Number.isInteger(ttl) ||
            ttl <= 0
          ) {
            throw new TypeError("KV revision and TTL must be positive integers.");
          }
          return (
            Number(
              await redis.eval(
                PROMOTE_IF_OWNER_AND_NEWER_SCRIPT,
                [pointerKey, ownerKey],
                [expectedOwner, revision, value, ttl],
              ),
            ) === 1
          );
        },
      ),
    delete: async (key) => {
      await withSpan(
        "kv.delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        () => redis.del(key),
      );
    },
    publish: (channel, message) =>
      withSpan(
        "kv.publish",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        () => redis.publish(channel, message),
      ),
    subscribe: (channel, handler) =>
      withSpan(
        "kv.subscribe",
        { attributes: { "tailorkit.package": "kv", "kv.type": "upstash" } },
        () => subscribe(redis, channel, handler),
      ),
  };
}
