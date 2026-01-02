export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlatform {
  id: number;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_by: number;
  status: boolean;
  created_at: string;
}

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
  created_at: string;
  expires_at: string | null;
  platform?: SubscriptionPlatform;
  owner?: User;
}

export interface SubscriptionAccess {
  id: number;
  shared_subscription_id: number;
  accessed_by: number;
  access_price_paid: number;
  admin_commission: number;
  status: "active" | "expired" | "cancelled";
  access_start_time: string;
  access_end_time: string;
  created_at: string;
  subscription?: SharedSubscription;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: "topup" | "purchase" | "earning" | "refund" | "commission";
  reference_id: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  admin_commission_percentage: number | null;
  admin_commission_amount: number | null;
  related_subscription_access_id: number | null;
  notes: string | null;
  processed_by_admin_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TopupRequest {
  id: number;
  user_id: number;
  amount: number;
  transaction_id: string;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by_admin_id: number | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Report {
  id: number;
  reported_by_user_id: number;
  shared_subscription_id: number;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  resolved_by_admin_id: number | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}