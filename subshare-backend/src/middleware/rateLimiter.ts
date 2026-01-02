import { Context, Next } from 'hono';

// In-memory store for rate limiting
// For production, use Redis or similar distributed cache
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 60000); // Clean up every minute

/**
 * Rate limiter middleware
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    try {
      // Get identifier (IP address or user ID)
      const userId = c.get('userId');
      const ip = c.req.header('cf-connecting-ip') || 
                 c.req.header('x-forwarded-for') || 
                 c.req.header('x-real-ip') || 
                 'unknown';
      
      const identifier = userId ? `user:${userId}` : `ip:${ip}`;
      const now = Date.now();

      // Initialize or get current limit data
      if (!rateLimitStore[identifier] || rateLimitStore[identifier].resetTime < now) {
        rateLimitStore[identifier] = {
          count: 1,
          resetTime: now + windowMs,
        };
      } else {
        rateLimitStore[identifier].count++;
      }

      const { count, resetTime } = rateLimitStore[identifier];

      // Set rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());
      c.header('X-RateLimit-Reset', Math.floor(resetTime / 1000).toString());

      // Check if limit exceeded
      if (count > maxRequests) {
        return c.json(
          {
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((resetTime - now) / 1000),
          },
          429
        );
      }

      await next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Continue on error to not block requests
      await next();
    }
  };
}

/**
 * Strict rate limiter for sensitive endpoints (login, register)
 */
export function strictRateLimiter() {
  return rateLimiter(10, 60000); // 10 requests per minute
}

/**
 * Standard rate limiter for general API endpoints
 */
export function standardRateLimiter() {
  return rateLimiter(100, 60000); // 100 requests per minute
}

/**
 * Lenient rate limiter for public endpoints
 */
export function lenientRateLimiter() {
  return rateLimiter(200, 60000); // 200 requests per minute
}