import IORedis from "ioredis";
import { withSpan } from "@tailorkit/observability";
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

async function subscribe(
  redis: IORedis,
  channel: string,
  handler: MessageHandler,
): Promise<Unsubscribe> {
  // Redis connections in subscriber mode cannot execute ordinary commands.
  // Keep the KV client's command connection separate from each subscription.
  const subscriber = redis.duplicate();
  subscriber.on("message", (receivedChannel: string, message: string) => {
    if (receivedChannel === channel) {
      handler(message);
    }
  });

  try {
    await subscriber.subscribe(channel);
  } catch (error) {
    subscriber.disconnect();
    throw error;
  }

  return async () => {
    subscriber.removeAllListeners("message");
    try {
      await subscriber.unsubscribe(channel);
    } finally {
      subscriber.disconnect();
    }
  };
}

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

          return Number(await redis.eval(INCREMENT_WITH_TTL_SCRIPT, 1, key, ttl));
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
    promoteIfOwnerAndNewer: (pointerKey, ownerKey, expectedOwner, value, revision, ttl) =>
      withSpan(
        "kv.promote_if_owner_and_newer",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
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
                2,
                pointerKey,
                ownerKey,
                expectedOwner,
                revision,
                value,
                ttl,
              ),
            ) === 1
          );
        },
      ),
    delete: async (key) => {
      await withSpan(
        "kv.delete",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
        () => redis.del(key),
      );
    },
    publish: (channel, message) =>
      withSpan(
        "kv.publish",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
        () => redis.publish(channel, message),
      ),
    subscribe: (channel, handler) =>
      withSpan(
        "kv.subscribe",
        { attributes: { "tailorkit.package": "kv", "kv.type": "redis" } },
        () => subscribe(redis, channel, handler),
      ),
  };
}
