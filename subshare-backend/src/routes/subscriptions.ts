import { Hono } from 'hono';
import { db, sharedSubscriptions, subscriptionPlatforms, subscriptionAccess, users, transactions, reports } from '@/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validate, schemas, validateQuery } from '@/middleware/validator';
import { standardRateLimiter, lenientRateLimiter } from '@/middleware/rateLimiter';
import { encryptCredentials, decryptCredentials } from '@/utils/encryption';
import { getCommissionPercentage, calculateCommission, calculateAccessPrice, calculateAccessEndTime, validateSubscriptionHours } from '@/utils/commission';
import { hasSufficientBalance, generateTransactionReference } from '@/utils/helpers';
import { ShareSubscriptionRequest, UnlockSubscriptionRequest } from '@/types';

const subscriptionsRoute = new Hono();

/**
 * GET /api/subscriptions
 * Get all shared subscriptions with filters
 */
subscriptionsRoute.get('/', lenientRateLimiter(), optionalAuth, async (c) => {
  try {
    const platform_id = c.req.query('platform_id');
    const verified = c.req.query('verified');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    let query = db
      .select({
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
        owner: {
          id: users.id,
          name: users.name,
        },
      })
      .from(sharedSubscriptions)
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .innerJoin(users, eq(sharedSubscriptions.shared_by, users.id))
      .where(and(
        eq(sharedSubscriptions.status, true),
        eq(sharedSubscriptions.is_verified, true),
        platform_id ? eq(sharedSubscriptions.platform_id, parseInt(platform_id)) : sql`1=1`
      ))
      .orderBy(desc(sharedSubscriptions.created_at))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Remove encrypted credentials from response
    const sanitizedResults = results.map(r => ({
      ...r,
      subscription: {
        ...r.subscription,
        credentials_username: undefined,
        credentials_password: undefined,
      },
    }));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedSubscriptions)
      .where(and(
        eq(sharedSubscriptions.status, true),
        eq(sharedSubscriptions.is_verified, true),
        platform_id ? eq(sharedSubscriptions.platform_id, parseInt(platform_id)) : sql`1=1`
      ));

    return c.json({
      success: true,
      data: sanitizedResults,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch subscriptions',
    }, 500);
  }
});

/**
 * GET /api/subscriptions/:id
 * Get subscription details
 */
subscriptionsRoute.get('/:id', lenientRateLimiter(), optionalAuth, async (c) => {
  try {
    const subscriptionId = parseInt(c.req.param('id'));

    if (isNaN(subscriptionId)) {
      return c.json({
        success: false,
        error: 'Invalid subscription ID',
      }, 400);
    }

    const result = await db
      .select({
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
        owner: {
          id: users.id,
          name: users.name,
        },
      })
      .from(sharedSubscriptions)
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .innerJoin(users, eq(sharedSubscriptions.shared_by, users.id))
      .where(eq(sharedSubscriptions.id, subscriptionId))
      .limit(1);

    if (result.length === 0) {
      return c.json({
        success: false,
        error: 'Subscription not found',
      }, 404);
    }

    // Remove credentials from response
    const sanitized = {
      ...result[0],
      subscription: {
        ...result[0].subscription,
        credentials_username: undefined,
        credentials_password: undefined,
      },
    };

    return c.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch subscription details',
    }, 500);
  }
});

/**
 * POST /api/subscriptions
 * Share a new subscription
 */
