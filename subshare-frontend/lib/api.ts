const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://subshare-backend.abusaiyedjoy1.workers.dev";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

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

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Auth Endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    // Store token
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    await this.request<ApiResponse<null>>("/api/auth/logout", {
      method: "POST",
    });
    
    // Remove token
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<ApiResponse<User>>("/api/auth/me");
    return response.data!;
  }

  // User Endpoints
  async getUserProfile(): Promise<User> {
    const response = await this.request<ApiResponse<User>>("/api/users/profile");
    return response.data!;
  }

  async updateUserProfile(data: { name?: string }): Promise<User> {
    const response = await this.request<ApiResponse<User>>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>("/api/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.data!;
  }

  async getWalletBalance(): Promise<{ balance: number }> {
    const response = await this.request<ApiResponse<{ balance: number }>>("/api/users/wallet-balance");
    return response.data!;
  }

  async getWalletTransactions(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/users/wallet-transactions${query}`);
    return response.data!;
  }

  async getMySubscriptions(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>("/api/users/my-subscriptions");
    return response.data!;
  }

  async getSharedSubscriptions(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>("/api/users/shared-subscriptions");
    return response.data!;
  }

  async getUserStats(): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/users/stats");
    return response.data!;
  }

  // Platform Endpoints
  async getPlatforms(activeOnly?: boolean): Promise<any[]> {
    const query = activeOnly ? "?active_only=true" : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/platforms${query}`);
    return response.data!;
  }

  async searchPlatforms(searchTerm: string, activeOnly?: boolean): Promise<any[]> {
    const params = new URLSearchParams({ q: searchTerm });
    if (activeOnly) params.append("active_only", "true");
    const response = await this.request<ApiResponse<any[]>>(`/api/platforms/search?${params}`);
    return response.data!;
  }

  async getPlatform(id: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/platforms/${id}`);
    return response.data!;
  }

  async createPlatform(data: { name: string; logo_url?: string }): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/platforms", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updatePlatform(id: number, data: any): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/platforms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async verifyPlatform(id: number, isActive: boolean): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/platforms/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ is_active: isActive }),
    });
    return response.data!;
  }

  async deletePlatform(id: number): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/platforms/${id}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  // Subscription Endpoints
  async getSubscriptions(filters?: {
    platform_id?: number;
    verified_only?: boolean;
    active_only?: boolean;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.platform_id) params.append("platform_id", filters.platform_id.toString());
    if (filters?.verified_only) params.append("verified_only", "true");
    if (filters?.active_only) params.append("active_only", "true");
    
    const query = params.toString() ? `?${params}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/subscriptions${query}`);
    return response.data!;
  }

  async getSubscription(id: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/subscriptions/${id}`);
    return response.data!;
  }

  async createSubscription(data: {
    platform_id: number;
    credentials_username: string;
    credentials_password: string;
    price_per_hour: number;
    expires_at?: string;
  }): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateSubscription(id: number, data: {
    credentials_username?: string;
    credentials_password?: string;
    price_per_hour?: number;
    status?: boolean;
  }): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteSubscription(id: number): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/subscriptions/${id}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  async unlockSubscription(id: number, hours: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/subscriptions/${id}/unlock`, {
      method: "POST",
      body: JSON.stringify({ hours }),
    });
    return response.data!;
  }

  async getSubscriptionCredentials(id: number): Promise<{
    platform: string;
    username: string;
    password: string;
  }> {
    const response = await this.request<ApiResponse<any>>(`/api/subscriptions/${id}/credentials`);
    return response.data!;
  }

  // Reports Endpoints
  async createReport(sharedSubscriptionId: number, reason: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ shared_subscription_id: sharedSubscriptionId, reason }),
    });
    return response.data!;
  }

  async getMyReports(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>("/api/reports/my-reports");
    return response.data!;
  }

  async getAllReports(status?: string): Promise<any[]> {
    const query = status ? `?status=${status}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/reports${query}`);
    return response.data!;
  }

  async getReport(id: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/reports/${id}`);
    return response.data!;
  }

  async resolveReport(id: number, status: 'resolved' | 'dismissed', resolutionNotes?: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/reports/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
    });
    return response.data!;
  }

  async deleteReport(id: number): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/reports/${id}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  // Wallet Endpoints
  async createTopupRequest(data: {
    amount: number;
    transaction_id: string;
    screenshot_url?: string;
  }): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/wallet/topup-request", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async getTopupRequests(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/wallet/topup-requests${query}`);
    return response.data!;
  }

  async getTopupRequest(id: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/wallet/topup-requests/${id}`);
    return response.data!;
  }

  async cancelTopupRequest(id: number): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/wallet/topup-requests/${id}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  // Admin - Topup Management
  async getAdminTopupRequests(status?: string, limit?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit.toString());
    const query = params.toString() ? `?${params}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/wallet/admin/topup-requests${query}`);
    return response.data!;
  }

  async approveTopupRequest(id: number, reviewNotes?: string): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/wallet/admin/topup-requests/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
    return response.data!;
  }

  async rejectTopupRequest(id: number, reviewNotes?: string): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/wallet/admin/topup-requests/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
    return response.data!;
  }

  // Admin Endpoints
  async getDashboardStats(): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/admin/dashboard-stats");
    return response.data!;
  }

  async getSystemStats(): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/admin/system-stats");
    return response.data!;
  }

  async getAdminUsers(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/admin/users${query}`);
    return response.data!;
  }

  async getUserDetails(userId: number): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/admin/users/${userId}`);
    return response.data!;
  }

  async adjustUserBalance(userId: number, amount: number, notes: string): Promise<{ message: string; newBalance: number }> {
    const response = await this.request<ApiResponse<any>>(`/api/admin/users/${userId}/balance`, {
      method: "PUT",
      body: JSON.stringify({ amount, notes }),
    });
    return response.data!;
  }

  async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<User> {
    const response = await this.request<ApiResponse<User>>(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    return response.data!;
  }

  async getAdminTransactions(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : "";
    const response = await this.request<ApiResponse<any[]>>(`/api/admin/transactions${query}`);
    return response.data!;
  }

  async getPendingVerifications(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>("/api/admin/pending-verifications");
    return response.data!;
  }

  async verifySubscription(id: number, isVerified: boolean, verificationNote?: string): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/admin/subscriptions/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ is_verified: isVerified, verification_note: verificationNote }),
    });
    return response.data!;
  }

  async getPlatformSettings(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>("/api/admin/settings");
    return response.data!;
  }

  async updatePlatformSetting(key: string, value: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    });
    return response.data!;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;