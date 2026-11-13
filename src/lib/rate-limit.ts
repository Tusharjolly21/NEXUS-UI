/**
 * rate-limit.ts — Simple in-memory sliding-window rate limiter for API routes.
 *
 * Not suitable for multi-instance deployments (use Redis/Upstash for that).
 * Good enough for single-instance Vercel serverless or preview deployments.
 */

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // ms until window resets
};

/**
 * Check if a request is within rate limits.
 *
 * @param key - Unique identifier (e.g., IP address, user ID, token)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const reset = windowMs - (now - oldestInWindow);
    return { success: false, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: limit - entry.timestamps.length,
    reset: windowMs,
  };
}

/**
 * Extract a client identifier from a request for rate limiting.
 *
 * nexus-ui.com sits behind Cloudflare, so the address Vercel puts in X-Forwarded-For is a Cloudflare server, and
 * Cloudflare spreads one visitor's requests over many of them: keyed on that, every request looked like a new
 * visitor and no limit was ever reached. CF-Connecting-IP is the visitor's own address, set by Cloudflare. Someone
 * who skips Cloudflare could fake it, but they could already change addresses at will, so it costs nothing.
 */
export function getClientIp(req: Request): string {
  const cloudflare = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
