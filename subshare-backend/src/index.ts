import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { getDb, initializeDatabase } from './db';
import type { D1Database } from '@cloudflare/workers-types';
import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import platformRoutes from './routes/platforms';
// import subscriptionRoutes from './routes/subscriptions';
// import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
};

type Variables = {
  db: any;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://subshare.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to attach DB to context
app.use('*', async (c, next) => {
  const db = getDb(c.env.DB);
  c.set('db', db);
  await next();
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'SubShare API is running',
    timestamp: new Date().toISOString(),
  });
});

let isInitialized = false;
app.use('*', async (c, next) => {
  if (!isInitialized) {
    try {
      const db = c.get('db');
      await initializeDatabase(db);
      isInitialized = true;
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }
  await next();
});

// API Routes
app.route('/api/auth', authRoutes);
// app.route('/api/users', userRoutes);
// app.route('/api/platforms', platformRoutes);
// app.route('/api/subscriptions', subscriptionRoutes);
// app.route('/api/wallet', walletRoutes);
app.route('/api/admin', adminRoutes);

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

export default app;