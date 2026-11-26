import { createHash } from "node:crypto";

/**
 * Fixed-window rate limiter kept in process memory. It slows scripted spam on
 * one server instance. Serverless hosts run many instances, each with its own
 * memory, so treat this as a first line of defence. Turnstile (see README)
 * is the stronger control.
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 5_000;
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now: number = Date.now(),
): RateLimitResult {
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Hashes the client address so raw IP addresses are never kept in memory. */
export function hashClientKey(address: string): string {
  return createHash("sha256").update(address).digest("hex").slice(0, 32);
}

/** Reads the client address from proxy headers. Falls back to "unknown". */
export function clientAddressFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpired(now: number) {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still full: drop the oldest entries to keep memory bounded.
  if (buckets.size >= MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS + 1;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
}

/** Test helper. Clears all tracked buckets. */
export function resetRateLimitForTests() {
  buckets.clear();
}
