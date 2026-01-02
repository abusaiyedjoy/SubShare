import { createClient } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

dotenv.config();

// LibSQL connection
const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set in .env');

const client = createClient({
  url: DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Create Drizzle instance
export const db: LibSQLDatabase<typeof schema> = drizzle(client, { schema });

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'abusaiyedjoy1@gmail.com';

    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        10
      );

      await db.insert(schema.users).values({
        name: 'Abu Saiyed Joy',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        balance: 0,
      });

      console.log('Default admin created:', adminEmail);
    }

    // Initialize default platform settings
    const defaultSettings = [
      {
        key: 'admin_commission_percentage',
        value: process.env.DEFAULT_COMMISSION_PERCENTAGE || '10',
        description: 'Commission percentage for admin on each transaction',
      },
      {
        key: 'minimum_topup_amount',
        value: '10',
        description: 'Minimum amount for wallet topup',
      },
      {
        key: 'minimum_subscription_hours',
        value: '24',
        description: 'Minimum subscription access hours',
      },
      {
        key: 'platform_name',
        value: 'SubShare',
        description: 'Platform name',
      },
      {
        key: 'support_email',
        value: 'support@subshare.com',
        description: 'Support email address',
      },
    ];

    for (const setting of defaultSettings) {
      const existingSetting = await db
        .select()
        .from(schema.platformSettings)
        .where(eq(schema.platformSettings.key, setting.key))
        .limit(1);

      if (existingSetting.length === 0) {
        await db.insert(schema.platformSettings).values(setting);
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to get database instance
export function getDb() {
  return db;
}
