import { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { users } from '../db';


export async function authenticate(c: Context, next: Next) {
  try {
    const db = c.get('db');
    const jwtSecret = c.env.JWT_SECRET;
    
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
      decoded = await verifyToken(token, jwtSecret);
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
      .limit(1)
      .all();

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


export async function optionalAuth(c: Context, next: Next) {
  try {
    const db = c.get('db');
    const jwtSecret = c.env.JWT_SECRET;
    
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = await verifyToken(token, jwtSecret);
        
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.id))
          .limit(1)
          .all();

        if (user.length > 0) {
          c.set('user', sanitizeUser(user[0]));
          c.set('userId', user[0].id);
          c.set('userRole', user[0].role);
        }
      } catch (error) {
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    await next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    await next();
  }
}

function sanitizeUser(arg0: any): any {
  throw new Error('Function not implemented.');
}
