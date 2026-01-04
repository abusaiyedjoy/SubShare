import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';


// Users Table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  balance: real('balance').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Subscription Platforms Table
export const subscriptionPlatforms = sqliteTable('subscription_platforms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  logo_url: text('logo_url'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_by: integer('created_by')
    .notNull()
    .references(() => users.id),
  status: integer('status', { mode: 'boolean' }).notNull().default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Shared Subscriptions Table
export const sharedSubscriptions = sqliteTable('shared_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platform_id: integer('platform_id')
    .notNull()
    .references(() => subscriptionPlatforms.id),
  shared_by: integer('shared_by')
    .notNull()
    .references(() => users.id),
  credentials_username: text('credentials_username').notNull(),
  credentials_password: text('credentials_password').notNull(),
  price_per_hour: real('price_per_hour').notNull(),
  status: integer('status', { mode: 'boolean' }).notNull().default(true),
  is_verified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  verification_note: text('verification_note'),
  verified_by_admin_id: integer('verified_by_admin_id').references(() => users.id),
  total_shares_count: integer('total_shares_count').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
});

// Subscription Access Table
export const subscriptionAccess = sqliteTable('subscription_access', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shared_subscription_id: integer('shared_subscription_id')
    .notNull()
    .references(() => sharedSubscriptions.id),
  accessed_by: integer('accessed_by')
    .notNull()
    .references(() => users.id),
  access_price_paid: real('access_price_paid').notNull(),
  admin_commission: real('admin_commission').notNull(),
  status: text('status', {
    enum: ['active', 'expired', 'cancelled'],
  })
    .notNull()
    .default('active'),
  access_start_time: integer('access_start_time', { mode: 'timestamp' }).notNull(),
  access_end_time: integer('access_end_time', { mode: 'timestamp' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Transactions Table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  transaction_type: text('transaction_type', {
    enum: ['topup', 'purchase', 'earning', 'refund', 'commission'],
  }).notNull(),
  reference_id: text('reference_id'),
  status: text('status', {
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  admin_commission_percentage: real('admin_commission_percentage'),
  admin_commission_amount: real('admin_commission_amount'),
  related_subscription_access_id: integer(
    'related_subscription_access_id'
  ).references(() => subscriptionAccess.id),
  notes: text('notes'),
  processed_by_admin_id: integer('processed_by_admin_id').references(() => users.id),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Topup Requests Table
export const topupRequests = sqliteTable('topup_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  transaction_id: text('transaction_id').notNull(),
  screenshot_url: text('screenshot_url'),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected'],
  })
    .notNull()
    .default('pending'),
  reviewed_by_admin_id: integer('reviewed_by_admin_id').references(() => users.id),
  review_notes: text('review_notes'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Reports Table
export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reported_by_user_id: integer('reported_by_user_id')
    .notNull()
    .references(() => users.id),
  shared_subscription_id: integer('shared_subscription_id')
    .notNull()
    .references(() => sharedSubscriptions.id),
  reason: text('reason').notNull(),
  status: text('status', {
    enum: ['pending', 'resolved', 'dismissed'],
  })
    .notNull()
    .default('pending'),
  resolved_by_admin_id: integer('resolved_by_admin_id').references(() => users.id),
  resolution_notes: text('resolution_notes'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Platform Settings Table
export const platformSettings = sqliteTable('platform_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});