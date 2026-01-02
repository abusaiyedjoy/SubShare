// import { Hono } from 'hono';
// import { subscriptionPlatforms, db } from '../db';
// import { eq, and, desc } from 'drizzle-orm';
// import { authenticate, optionalAuth } from '../middleware/auth';
// import { requireAdmin } from '../middleware/admin';
// import { validate, schemas } from '../middleware/validator';
// import { standardRateLimiter, lenientRateLimiter } from '../middleware/rateLimiter';
// import { CreatePlatformRequest } from '../types';

// interface HonoContext {
//   userRole?: string;
//   userId?: number;
// }

// const platforms = new Hono<{ Variables: HonoContext }>();

// /**
//  * GET /api/platforms
//  * Get all subscription platforms (public)
//  */
// platforms.get('/', lenientRateLimiter(), optionalAuth, async (c) => {
//   try {
//     const showAll = c.req.query('all') === 'true';
//     const userRole = c.get('userRole');

//     let platformList;

//     if (showAll && userRole === 'admin') {
//       // Admin can see all platforms including inactive ones
//       platformList = await db
//         .select()
//         .from(subscriptionPlatforms)
//         .orderBy(desc(subscriptionPlatforms.created_at));
//     } else {
//       // Regular users only see active platforms
//       platformList = await db
//         .select()
//         .from(subscriptionPlatforms)
//         .where(and(
//           eq(subscriptionPlatforms.is_active, true),
//           eq(subscriptionPlatforms.status, true)
//         ))
//         .orderBy(desc(subscriptionPlatforms.created_at));
//     }

//     return c.json({
//       success: true,
//       data: platformList,
//     });
//   } catch (error) {
//     console.error('Get platforms error:', error);
//     return c.json({
//       success: false,
//       error: 'Failed to fetch platforms',
//     }, 500);
//   }
// });

// /**
//  * POST /api/platforms
//  * Create new platform (admin only)
//  */
// platforms.post(
//   '/',
//   authenticate,
//   requireAdmin,
//   standardRateLimiter(),
//   validate(schemas.createPlatform),
//   async (c) => {
//     try {
//       const userId = c.get('userId') as number;
//       const { name, logo_url } = await c.req.json() as CreatePlatformRequest;

//       // Check if platform already exists
//       const existing = await db
//         .select()
//         .from(subscriptionPlatforms)
//         .where(eq(subscriptionPlatforms.name, name.trim()))
//         .limit(1);

//       if (existing.length > 0) {
//         return c.json({
//           success: false,
//           error: 'Platform with this name already exists',
//         }, 409);
//       }

//       // Create platform
//       const newPlatform = await db
//         .insert(subscriptionPlatforms)
//         .values({
//           name: name.trim(),
//           logo_url: logo_url || null,
//           is_active: true,
//           status: true,
//           created_by: userId,
//         })
//         .returning();

//       return c.json({
//         success: true,
//         data: newPlatform[0],
//         message: 'Platform created successfully',
//       }, 201);
//     } catch (error) {
//       console.error('Create platform error:', error);
//       return c.json({
//         success: false,
//         error: 'Failed to create platform',
//       }, 500);
//     }
//   }
// );

// /**
//  * PUT /api/platforms/:id
//  * Update platform (admin only)
//  */
// platforms.put(
//   '/:id',
//   authenticate,
//   requireAdmin,
//   standardRateLimiter(),
//   async (c) => {
//     try {
//       const platformId = parseInt(c.req.param('id'));
//       const { name, logo_url, is_active, status } = await c.req.json();

//       if (isNaN(platformId)) {
//         return c.json({
//           success: false,
//           error: 'Invalid platform ID',
//         }, 400);
//       }

//       // Check if platform exists
//       const existing = await db
//         .select()
//         .from(subscriptionPlatforms)
//         .where(eq(subscriptionPlatforms.id, platformId))
//         .limit(1);

//       if (existing.length === 0) {
//         return c.json({
//           success: false,
//           error: 'Platform not found',
//         }, 404);
//       }

//       // Build update data
//       const updateData: any = {};

//       if (name !== undefined) {
//         updateData.name = name.trim();
//       }
//       if (logo_url !== undefined) {
//         updateData.logo_url = logo_url;
//       }
//       if (is_active !== undefined) {
//         updateData.is_active = is_active;
//       }
//       if (status !== undefined) {
//         updateData.status = status;
//       }

//       if (Object.keys(updateData).length === 0) {
//         return c.json({
//           success: false,
//           error: 'No valid fields to update',
//         }, 400);
//       }

//       // Update platform
//       const updated = await db
//         .update(subscriptionPlatforms)
//         .set(updateData)
//         .where(eq(subscriptionPlatforms.id, platformId))
//         .returning();

//       return c.json({
//         success: true,
//         data: updated[0],
//         message: 'Platform updated successfully',
//       });
//     } catch (error) {
//       console.error('Update platform error:', error);
//       return c.json({
//         success: false,
//         error: 'Failed to update platform',
//       }, 500);
//     }
//   }
// );

// /**
//  * POST /api/platforms/:id/verify
//  * Verify platform (admin only)
//  */
// platforms.post(
//   '/:id/verify',
//   authenticate,
//   requireAdmin,
//   standardRateLimiter(),
//   async (c) => {
//     try {
//       const platformId = parseInt(c.req.param('id'));

//       if (isNaN(platformId)) {
//         return c.json({
//           success: false,
//           error: 'Invalid platform ID',
//         }, 400);
//       }

//       // Check if platform exists
//       const existing = await db
//         .select()
//         .from(subscriptionPlatforms)
//         .where(eq(subscriptionPlatforms.id, platformId))
//         .limit(1);

//       if (existing.length === 0) {
//         return c.json({
//           success: false,
//           error: 'Platform not found',
//         }, 404);
//       }

//       // Verify platform
//       const verified = await db
//         .update(subscriptionPlatforms)
//         .set({
//           is_active: true,
//           status: true,
//         })
//         .where(eq(subscriptionPlatforms.id, platformId))
//         .returning();

//       return c.json({
//         success: true,
//         data: verified[0],
//         message: 'Platform verified successfully',
//       });
//     } catch (error) {
//       console.error('Verify platform error:', error);
//       return c.json({
//         success: false,
//         error: 'Failed to verify platform',
//       }, 500);
//     }
//   }
// );

// export default platforms;