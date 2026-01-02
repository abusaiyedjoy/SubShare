import { Hono } from 'hono';
import { getDb, topupRequests, users, transactions, sharedSubscriptions, reports, subscriptionPlatforms, platformSettings } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate, schemas } from '../middleware/validator';
import { standardRateLimiter } from '../middleware/rateLimiter';
import { sanitizeUser } from '../utils/helpers';
import { ApproveTopupRequest, RejectTopupRequest, VerifySubscriptionRequest, ResolveReportRequest, UpdateBalanceRequest } from '../types';

let db: any;
interface AdminContext {
  Variables: {
    userId: number;
  };
}

const admin = new Hono<AdminContext>();

// Initialize database
admin.use('*', async (c, next) => {
  if (!db) {
    db = getDb((c.env as any).DB);
  }
  await next();
});

// Apply authentication and admin authorization to all admin routes
admin.use('*', authenticate);
admin.use('*', requireAdmin);
admin.use('*', standardRateLimiter());

/**
 * GET /api/admin/topup-requests
 * Get all topup requests (pending by default)
 */
admin.get('/topup-requests', async (c) => {
  try {
    const status = c.req.query('status') || 'pending';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const requests = await db
      .select({
        request: topupRequests,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(topupRequests)
      .innerJoin(users, eq(topupRequests.user_id, users.id))
      .where(status !== 'all' ? eq(topupRequests.status, status as any) : sql`1=1`)
      .orderBy(desc(topupRequests.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(topupRequests)
      .where(status !== 'all' ? eq(topupRequests.status, status as any) : sql`1=1`);

    return c.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get topup requests error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch topup requests',
    }, 500);
  }
});

/**
 * PUT /api/admin/topup-requests/:id/approve
 * Approve topup request
 */
admin.put('/topup-requests/:id/approve', validate(schemas.reviewTopup), async (c) => {
  try {
    const adminId = c.get('userId') as number;
    const requestId = parseInt(c.req.param('id'));
    const { review_notes } = await c.req.json() as ApproveTopupRequest;

    if (isNaN(requestId)) {
      return c.json({
        success: false,
        error: 'Invalid request ID',
      }, 400);
    }

    // Get topup request
    const request = await db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      return c.json({
        success: false,
        error: 'Topup request not found',
      }, 404);
    }

    if (request[0].status !== 'pending') {
      return c.json({
        success: false,
        error: 'Topup request already processed',
      }, 400);
    }

    // Update topup request status
    await db
      .update(topupRequests)
      .set({
        status: 'approved',
        reviewed_by_admin_id: adminId,
        review_notes: review_notes || null,
        updated_at: new Date(),
      })
      .where(eq(topupRequests.id, requestId));

    // Add balance to user
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${request[0].amount}`,
        updated_at: new Date(),
      })
      .where(eq(users.id, request[0].user_id));

    // Create transaction record
    await db
      .insert(transactions)
      .values({
        user_id: request[0].user_id,
        amount: request[0].amount,
        transaction_type: 'topup',
        reference_id: request[0].transaction_id,
        status: 'completed',
        notes: `Topup approved by admin`,
        processed_by_admin_id: adminId,
      });

    return c.json({
      success: true,
      message: 'Topup request approved successfully',
    });
  } catch (error) {
    console.error('Approve topup error:', error);
    return c.json({
      success: false,
      error: 'Failed to approve topup request',
    }, 500);
  }
});

/**
 * PUT /api/admin/topup-requests/:id/reject
 * Reject topup request
 */
admin.put('/topup-requests/:id/reject', validate(schemas.reviewTopup), async (c) => {
  try {
    const adminId = c.get('userId') as number;
    const requestId = parseInt(c.req.param('id'));
    const { review_notes } = await c.req.json() as RejectTopupRequest;

    if (isNaN(requestId)) {
      return c.json({
        success: false,
        error: 'Invalid request ID',
      }, 400);
    }

    // Get topup request
    const request = await db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      return c.json({
        success: false,
        error: 'Topup request not found',
      }, 404);
    }

    if (request[0].status !== 'pending') {
      return c.json({
        success: false,
        error: 'Topup request already processed',
      }, 400);
    }

    // Update topup request status
    await db
      .update(topupRequests)
      .set({
        status: 'rejected',
        reviewed_by_admin_id: adminId,
        review_notes: review_notes || 'Request rejected by admin',
        updated_at: new Date(),
      })
      .where(eq(topupRequests.id, requestId));

    return c.json({
      success: true,
      message: 'Topup request rejected successfully',
    });
  } catch (error) {
    console.error('Reject topup error:', error);
    return c.json({
      success: false,
      error: 'Failed to reject topup request',
    }, 500);
  }
});

/**
 * GET /api/admin/pending-verifications
 * Get pending subscription verifications
 */
admin.get('/pending-verifications', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const pendingSubscriptions = await db
      .select({
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(sharedSubscriptions)
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .innerJoin(users, eq(sharedSubscriptions.shared_by, users.id))
      .where(eq(sharedSubscriptions.is_verified, false))
      .orderBy(desc(sharedSubscriptions.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.is_verified, false));

    // Remove credentials from response
    const sanitized = pendingSubscriptions.map((item: { subscription: any; }) => ({
      ...item,
      subscription: {
        ...item.subscription,
        credentials_username: undefined,
        credentials_password: undefined,
      },
    }));

    return c.json({
      success: true,
      data: sanitized,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch pending verifications',
    }, 500);
  }
});

/**
 * POST /api/admin/subscriptions/:id/verify
 * Verify shared subscription
 */
admin.post('/subscriptions/:id/verify', validate(schemas.verifySubscription), async (c) => {
  try {
    const adminId = c.get('userId') as number;
    const subscriptionId = parseInt(c.req.param('id'));
    const { is_verified, verification_note } = await c.req.json() as VerifySubscriptionRequest;

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

    // Update verification status
    await db
      .update(sharedSubscriptions)
      .set({
        is_verified,
        verification_note: verification_note || null,
        verified_by_admin_id: adminId,
      })
      .where(eq(sharedSubscriptions.id, subscriptionId));

    return c.json({
      success: true,
      message: is_verified 
        ? 'Subscription verified successfully' 
        : 'Subscription verification removed',
    });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return c.json({
      success: false,
      error: 'Failed to verify subscription',
    }, 500);
  }
});

/**
 * GET /api/admin/reports
 * Get all reports
 */
admin.get('/reports', async (c) => {
  try {
    const status = c.req.query('status') || 'pending';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const reportsList = await db
      .select({
        report: reports,
        reporter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        subscription: sharedSubscriptions,
        platform: subscriptionPlatforms,
      })
      .from(reports)
      .innerJoin(users, eq(reports.reported_by_user_id, users.id))
      .innerJoin(sharedSubscriptions, eq(reports.shared_subscription_id, sharedSubscriptions.id))
      .innerJoin(subscriptionPlatforms, eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id))
      .where(status !== 'all' ? eq(reports.status, status as any) : sql`1=1`)
      .orderBy(desc(reports.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(status !== 'all' ? eq(reports.status, status as any) : sql`1=1`);

    return c.json({
      success: true,
      data: reportsList,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch reports',
    }, 500);
  }
});

/**
 * PUT /api/admin/reports/:id/resolve
 * Resolve report
 */
admin.put('/reports/:id/resolve', validate(schemas.resolveReport), async (c) => {
  try {
    const adminId = c.get('userId') as number;
    const reportId = parseInt(c.req.param('id'));
    const { status, resolution_notes } = await c.req.json() as ResolveReportRequest;

    if (isNaN(reportId)) {
      return c.json({
        success: false,
        error: 'Invalid report ID',
      }, 400);
    }

    // Get report
    const report = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (report.length === 0) {
      return c.json({
        success: false,
        error: 'Report not found',
      }, 404);
    }

    if (report[0].status !== 'pending') {
      return c.json({
        success: false,
        error: 'Report already processed',
      }, 400);
    }

    // Update report status
    await db
      .update(reports)
      .set({
        status,
        resolved_by_admin_id: adminId,
        resolution_notes: resolution_notes || null,
        updated_at: new Date(),
      })
      .where(eq(reports.id, reportId));

    // If resolved, you might want to take action on the subscription
    if (status === 'resolved') {
      // Optionally disable the subscription or mark for re-verification
      await db
        .update(sharedSubscriptions)
        .set({
          is_verified: false,
          verification_note: 'Subscription reported and under review',
        })
        .where(eq(sharedSubscriptions.id, report[0].shared_subscription_id));
    }

    return c.json({
      success: true,
      message: 'Report processed successfully',
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    return c.json({
      success: false,
      error: 'Failed to resolve report',
    }, 500);
  }
});

/**
 * GET /api/admin/transactions
 * Get all transactions
 */
admin.get('/transactions', async (c) => {
  try {
    const type = c.req.query('type');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    const transactionsList = await db
      .select({
        transaction: transactions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.user_id, users.id))
      .where(type ? eq(transactions.transaction_type, type as any) : sql`1=1`)
      .orderBy(desc(transactions.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(type ? eq(transactions.transaction_type, type as any) : sql`1=1`);

    return c.json({
      success: true,
      data: transactionsList,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch transactions',
    }, 500);
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
admin.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const usersList = await db
      .select()
      .from(users)
      .orderBy(desc(users.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const sanitizedUsers = usersList.map(sanitizeUser);

    return c.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch users',
    }, 500);
  }
});

/**
 * PUT /api/admin/users/:id/balance
 * Adjust user balance (admin only)
 */
admin.put('/users/:id/balance', validate(schemas.updateBalance), async (c) => {
  try {
    const adminId = c.get('userId') as number;
    const targetUserId = parseInt(c.req.param('id'));
    const { amount, notes } = await c.req.json() as UpdateBalanceRequest;

    if (isNaN(targetUserId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID',
      }, 400);
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (user.length === 0) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }

    // Update user balance
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${amount}`,
        updated_at: new Date(),
      })
      .where(eq(users.id, targetUserId));

    // Create transaction record
    await db
      .insert(transactions)
      .values({
        user_id: targetUserId,
        amount,
        transaction_type: amount > 0 ? 'topup' : 'refund',
        status: 'completed',
        notes: notes || 'Balance adjusted by admin',
        processed_by_admin_id: adminId,
      });

    return c.json({
      success: true,
      message: 'User balance updated successfully',
    });
  } catch (error) {
    console.error('Update balance error:', error);
    return c.json({
      success: false,
      error: 'Failed to update balance',
    }, 500);
  }
});

