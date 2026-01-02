import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { initializeDatabase } from './db';
import * as dotenv from 'dotenv';
import { serve } from '@hono/node-server';

// import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import platformRoutes from './routes/platforms';
// import subscriptionRoutes from './routes/subscriptions';
// import walletRoutes from './routes/wallet';
// import adminRoutes from './routes/admin';

dotenv.config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://subshare.vercel.app'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'SubShare API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// app.route('/api/auth', authRoutes);
// app.route('/api/users', userRoutes);
// app.route('/api/platforms', platformRoutes);
// app.route('/api/subscriptions', subscriptionRoutes);
// app.route('/api/wallet', walletRoutes);
// app.route('/api/admin', adminRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found',
    path: c.req.path,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  return c.json({
    success: false,
    error: err.message || 'Internal server error',
  }, 500);
});

// Initialize database on startup
initializeDatabase().catch(console.error);

// Node.js local development
if (process.env.NODE_ENV !== 'production') {
  const port = parseInt(process.env.PORT || '8787');

  console.log(`🚀 SubShare API starting on port ${port}...`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

  serve({
    fetch: app.fetch,
    port,
  }, (info: { port: number; }) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`);
    console.log(`📚 API Documentation: http://localhost:${info.port}/health`);
  });
}

// Export for Cloudflare Workers
export default app;
