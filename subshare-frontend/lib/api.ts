import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  User,
  SubscriptionPlatform,
  SharedSubscription,
  SubscriptionAccess,
  Transaction,
  TopupRequest,
  Report,
  PlatformSettings
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== Auth Endpoints ====================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<{ data: User }> {
    return this.request<{ data: User }>("/api/auth/me");
  }

  // ==================== User Endpoints ====================
  async getUserProfile(): Promise<{ data: User }> {
    return this.request<{ data: User }>("/api/users/profile");
  }

  async updateUserProfile(data: Partial<User>): Promise<{ data: User }> {
    return this.request<{ data: User }>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getWalletBalance(): Promise<{ data: { balance: number } }> {
    return this.request<{ data: { balance: number } }>("/api/users/wallet-balance");
  }

  async getWalletTransactions(): Promise<{ data: Transaction[] }> {
    return this.request<{ data: Transaction[] }>("/api/users/wallet-transactions");
  }

  async getMySubscriptions(): Promise<{ data: SubscriptionAccess[] }> {
    return this.request<{ data: SubscriptionAccess[] }>("/api/users/my-subscriptions");
  }

  async getSharedSubscriptions(): Promise<{ data: SharedSubscription[] }> {
    return this.request<{ data: SharedSubscription[] }>("/api/users/shared-subscriptions");
  }

  // ==================== Platform Endpoints ====================
  async getPlatforms(): Promise<{ data: SubscriptionPlatform[] }> {
    return this.request<{ data: SubscriptionPlatform[] }>("/api/platforms");
  }

  async createPlatform(data: {
    name: string;
    logo_url?: string;
  }): Promise<{ data: SubscriptionPlatform }> {
    return this.request<{ data: SubscriptionPlatform }>("/api/platforms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlatform(
    id: number,
    data: Partial<SubscriptionPlatform>
  ): Promise<{ data: SubscriptionPlatform }> {
    return this.request<{ data: SubscriptionPlatform }>(`/api/platforms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async verifyPlatform(id: number): Promise<{ data: SubscriptionPlatform }> {
    return this.request<{ data: SubscriptionPlatform }>(`/api/platforms/${id}/verify`, {
      method: "POST",
    });
  }

  // ==================== Subscription Endpoints ====================
  async getSubscriptions(filters?: {
    platform_id?: number;
    search?: string;
    status?: boolean;
    is_verified?: boolean;
  }): Promise<{ data: SharedSubscription[] }> {
    const params = new URLSearchParams();
    if (filters?.platform_id) params.append("platform_id", String(filters.platform_id));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status !== undefined) params.append("status", String(filters.status));
    if (filters?.is_verified !== undefined) params.append("is_verified", String(filters.is_verified));
    
    return this.request<{ data: SharedSubscription[] }>(`/api/subscriptions?${params.toString()}`);
  }

  async getSubscription(id: number): Promise<{ data: SharedSubscription }> {
    return this.request<{ data: SharedSubscription }>(`/api/subscriptions/${id}`);
  }

  async createSubscription(data: {
    platform_id: number;
    credentials_username: string;
    credentials_password: string;
    price_per_hour: number;
    expires_at?: string;
  }): Promise<{ data: SharedSubscription }> {
    return this.request<{ data: SharedSubscription }>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(
    id: number,
    data: Partial<SharedSubscription>
  ): Promise<{ data: SharedSubscription }> {
    return this.request<{ data: SharedSubscription }>(`/api/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/subscriptions/${id}`, {
      method: "DELETE",
    });
  }

  async unlockSubscription(
    id: number,
    data: { duration_days: number }
  ): Promise<{ data: SubscriptionAccess }> {
    return this.request<{ data: SubscriptionAccess }>(`/api/subscriptions/${id}/unlock`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSubscriptionCredentials(id: number): Promise<{
    data: {
      username: string;
      password: string;
      access_end_time: string;
    };
  }> {
    return this.request<{
      data: {
        username: string;
        password: string;
        access_end_time: string;
      };
    }>(`/api/subscriptions/${id}/credentials`);
  }

  async reportSubscription(
    id: number,
    data: { reason: string }
  ): Promise<{ data: Report }> {
    return this.request<{ data: Report }>(`/api/subscriptions/${id}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== Wallet & Topup Endpoints ====================
  async requestTopup(data: {
    amount: number;
    transaction_id: string;
    screenshot_url?: string;
  }): Promise<{ data: TopupRequest }> {
    return this.request<{ data: TopupRequest }>("/api/wallet/topup-request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTopupRequests(): Promise<{ data: TopupRequest[] }> {
    return this.request<{ data: TopupRequest[] }>("/api/wallet/topup-requests");
  }

  async getTopupRequest(id: number): Promise<{ data: TopupRequest }> {
    return this.request<{ data: TopupRequest }>(`/api/wallet/topup-requests/${id}`);
  }

  // ==================== Admin Endpoints ====================
  async getAdminTopupRequests(status?: string): Promise<{ data: TopupRequest[] }> {
    const params = status ? `?status=${status}` : "";
    return this.request<{ data: TopupRequest[] }>(`/api/admin/topup-requests${params}`);
  }

  async approveTopupRequest(
    id: number,
    notes?: string
  ): Promise<{ data: TopupRequest }> {
    return this.request<{ data: TopupRequest }>(`/api/admin/topup-requests/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  }

  async rejectTopupRequest(
    id: number,
    notes: string
  ): Promise<{ data: TopupRequest }> {
    return this.request<{ data: TopupRequest }>(`/api/admin/topup-requests/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  }

  async getPendingVerifications(): Promise<{ data: SharedSubscription[] }> {
    return this.request<{ data: SharedSubscription[] }>("/api/admin/pending-verifications");
  }

  async verifySubscription(
    id: number,
    data: {
      is_verified: boolean;
      verification_note?: string;
    }
  ): Promise<{ data: SharedSubscription }> {
    return this.request<{ data: SharedSubscription }>(`/api/admin/subscriptions/${id}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAdminReports(status?: string): Promise<{ data: Report[] }> {
    const params = status ? `?status=${status}` : "";
    return this.request<{ data: Report[] }>(`/api/admin/reports${params}`);
  }

  async resolveReport(
    id: number,
    data: {
      status: "resolved" | "dismissed";
      resolution_notes?: string;
    }
  ): Promise<{ data: Report }> {
    return this.request<{ data: Report }>(`/api/admin/reports/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getAdminTransactions(): Promise<{ data: Transaction[] }> {
    return this.request<{ data: Transaction[] }>("/api/admin/transactions");
  }

  async getAdminUsers(): Promise<{ data: User[] }> {
    return this.request<{ data: User[] }>("/api/admin/users");
  }

  async adjustUserBalance(
    id: number,
    data: {
      amount: number;
      type: "add" | "subtract";
      notes?: string;
    }
  ): Promise<{ data: User }> {
    return this.request<{ data: User }>(`/api/admin/users/${id}/balance`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getAdminSettings(): Promise<{ data: PlatformSettings[] }> {
    return this.request<{ data: PlatformSettings[] }>("/api/admin/settings");
  }

  async updateAdminSettings(data: {
    settings: Array<{ key: string; value: string }>;
  }): Promise<{ data: PlatformSettings[] }> {
    return this.request<{ data: PlatformSettings[] }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getDashboardStats(): Promise<{
    data: {
      totalUsers: number;
      totalSubscriptions: number;
      totalRevenue: number;
      pendingTopups: number;
      pendingVerifications: number;
      activeAccesses: number;
      totalCommission: number;
    };
  }> {
    return this.request<{
      data: {
        totalUsers: number;
        totalSubscriptions: number;
        totalRevenue: number;
        pendingTopups: number;
        pendingVerifications: number;
        activeAccesses: number;
        totalCommission: number;
      };
    }>("/api/admin/dashboard-stats");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);