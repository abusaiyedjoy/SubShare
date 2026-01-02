import { Context, Next } from 'hono';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { sanitizeUser } from '@/utils/helpers';

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticate(c: Context, next: Next) {
  try {
    // Extract token from Authorization header
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return c.json(
        {
          success: false,
          error: 'No authentication token provided',
        },
        401
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid token',
        },
        401
      );
    }

    // Fetch user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (user.length === 0) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        401
      );
    }

    // Attach user to context
    c.set('user', sanitizeUser(user[0]));
    c.set('userId', user[0].id);
    c.set('userRole', user[0].role);

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json(
      {
        success: false,
        error: 'Authentication failed',
      },
      401
    );
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyToken(token);
        
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.id))
          .limit(1);

        if (user.length > 0) {
          c.set('user', sanitizeUser(user[0]));
          c.set('userId', user[0].id);
          c.set('userRole', user[0].role);
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    await next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    await next();
  }
}