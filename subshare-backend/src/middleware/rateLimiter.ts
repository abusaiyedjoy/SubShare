import { Context, Next } from 'hono';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 60000); // Clean up every minute


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
      await next();
    }
  };
}


 // rate limiter for sensitive endpoints (login, register)10 requests per minute
export function strictRateLimiter() {
  return rateLimiter(10, 60000); 
}

// Standard rate limiter for regular endpoints 100 requests per minute
export function standardRateLimiter() {
  return rateLimiter(100, 60000); 
}

// Lenient rate limiter for less sensitive endpoints 200 requests per minute
export function lenientRateLimiter() {
  return rateLimiter(200, 60000); 
}