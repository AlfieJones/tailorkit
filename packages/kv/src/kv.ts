import { env } from "@tailorkit/env/server";
import { createRedisKV } from "./redis.js";
import { createUpstashKV } from "./upstash.js";
import type { KV } from "./types.js";

type KVInstance = KV<"upstash"> | KV<"redis"> | null;

let instance: KVInstance | undefined;

function createKV(): KVInstance {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashKV();
  }

  if (env.REDIS_URL) {
    return createRedisKV(env.REDIS_URL);
  }

  return null;
}

export function getKV(): KVInstance {
  if (instance !== undefined) {
    return instance;
  }

  instance = createKV();
  return instance;
}
