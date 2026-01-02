import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for better organization and type safety
export const queryKeys = {
  // Auth
  currentUser: ["currentUser"] as const,
  
  // Users
  userProfile: ["userProfile"] as const,
  walletBalance: ["walletBalance"] as const,
  walletTransactions: ["walletTransactions"] as const,
  mySubscriptions: ["mySubscriptions"] as const,
  sharedSubscriptions: ["sharedSubscriptions"] as const,
  
  // Platforms
  platforms: ["platforms"] as const,
  platform: (id: number) => ["platform", id] as const,
  
  // Subscriptions
  subscriptions: (filters?: Record<string, any>) => 
    ["subscriptions", filters] as const,
  subscription: (id: number) => ["subscription", id] as const,
  subscriptionCredentials: (id: number) => 
    ["subscriptionCredentials", id] as const,
  
  // Topup
  topupRequests: ["topupRequests"] as const,
  topupRequest: (id: number) => ["topupRequest", id] as const,
  
  // Admin
  adminTopupRequests: ["adminTopupRequests"] as const,
  adminPendingVerifications: ["adminPendingVerifications"] as const,
  adminReports: ["adminReports"] as const,
  adminTransactions: ["adminTransactions"] as const,
  adminUsers: ["adminUsers"] as const,
  adminSettings: ["adminSettings"] as const,
  adminDashboardStats: ["adminDashboardStats"] as const,
};