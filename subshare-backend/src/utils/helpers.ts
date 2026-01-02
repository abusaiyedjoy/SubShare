import { UserResponse, User } from '../types';


export function sanitizeUser(user: User): UserResponse {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as UserResponse;
}


export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 100) {
    errors.push('Password must not exceed 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


 // Generate random transaction reference
export function generateTransactionReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

// Check if subscription is expired
export function isSubscriptionExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return false;
  }
  return new Date() > new Date(expiresAt);
}

// Check if access is still active
export function isAccessActive(endTime: Date): boolean {
  return new Date() < new Date(endTime);
}

// Format date to readable string
export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate pagination metadata
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 10
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Get pagination offset
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// Validate positive number
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

// Validate non-negative number
export function isNonNegativeNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Generate safe filename
export function generateSafeFilename(filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
  
  return `${timestamp}-${sanitized}`;
}

// Check if user has sufficient balance
export function hasSufficientBalance(userBalance: number, requiredAmount: number): boolean {
  return userBalance >= requiredAmount;
}

// Round number to two decimal places
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

// Calculate difference in hours between two dates
export function getHoursDifference(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60));
}

// Check if a date is in the future
export function isFutureDate(date: Date): boolean {
  return new Date(date) > new Date();
}

// Parse integer with default value
export function parseIntOrDefault(value: any, defaultValue: number): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Parse float with default value
export function parseFloatOrDefault(value: any, defaultValue: number): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}


export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}


export function errorResponse(error: string, statusCode: number = 400) {
  return {
    success: false,
    error,
    statusCode,
  };
}