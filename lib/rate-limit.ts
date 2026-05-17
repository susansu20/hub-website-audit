import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env missing for rate limiting");
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: false,
    prefix: "ratelimit:analyze",
  });
  return limiter;
}

export async function checkAnalyzeRate(ip: string): Promise<{
  ok: boolean;
  remaining: number;
  resetAt: number;
}> {
  const { success, remaining, reset } = await getLimiter().limit(ip);
  return { ok: success, remaining, resetAt: reset };
}
