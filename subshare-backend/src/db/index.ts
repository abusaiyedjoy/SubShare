import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';

export * from './schema';

// Initialize database with D1 binding
export function getDb(D1: D1Database) {
    return drizzle(D1, { schema });
}

// Initialize database with default data
export async function initializeDatabase(db: any, adminEmail: string) {
    try {
        console.log('Initializing database...');

        const { users, platformSettings } = schema;

        // Check if admin exists
        const existingAdmin = await db.select()
            .from(users)
            .where(eq(users.email, adminEmail))
            .limit(1);

        if (existingAdmin.length === 0) {
            // Hash password using Web Crypto API
            const hashedPassword = await hashPassword('admin123');

            await db.insert(users).values({
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
                value: '10',
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
            const existingSetting = await db.select()
                .from(platformSettings)
                .where(eq(platformSettings.key, setting.key))
                .limit(1);

            if (existingSetting.length === 0) {
                await db.insert(platformSettings).values(setting);
            }
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Hash password using Web Crypto API (compatible with Cloudflare Workers)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}