import { db, platformSettings } from '@/db';
import { eq } from 'drizzle-orm';

/**
 * Get admin commission percentage from settings
 */
export async function getCommissionPercentage(): Promise<number> {
  try {
    const setting = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'admin_commission_percentage'))
      .limit(1);

    if (setting.length > 0) {
      return parseFloat(setting[0].value);
    }

    // Default commission if not set
    return 10;
  } catch (error) {
    console.error('Error fetching commission percentage:', error);
    return 10; // Default fallback
  }
}

/**
 * Calculate admin commission and owner earning
 */
export function calculateCommission(
  totalAmount: number,
  commissionPercentage: number
): {
  adminCommission: number;
  ownerEarning: number;
  commissionPercentage: number;
} {
  // Round to 2 decimal places
  const adminCommission = Math.round(totalAmount * (commissionPercentage / 100) * 100) / 100;
  const ownerEarning = Math.round((totalAmount - adminCommission) * 100) / 100;

  return {
    adminCommission,
    ownerEarning,
    commissionPercentage,
  };
}

/**
 * Calculate subscription access price based on hours
 */
export function calculateAccessPrice(pricePerHour: number, hours: number): number {
  // Convert hours to days (minimum 1 day = 24 hours)
  const days = Math.ceil(hours / 24);
  const pricePerDay = pricePerHour * 24;
  
  return Math.round(pricePerDay * days * 100) / 100;
}

/**
 * Calculate access end time based on hours
 */
export function calculateAccessEndTime(startTime: Date, hours: number): Date {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + hours);
  return endTime;
}

/**
 * Get minimum subscription hours from settings
 */
export async function getMinimumSubscriptionHours(): Promise<number> {
  try {
    const setting = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'minimum_subscription_hours'))
      .limit(1);

    if (setting.length > 0) {
      return parseInt(setting[0].value);
    }

    return 24; // Default 24 hours (1 day)
  } catch (error) {
    console.error('Error fetching minimum subscription hours:', error);
    return 24;
  }
}

/**
 * Validate subscription hours
 */
export async function validateSubscriptionHours(hours: number): Promise<{
  valid: boolean;
  error?: string;
  minimumHours?: number;
}> {
  const minimumHours = await getMinimumSubscriptionHours();

  if (hours < minimumHours) {
    return {
      valid: false,
      error: `Minimum subscription duration is ${minimumHours} hours`,
      minimumHours,
    };
  }

  return {
    valid: true,
    minimumHours,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'BDT'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Calculate total earnings for a subscription owner
 */
export async function calculateOwnerTotalEarnings(
  subscriptionId: number
): Promise<number> {
  try {
    const { transactions } = await import('@/db');
    
    const earnings = await db
      .select()
      .from(transactions)
      .where(eq(transactions.transaction_type, 'earning'));

    const total = earnings.reduce((sum, transaction) => {
      return sum + transaction.amount;
    }, 0);

    return Math.round(total * 100) / 100;
  } catch (error) {
    console.error('Error calculating owner earnings:', error);
    return 0;
  }
}