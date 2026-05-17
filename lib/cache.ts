import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import type { AnalysisResult } from "./types";
import { SCHEMA_VERSION } from "./types";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis env vars missing");
  }
  redis = new Redis({ url, token });
  return redis;
}

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function cacheKey(hash: string): string {
  return `audit:v${SCHEMA_VERSION}:${hash}`;
}

export async function getCachedAnalysis(
  hash: string
): Promise<AnalysisResult | null> {
  const value = await getRedis().get<AnalysisResult>(cacheKey(hash));
  if (!value) return null;
  if (value.version !== SCHEMA_VERSION) return null;
  return value;
}

export async function setCachedAnalysis(result: AnalysisResult): Promise<void> {
  await getRedis().set(cacheKey(result.hash), result, {
    ex: CACHE_TTL_SECONDS,
  });
}