/**
 * GET /api/admin/settings
 * Get platform settings
 */
admin.get('/settings', async (c) => {
  try {
    const settings = await db
      .select()
      .from(platformSettings)
      .orderBy(platformSettings.key);

    return c.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch settings',
    }, 500);
  }
});

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
admin.put('/settings', validate(schemas.updateSetting), async (c) => {
  try {
    const { key, value } = await c.req.json();

    // Check if setting exists
    const existing = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key))
      .limit(1);

    if (existing.length === 0) {
      return c.json({
        success: false,
        error: 'Setting not found',
      }, 404);
    }

    // Update setting
    const updated = await db
      .update(platformSettings)
      .set({
        value,
        updated_at: new Date(),
      })
      .where(eq(platformSettings.key, key))
      .returning();

    return c.json({
      success: true,
      data: updated[0],
      message: 'Setting updated successfully',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({
      success: false,
      error: 'Failed to update settings',
    }, 500);
  }
});

/**
 * GET /api/admin/dashboard-stats
 * Get dashboard statistics
 */
admin.get('/dashboard-stats', async (c) => {
  try {
    // Total users
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Total subscriptions
    const totalSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedSubscriptions);

    // Active subscriptions
    const activeSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedSubscriptions)
      .where(and(
        eq(sharedSubscriptions.status, true),
        eq(sharedSubscriptions.is_verified, true)
      ));

    // Total transactions
    const totalTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions);

    // Total revenue (commission earnings)
    const revenueResult = await db
      .select({ total: sql<number>`sum(${transactions.admin_commission_amount})` })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    // Pending topups
    const pendingTopups = await db
      .select({ count: sql<number>`count(*)` })
      .from(topupRequests)
      .where(eq(topupRequests.status, 'pending'));

    // Pending verifications
    const pendingVerifications = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.is_verified, false));

    // Pending reports
    const pendingReports = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, 'pending'));

    const stats = {
      totalUsers: totalUsers[0]?.count || 0,
      totalSubscriptions: totalSubscriptions[0]?.count || 0,
      activeSubscriptions: activeSubscriptions[0]?.count || 0,
      totalTransactions: totalTransactions[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingTopups: pendingTopups[0]?.count || 0,
      pendingVerifications: pendingVerifications[0]?.count || 0,
      pendingReports: pendingReports[0]?.count || 0,
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    }, 500);
  }
});

export default admin;