subscriptionsRoute.post(
  '/',
  authenticate,
  standardRateLimiter(),
  validate(schemas.shareSubscription),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const { platform_id, credentials_username, credentials_password, price_per_hour, expires_at } = 
        await c.req.json() as ShareSubscriptionRequest;

      // Verify platform exists
      const platform = await db
        .select()
        .from(subscriptionPlatforms)
        .where(eq(subscriptionPlatforms.id, platform_id))
        .limit(1);

      if (platform.length === 0) {
        return c.json({
          success: false,
          error: 'Platform not found',
        }, 404);
      }

      // Encrypt credentials
      const encrypted = encryptCredentials(credentials_username, credentials_password);

      // Create shared subscription
      const newSubscription = await db
        .insert(sharedSubscriptions)
        .values({
          platform_id,
          shared_by: userId,
          credentials_username: encrypted.encrypted_username,
          credentials_password: encrypted.encrypted_password,
          price_per_hour,
          status: true,
          is_verified: false,
          total_shares_count: 0,
          expires_at: expires_at ? new Date(expires_at) : null,
        })
        .returning();

      return c.json({
        success: true,
        data: {
          ...newSubscription[0],
          credentials_username: undefined,
          credentials_password: undefined,
        },
        message: 'Subscription shared successfully. Awaiting admin verification.',
      }, 201);
    } catch (error) {
      console.error('Share subscription error:', error);
      return c.json({
        success: false,
        error: 'Failed to share subscription',
      }, 500);
    }
  }
);

/**
 * PUT /api/subscriptions/:id
 * Update shared subscription
 */
subscriptionsRoute.put(
  '/:id',
  authenticate,
  standardRateLimiter(),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const subscriptionId = parseInt(c.req.param('id'));
      const { price_per_hour, status, expires_at } = await c.req.json();

      if (isNaN(subscriptionId)) {
        return c.json({
          success: false,
          error: 'Invalid subscription ID',
        }, 400);
      }

      // Check ownership
      const existing = await db
        .select()
        .from(sharedSubscriptions)
        .where(and(
          eq(sharedSubscriptions.id, subscriptionId),
          eq(sharedSubscriptions.shared_by, userId)
        ))
        .limit(1);

      if (existing.length === 0) {
        return c.json({
          success: false,
          error: 'Subscription not found or you do not have permission',
        }, 404);
      }

      const updateData: any = {};
      
      if (price_per_hour !== undefined && price_per_hour > 0) {
        updateData.price_per_hour = price_per_hour;
      }
      if (status !== undefined) {
        updateData.status = status;
      }
      if (expires_at !== undefined) {
        updateData.expires_at = expires_at ? new Date(expires_at) : null;
      }

      if (Object.keys(updateData).length === 0) {
        return c.json({
          success: false,
          error: 'No valid fields to update',
        }, 400);
      }

      const updated = await db
        .update(sharedSubscriptions)
        .set(updateData)
        .where(eq(sharedSubscriptions.id, subscriptionId))
        .returning();

      return c.json({
        success: true,
        data: {
          ...updated[0],
          credentials_username: undefined,
          credentials_password: undefined,
        },
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      return c.json({
        success: false,
        error: 'Failed to update subscription',
      }, 500);
    }
  }
);

/**
 * DELETE /api/subscriptions/:id
 * Delete shared subscription
 */
subscriptionsRoute.delete(
  '/:id',
  authenticate,
  standardRateLimiter(),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const subscriptionId = parseInt(c.req.param('id'));

      if (isNaN(subscriptionId)) {
        return c.json({
          success: false,
          error: 'Invalid subscription ID',
        }, 400);
      }

      // Check ownership
      const existing = await db
        .select()
        .from(sharedSubscriptions)
        .where(and(
          eq(sharedSubscriptions.id, subscriptionId),
          eq(sharedSubscriptions.shared_by, userId)
        ))
        .limit(1);

      if (existing.length === 0) {
        return c.json({
          success: false,
          error: 'Subscription not found or you do not have permission',
        }, 404);
      }

      // Soft delete by setting status to false
      await db
        .update(sharedSubscriptions)
        .set({ status: false })
        .where(eq(sharedSubscriptions.id, subscriptionId));

      return c.json({
        success: true,
        message: 'Subscription deleted successfully',
      });
    } catch (error) {
      console.error('Delete subscription error:', error);
      return c.json({
        success: false,
        error: 'Failed to delete subscription',
      }, 500);
    }
  }
);

/**
 * POST /api/subscriptions/:id/unlock
 * Unlock/purchase subscription access
 */
