import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Check if Upstash Redis is configured.
 * Rate limiting is skipped if env vars are missing (graceful degradation).
 */
function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// Lazy Redis client — only initialized when env vars are present
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  if (!isUpstashConfigured()) return null;

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "ratelimit:go",
  });

  return ratelimit;
}

interface RateLimitResult {
  success: boolean;
  headers: Record<string, string>;
}

/**
 * Extract the client IP from a request, checking common proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

/**
 * Check rate limit for a given identifier.
 * Gracefully skips rate limiting if Upstash is not configured.
 */
export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  // Graceful degradation: skip if Upstash not configured
  const limiter = getRatelimit();
  if (!limiter) {
    return { success: true, headers: {} };
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}

/**
 * Create a 429 rate limit response with standard headers.
 */
export function rateLimitResponse(
  headers: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": "10",
        ...headers,
      },
    }
  );
}
