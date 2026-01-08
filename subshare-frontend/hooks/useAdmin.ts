import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAdmin() {
  const queryClient = useQueryClient();

  //  Dashboard Stats 
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
    select: (data) => data || {
      totalUsers: 0,
      totalSubscriptions: 0,
      totalRevenue: 0,
      pendingTopups: 0,
      pendingVerifications: 0,
      activeAccesses: 0,
      totalCommission: 0,
    },
  });

  //  System Stats 
  const { data: systemStats, isLoading: isLoadingSystemStats } = useQuery({
    queryKey: ["adminSystemStats"],
    queryFn: () => apiClient.getSystemStats(),
  });

  //  Topup Requests 
  const { 
    data: topupRequests, 
    isLoading: isLoadingTopupRequests,
    refetch: refetchTopupRequests 
  } = useQuery({
    queryKey: ["adminTopupRequests"],
    queryFn: () => apiClient.getAdminTopupRequests(),
    select: (data) => data || [],
  });

  const approveTopupMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => 
      apiClient.approveTopupRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTopupRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  const rejectTopupMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => 
      apiClient.rejectTopupRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTopupRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });

  //  Subscription Verifications 
  const { 
    data: pendingVerifications, 
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications 
  } = useQuery({
    queryKey: ["adminPendingVerifications"],
    queryFn: () => apiClient.getPendingVerifications(),
    select: (data) => data || [],
  });

  const verifySubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      is_verified, 
      verification_note 
    }: { 
      id: number; 
      is_verified: boolean; 
      verification_note?: string 
    }) => apiClient.verifySubscription(id, is_verified, verification_note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerifications"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });

  //  Reports 
  const { 
    data: reports, 
    isLoading: isLoadingReports,
    refetch: refetchReports 
  } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => apiClient.getAllReports(),
    select: (data) => data || [],
  });

  const resolveReportMutation = useMutation({
    mutationFn: ({ 
      id, 
      status, 
      resolution_notes 
    }: { 
      id: number; 
      status: "resolved" | "dismissed"; 
      resolution_notes?: string 
    }) => apiClient.resolveReport(id, status, resolution_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });

  //  Transactions 
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: ["adminTransactions"],
    queryFn: () => apiClient.getAdminTransactions(),
    select: (data) => data || [],
  });

  //  Users 
  const { 
    data: users, 
    isLoading: isLoadingUsers,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => apiClient.getAdminUsers(),
    select: (data) => data || [],
  });

  const adjustUserBalanceMutation = useMutation({
    mutationFn: ({ 
      id, 
      amount, 
      notes 
    }: { 
      id: number; 
      amount: number; 
      notes: string 
    }) => apiClient.adjustUserBalance(id, amount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'user' | 'admin' }) => 
      apiClient.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  //  Settings 
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings 
  } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: () => apiClient.getPlatformSettings(),
    select: (data) => data || [],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { settings: Array<{ key: string; value: string }> }) => {
      // Update each setting individually
      return Promise.all(
        data.settings.map(setting => 
          apiClient.updatePlatformSetting(setting.key, setting.value)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
  });

  // Helper to get setting by key
  const getSettingByKey = (key: string) => {
    return settings?.find((s: any) => s.key === key);
  };

  // Helper to get commission percentage
  const getCommissionPercentage = () => {
    const setting = getSettingByKey("commission_percentage");
    return setting ? parseFloat(setting.value) : 10; // Default 10%
  };

  return {
    // Dashboard Stats
    stats,
    systemStats,
    isLoadingStats,
    isLoadingSystemStats,
    refetchStats,

    // Topup Requests
    topupRequests,
    isLoadingTopupRequests,
    approveTopup: approveTopupMutation.mutateAsync,
    rejectTopup: rejectTopupMutation.mutateAsync,
    approveTopupMutation,
    rejectTopupMutation,
    refetchTopupRequests,

    // Verifications
    pendingVerifications,
    isLoadingVerifications,
    verifySubscription: verifySubscriptionMutation.mutateAsync,
    verifySubscriptionMutation,
    refetchVerifications,

    // Reports
    reports,
    isLoadingReports,
    resolveReport: resolveReportMutation.mutateAsync,
    resolveReportMutation,
    refetchReports,

    // Transactions
    transactions,
    isLoadingTransactions,
    refetchTransactions,

    // Users
    users,
    isLoadingUsers,
    adjustUserBalance: adjustUserBalanceMutation.mutateAsync,
    updateUserRole: updateUserRoleMutation.mutateAsync,
    adjustUserBalanceMutation,
    updateUserRoleMutation,
    refetchUsers,

    // Settings
    settings,
    isLoadingSettings,
    updateSettings: updateSettingsMutation.mutateAsync,
    updateSettingsMutation,
    refetchSettings,
    getSettingByKey,
    getCommissionPercentage,
  };
}