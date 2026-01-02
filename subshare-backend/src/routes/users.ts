import { Hono } from 'hono';
import { db, users, transactions, subscriptionAccess, sharedSubscriptions, subscriptionPlatforms } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { authenticate } from '@/middleware/auth';
import { standardRateLimiter } from '@/middleware/rateLimiter';
import { sanitizeUser, isValidPassword } from '@/utils/helpers';
import { isAccessActive } from '@/utils/helpers';

const userRoutes = new Hono();

// Apply authentication to all user routes
userRoutes.use('*', authenticate);
userRoutes.use('*', standardRateLimiter());

/**
 * GET /api/users/profile
 * Get user profile
 */
userRoutes.get('/profile', async (c) => {
  try {
    const userId = c.get('userId') as number;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: sanitizeUser(user[0]),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch profile',
    }, 500);
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
userRoutes.put('/profile', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const { name, password } = await c.req.json();

    const updateData: any = {};

    // Update name if provided
    if (name) {
      if (name.trim().length < 2) {
        return c.json({
          success: false,
          error: 'Name must be at least 2 characters',
        }, 400);
      }
      updateData.name = name.trim();
    }

    // Update password if provided
    if (password) {
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        return c.json({
          success: false,
          error: 'Password validation failed',
          details: passwordValidation.errors,
        }, 400);
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({
        success: false,
        error: 'No valid fields to update',
      }, 400);
    }

    // Update timestamp
    updateData.updated_at = new Date();

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return c.json({
      success: true,
      data: sanitizeUser(updatedUser[0]),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({
      success: false,
      error: 'Failed to update profile',
    }, 500);
  }
});

/**
 * GET /api/users/wallet-balance
 * Get user wallet balance
 */
userRoutes.get('/wallet-balance', async (c) => {
  try {
    const userId = c.get('userId') as number;

    const user = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        balance: user[0].balance,
      },
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch wallet balance',
    }, 500);
  }
});

/**
 * GET /api/users/wallet-transactions
 * Get user wallet transaction history
 */
userRoutes.get('/wallet-transactions', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId));

    return c.json({
      success: true,
      data: userTransactions,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch transactions',
    }, 500);
  }
});

/**
 * GET /api/users/my-subscriptions
 * Get user's active subscription accesses
 */
userRoutes.get('/my-subscriptions', async (c) => {
  try {
    const userId = c.get('userId') as number;

    const accesses = await db
      .select({
        access: subscriptionAccess,
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
      })
      .from(subscriptionAccess)
      .innerJoin(sharedSubscriptions, eq(subscriptionAccess.shared_subscription_id, sharedSubscriptions.id))
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .where(eq(subscriptionAccess.accessed_by, userId))
      .orderBy(desc(subscriptionAccess.created_at));

    // Filter active subscriptions
    const activeAccesses = accesses.filter(item => 
      isAccessActive(item.access.access_end_time)
    );

    return c.json({
      success: true,
      data: activeAccesses,
    });
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch subscriptions',
    }, 500);
  }
});

/**
 * GET /api/users/shared-subscriptions
 * Get subscriptions shared by the user
 */
userRoutes.get('/shared-subscriptions', async (c) => {
  try {
    const userId = c.get('userId') as number;

    const shared = await db
      .select({
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
      })
      .from(sharedSubscriptions)
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .where(eq(sharedSubscriptions.shared_by, userId))
      .orderBy(desc(sharedSubscriptions.created_at));

    return c.json({
      success: true,
      data: shared,
    });
  } catch (error) {
    console.error('Get shared subscriptions error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch shared subscriptions',
    }, 500);
  }
});

export default userRoutes;