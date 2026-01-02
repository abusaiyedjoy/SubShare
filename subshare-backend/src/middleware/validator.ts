import { Context, Next } from 'hono';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory
 */
export function validate(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      
      // Store validated data in context
      c.set('validatedData', validated);
      
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        );
      }
      
      return c.json(
        {
          success: false,
          error: 'Invalid request data',
        },
        400
      );
    }
  };
}

/**
 * Query parameter validation
 */
export function validateQuery(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);
      
      c.set('validatedQuery', validated);
      
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            error: 'Query validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        );
      }
      
      return c.json(
        {
          success: false,
          error: 'Invalid query parameters',
        },
        400
      );
    }
  };
}

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  // Platform schemas
  createPlatform: z.object({
    name: z.string().min(2, 'Platform name must be at least 2 characters').max(100),
    logo_url: z.string().url('Invalid URL').optional(),
  }),

  // Subscription schemas
  shareSubscription: z.object({
    platform_id: z.number().int().positive('Invalid platform ID'),
    credentials_username: z.string().min(1, 'Username is required').max(200),
    credentials_password: z.string().min(1, 'Password is required').max(200),
    price_per_hour: z.number().positive('Price must be positive'),
    expires_at: z.string().datetime().optional(),
  }),

  unlockSubscription: z.object({
    hours: z.number().int().positive('Hours must be a positive integer').min(24, 'Minimum 24 hours required'),
  }),

  reportSubscription: z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
  }),

  // Wallet schemas
  topupRequest: z.object({
    amount: z.number().positive('Amount must be positive'),
    transaction_id: z.string().min(1, 'Transaction ID is required').max(200),
    screenshot_url: z.string().url('Invalid URL').optional(),
  }),

  // Admin schemas
  reviewTopup: z.object({
    review_notes: z.string().max(500).optional(),
  }),

  verifySubscription: z.object({
    is_verified: z.boolean(),
    verification_note: z.string().max(500).optional(),
  }),

  resolveReport: z.object({
    status: z.enum(['resolved', 'dismissed']),
    resolution_notes: z.string().max(1000).optional(),
  }),

  updateBalance: z.object({
    amount: z.number(),
    notes: z.string().max(500).optional(),
  }),

  updateSetting: z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required'),
  }),

  // Query schemas
  paginationQuery: z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => parseInt(val) || 10).optional(),
  }),

  subscriptionFilters: z.object({
    platform_id: z.string().transform(val => parseInt(val)).optional(),
    verified: z.string().transform(val => val === 'true').optional(),
    status: z.string().transform(val => val === 'true').optional(),
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => parseInt(val) || 10).optional(),
  }),
};

/**
 * Get validated data from context
 */
export function getValidatedData<T>(c: Context): T {
  return c.get('validatedData') as T;
}

/**
 * Get validated query from context
 */
export function getValidatedQuery<T>(c: Context): T {
  return c.get('validatedQuery') as T;
}