subscriptionsRoute.post(
  '/:id/unlock',
  authenticate,
  standardRateLimiter(),
  validate(schemas.unlockSubscription),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const subscriptionId = parseInt(c.req.param('id'));
      const { hours } = await c.req.json() as UnlockSubscriptionRequest;

      if (isNaN(subscriptionId)) {
        return c.json({
          success: false,
          error: 'Invalid subscription ID',
        }, 400);
      }

      // Validate hours
      const hoursValidation = await validateSubscriptionHours(hours);
      if (!hoursValidation.valid) {
        return c.json({
          success: false,
          error: hoursValidation.error,
        }, 400);
      }

      // Get subscription details
      const subscription = await db
        .select()
        .from(sharedSubscriptions)
        .where(eq(sharedSubscriptions.id, subscriptionId))
        .limit(1);

      if (subscription.length === 0) {
        return c.json({
          success: false,
          error: 'Subscription not found',
        }, 404);
      }

      const sub = subscription[0];

      // Check if subscription is verified and active
      if (!sub.is_verified || !sub.status) {
        return c.json({
          success: false,
          error: 'Subscription is not available',
        }, 400);
      }

      // Check if user is not the owner
      if (sub.shared_by === userId) {
        return c.json({
          success: false,
          error: 'You cannot purchase access to your own subscription',
        }, 400);
      }

      // Calculate price
      const totalPrice = calculateAccessPrice(sub.price_per_hour, hours);

      // Get user balance
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!hasSufficientBalance(user[0].balance, totalPrice)) {
        return c.json({
          success: false,
          error: 'Insufficient wallet balance',
          required: totalPrice,
          current: user[0].balance,
        }, 400);
      }

      // Get commission percentage
      const commissionPercentage = await getCommissionPercentage();
      const { adminCommission, ownerEarning } = calculateCommission(totalPrice, commissionPercentage);

      // Start transaction
      const startTime = new Date();
      const endTime = calculateAccessEndTime(startTime, hours);

      // Create subscription access
      const access = await db
        .insert(subscriptionAccess)
        .values({
          shared_subscription_id: subscriptionId,
          accessed_by: userId,
          access_price_paid: totalPrice,
          admin_commission: adminCommission,
          status: 'active',
          access_start_time: startTime,
          access_end_time: endTime,
        })
        .returning();

      // Deduct from buyer's balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${totalPrice}`,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId));

      // Add to owner's balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${ownerEarning}`,
          updated_at: new Date(),
        })
        .where(eq(users.id, sub.shared_by));

      // Get admin user
      const adminUser = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'))
        .limit(1);

      if (adminUser.length > 0) {
        // Add commission to admin balance
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${adminCommission}`,
            updated_at: new Date(),
          })
          .where(eq(users.id, adminUser[0].id));
      }

      // Create transaction records
      await db.insert(transactions).values([
        {
          user_id: userId,
          amount: -totalPrice,
          transaction_type: 'purchase',
          status: 'completed',
          admin_commission_percentage: commissionPercentage,
          admin_commission_amount: adminCommission,
          related_subscription_access_id: access[0].id,
          notes: `Purchased ${hours} hours access to subscription`,
        },
        {
          user_id: sub.shared_by,
          amount: ownerEarning,
          transaction_type: 'earning',
          status: 'completed',
          related_subscription_access_id: access[0].id,
          notes: `Earned from subscription share`,
        },
        {
          user_id: adminUser[0]?.id || 1,
          amount: adminCommission,
          transaction_type: 'commission',
          status: 'completed',
          admin_commission_percentage: commissionPercentage,
          admin_commission_amount: adminCommission,
          related_subscription_access_id: access[0].id,
          notes: `Commission from subscription purchase`,
        },
      ]);

      // Update total shares count
      await db
        .update(sharedSubscriptions)
        .set({
          total_shares_count: sql`${sharedSubscriptions.total_shares_count} + 1`,
        })
        .where(eq(sharedSubscriptions.id, subscriptionId));

      return c.json({
        success: true,
        data: access[0],
        message: 'Subscription unlocked successfully',
      }, 201);
    } catch (error) {
      console.error('Unlock subscription error:', error);
      return c.json({
        success: false,
        error: 'Failed to unlock subscription',
      }, 500);
    }
  }
);

/**
 * GET /api/subscriptions/:id/credentials
 * Get credentials if user has active access
 */
subscriptionsRoute.get(
  '/:id/credentials',
  authenticate,
  standardRateLimiter(),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const subscriptionId = parseInt(c.req.param('id'));

      if (isNaN(subscriptionId)) {
        return c.json({
          success: false,
          error: 'Invalid subscription ID',
        }, 400);
      }

      // Check if user has active access
      const access = await db
        .select()
        .from(subscriptionAccess)
        .where(and(
          eq(subscriptionAccess.shared_subscription_id, subscriptionId),
          eq(subscriptionAccess.accessed_by, userId),
          eq(subscriptionAccess.status, 'active')
        ))
        .orderBy(desc(subscriptionAccess.created_at))
        .limit(1);

      if (access.length === 0) {
        return c.json({
          success: false,
          error: 'No active access found. Please purchase access first.',
        }, 403);
      }

      // Check if access is still valid
      if (new Date() > access[0].access_end_time) {
        // Update status to expired
        await db
          .update(subscriptionAccess)
          .set({ status: 'expired' })
          .where(eq(subscriptionAccess.id, access[0].id));

        return c.json({
          success: false,
          error: 'Your access has expired',
        }, 403);
      }

      // Get subscription with credentials
      const subscription = await db
        .select()
        .from(sharedSubscriptions)
        .where(eq(sharedSubscriptions.id, subscriptionId))
        .limit(1);

      if (subscription.length === 0) {
        return c.json({
          success: false,
          error: 'Subscription not found',
        }, 404);
      }

      // Decrypt credentials
      const decrypted = decryptCredentials(
        subscription[0].credentials_username,
        subscription[0].credentials_password
      );

      return c.json({
        success: true,
        data: {
          username: decrypted.username,
          password: decrypted.password,
          access_expires_at: access[0].access_end_time,
        },
      });
    } catch (error) {
      console.error('Get credentials error:', error);
      return c.json({
        success: false,
        error: 'Failed to retrieve credentials',
      }, 500);
    }
  }
);

/**
 * POST /api/subscriptions/:id/report
 * Report a subscription
 */
subscriptionsRoute.post(
  '/:id/report',
  authenticate,
  standardRateLimiter(),
  validate(schemas.reportSubscription),
  async (c) => {
    try {
      const userId = c.get('userId') as number;
      const subscriptionId = parseInt(c.req.param('id'));
      const { reason } = await c.req.json();

      if (isNaN(subscriptionId)) {
        return c.json({
          success: false,
          error: 'Invalid subscription ID',
        }, 400);
      }

      // Check if subscription exists
      const subscription = await db
        .select()
        .from(sharedSubscriptions)
        .where(eq(sharedSubscriptions.id, subscriptionId))
        .limit(1);

      if (subscription.length === 0) {
        return c.json({
          success: false,
          error: 'Subscription not found',
        }, 404);
      }

      // Check if user already reported this subscription
      const existingReport = await db
        .select()
        .from(reports)
        .where(and(
          eq(reports.shared_subscription_id, subscriptionId),
          eq(reports.reported_by_user_id, userId),
          eq(reports.status, 'pending')
        ))
        .limit(1);

      if (existingReport.length > 0) {
        return c.json({
          success: false,
          error: 'You have already reported this subscription',
        }, 400);
      }

      // Create report
      const report = await db
        .insert(reports)
        .values({
          reported_by_user_id: userId,
          shared_subscription_id: subscriptionId,
          reason: reason.trim(),
          status: 'pending',
        })
        .returning();

      return c.json({
        success: true,
        data: report[0],
        message: 'Report submitted successfully',
      }, 201);
    } catch (error) {
      console.error('Report subscription error:', error);
      return c.json({
        success: false,
        error: 'Failed to submit report',
      }, 500);
    }
  }
);

export default subscriptionsRoute;