import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory sliding window fallback store for local dev or when Upstash is not configured
interface MemoryWindowRecord {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryWindowRecord>();

function memorySlidingWindow(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Filter out timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = oldest + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: now + windowMs,
  };
}

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

/**
 * 5 order attempts per 10 minutes per IP
 */
const upstashOrderLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ratelimit:order",
    })
  : null;

/**
 * 5 cancel attempts per 10 minutes per user/IP
 */
const upstashCancelLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ratelimit:cancel",
    })
  : null;

export async function rateLimitOrder(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (upstashOrderLimiter) {
    try {
      const res = await upstashOrderLimiter.limit(ip);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("Upstash order ratelimit failed, falling back to memory:", err);
    }
  }

  // Fallback: 5 attempts per 10 minutes (600,000 ms)
  return memorySlidingWindow(`order:${ip}`, 5, 10 * 60 * 1000);
}

export async function rateLimitCancel(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (upstashCancelLimiter) {
    try {
      const res = await upstashCancelLimiter.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("Upstash cancel ratelimit failed, falling back to memory:", err);
    }
  }

  // Fallback: 5 attempts per 10 minutes (600,000 ms)
  return memorySlidingWindow(`cancel:${identifier}`, 5, 10 * 60 * 1000);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
