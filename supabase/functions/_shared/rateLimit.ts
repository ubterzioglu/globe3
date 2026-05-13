import { corsHeaders } from './cors.ts';

interface RateBucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateBucket>();

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS: Record<string, RateLimitRule> = {
  'places-autocomplete': { maxRequests: 30, windowMs: 60_000 },
  'place-details': { maxRequests: 15, windowMs: 60_000 },
  'pins-submit': { maxRequests: 10, windowMs: 3_600_000 },
  'admin-pins-review': { maxRequests: 120, windowMs: 3_600_000 },
};

export function checkRateLimit(key: string, rule: RateLimitRule): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }

  if (bucket.count >= rule.maxRequests) {
    return false;
  }

  bucket.count++;
  return true;
}

export function getRateLimitKey(functionName: string, identifier: string): string {
  return `${functionName}:${identifier}`;
}

export function extractClientIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return `ip:${firstIp}`;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;

  return 'ip:unknown';
}

export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({
      data: null,
      error: { code: 'rate_limited', message: 'Too many requests. Please try again later.' },
    }),
    { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
  );
}
