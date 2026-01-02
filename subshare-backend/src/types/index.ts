export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

// Subscription Platform Types
export interface SubscriptionPlatform {
  id: number;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_by: number;
  status: boolean;
  created_at: Date;
}

// Shared Subscription Types
export interface SharedSubscription {
  id: number;
  platform_id: number;
  shared_by: number;
  credentials_username: string;
  credentials_password: string;
  price_per_hour: number;
  status: boolean;
  is_verified: boolean;
  verification_note: string | null;
  verified_by_admin_id: number | null;
  total_shares_count: number;
  created_at: Date;
  expires_at: Date | null;
}

// Subscription Access Types
export type AccessStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionAccess {
  id: number;
  shared_subscription_id: number;
  accessed_by: number;
  access_price_paid: number;
  admin_commission: number;
  status: AccessStatus;
  access_start_time: Date;
  access_end_time: Date;
  created_at: Date;
}

// Transaction Types
export type TransactionType = 'topup' | 'purchase' | 'earning' | 'refund' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: TransactionType;
  reference_id: string | null;
  status: TransactionStatus;
  admin_commission_percentage: number | null;
  admin_commission_amount: number | null;
  related_subscription_access_id: number | null;
  notes: string | null;
  processed_by_admin_id: number | null;
  created_at: Date;
  updated_at: Date;
}

// Topup Request Types
export type TopupRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TopupRequest {
  id: number;
  user_id: number;
  amount: number;
  transaction_id: string;
  screenshot_url: string | null;
  status: TopupRequestStatus;
  reviewed_by_admin_id: number | null;
  review_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Report Types
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: number;
  reported_by_user_id: number;
  shared_subscription_id: number;
  reason: string;
  status: ReportStatus;
  resolved_by_admin_id: number | null;
  resolution_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Platform Settings Types
export interface PlatformSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: Date;
}

// JWT Types
export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface CreatePlatformRequest {
  name: string;
  logo_url?: string;
}

export interface ShareSubscriptionRequest {
  platform_id: number;
  credentials_username: string;
  credentials_password: string;
  price_per_hour: number;
  expires_at?: string;
}

export interface UnlockSubscriptionRequest {
  hours: number;
}

export interface TopupRequestCreate {
  amount: number;
  transaction_id: string;
  screenshot_url?: string;
}

export interface ApproveTopupRequest {
  review_notes?: string;
}

export interface RejectTopupRequest {
  review_notes: string;
}

export interface VerifySubscriptionRequest {
  is_verified: boolean;
  verification_note?: string;
}

export interface ResolveReportRequest {
  status: 'resolved' | 'dismissed';
  resolution_notes?: string;
}

export interface UpdateBalanceRequest {
  amount: number;
  notes?: string;
}

export interface UpdateSettingsRequest {
  key: string;
  value: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingTopups: number;
  pendingVerifications: number;
  pendingReports: number;
  activeSubscriptions: number;
}

// Context Types (for Hono)
export interface AppContext {
  user?: UserResponse;
}