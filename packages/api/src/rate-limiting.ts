import { createRatelimitMiddleware, RatelimitHandlerPlugin } from "@orpc/experimental-ratelimit";
import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";
import { RedisRatelimiter } from "@orpc/experimental-ratelimit/redis";
import { UpstashRatelimiter } from "@orpc/experimental-ratelimit/upstash-ratelimit";
import { Ratelimit } from "@upstash/ratelimit";
import { getKV } from "@tailorkit/kv";
import type { Ratelimiter } from "@orpc/experimental-ratelimit";
import { waitUntil as vercelWaitUntil } from "@vercel/functions";
import { env } from "@tailorkit/env/server";

function createRatelimiter(): Ratelimiter {
  const kv = getKV();

  if (kv?.type === "upstash") {
    const ratelimit = new Ratelimit({
      redis: kv.engine,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      prefix: "tailorkit:ratelimit:",
    });
    return new UpstashRatelimiter(ratelimit, {
      waitUntil: env.VERCEL ? vercelWaitUntil : undefined,
    });
  }

  if (kv?.type === "redis") {
    return new RedisRatelimiter({
      eval: (script, numKeys, ...rest) => kv.engine.eval(script, numKeys, ...rest) as never,
      maxRequests: 100,
      window: 60_000,
      prefix: "tailorkit:ratelimit:",
    });
  }

  return new MemoryRatelimiter({ maxRequests: 100, window: 60_000 });
}

export const ratelimiter = createRatelimiter();

export const ratelimitMiddleware = createRatelimitMiddleware({
  limiter: () => ratelimiter,
  key: ({ context }) => {
    const ctx = context as { user?: { id: string }; ip: string };
    return ctx.user?.id ?? `ip:${ctx.ip}`;
  },
});

export { RatelimitHandlerPlugin };
