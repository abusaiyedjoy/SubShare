import { Hono } from 'hono';
import { db, topupRequests, users, platformSettings } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validator';
import { standardRateLimiter } from '@/middleware/rateLimiter';
import { TopupRequestCreate } from '@/types';

const wallet = new Hono();

// Apply authentication to all wallet routes
wallet.use('*', authenticate);
wallet.use('*', standardRateLimiter());

/**
 * POST /api/wallet/topup-request
 * Request wallet topup
 */
wallet.post('/topup-request', validate(schemas.topupRequest), async (c) => {
  try {
    const userId = c.get('userId') as number;
    const { amount, transaction_id, screenshot_url } = await c.req.json() as TopupRequestCreate;

    // Get minimum topup amount from settings
    const minAmountSetting = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'minimum_topup_amount'))
      .limit(1);

    const minimumAmount = minAmountSetting.length > 0 
      ? parseFloat(minAmountSetting[0].value) 
      : 10;

    if (amount < minimumAmount) {
      return c.json({
        success: false,
        error: `Minimum topup amount is ${minimumAmount}`,
      }, 400);
    }

    // Check if transaction_id already exists
    const existingRequest = await db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.transaction_id, transaction_id))
      .limit(1);

    if (existingRequest.length > 0) {
      return c.json({
        success: false,
        error: 'Transaction ID already used',
      }, 409);
    }

    // Create topup request
    const newRequest = await db
      .insert(topupRequests)
      .values({
        user_id: userId,
        amount,
        transaction_id: transaction_id.trim(),
        screenshot_url: screenshot_url || null,
        status: 'pending',
      })
      .returning();

    return c.json({
      success: true,
      data: newRequest[0],
      message: 'Topup request submitted successfully. Awaiting admin approval.',
    }, 201);
  } catch (error) {
    console.error('Create topup request error:', error);
    return c.json({
      success: false,
      error: 'Failed to create topup request',
    }, 500);
  }
});

/**
 * GET /api/wallet/topup-requests
 * Get user's topup requests
 */
wallet.get('/topup-requests', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const requests = await db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.user_id, userId))
      .orderBy(desc(topupRequests.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.user_id, userId));

    return c.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
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
 * GET /api/wallet/topup-requests/:id
 * Get specific topup request
 */
wallet.get('/topup-requests/:id', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const requestId = parseInt(c.req.param('id'));

    if (isNaN(requestId)) {
      return c.json({
        success: false,
        error: 'Invalid request ID',
      }, 400);
    }

    const request = await db
      .select()
      .from(topupRequests)
      .where(and(
        eq(topupRequests.id, requestId),
        eq(topupRequests.user_id, userId)
      ))
      .limit(1);

    if (request.length === 0) {
      return c.json({
        success: false,
        error: 'Topup request not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: request[0],
    });
  } catch (error) {
    console.error('Get topup request error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch topup request',
    }, 500);
  }
});

export default wallet;