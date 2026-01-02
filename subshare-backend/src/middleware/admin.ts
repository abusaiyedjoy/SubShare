import { Context, Next } from 'hono';
import { UserResponse } from '@/types';

/**
 * Admin authorization middleware - checks if user has admin role
 * Must be used after authenticate middleware
 */
export async function requireAdmin(c: Context, next: Next) {
  try {
    const user = c.get('user') as UserResponse | undefined;

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Authentication required',
        },
        401
      );
    }

    if (user.role !== 'admin') {
      return c.json(
        {
          success: false,
          error: 'Admin access required. You do not have permission to access this resource.',
        },
        403
      );
    }

    await next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return c.json(
      {
        success: false,
        error: 'Authorization failed',
      },
      403
    );
  }
}

/**
 * Check if current user is admin (doesn't block request)
 */
export function isAdmin(c: Context): boolean {
  const user = c.get('user') as UserResponse | undefined;
  return user?.role === 'admin';
}

/**
 * Get admin user or throw error
 */
export function requireAdminUser(c: Context): UserResponse {
  const user = c.get('user') as UserResponse | undefined;
  
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}