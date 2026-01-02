import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";

export function useAdmin() {
  const queryClient = useQueryClient();

  // ==================== Topup Requests ====================
  const { 
    data: topupRequestsData, 
    isLoading: isLoadingTopupRequests,
    refetch: refetchTopupRequests 
  } = useQuery({
    queryKey: queryKeys.adminTopupRequests,
    queryFn: () => apiClient.getAdminTopupRequests(),
  });

  const approveTopupMutation = useMutation({
    mutationFn: ({ 
      id, 
      notes 
    }: { 
      id: number; 
      notes?: string 
    }) => apiClient.approveTopupRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTopupRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardStats });
    },
  });

  const rejectTopupMutation = useMutation({
    mutationFn: ({ 
      id, 
      notes 
    }: { 
      id: number; 
      notes: string 
    }) => apiClient.rejectTopupRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTopupRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardStats });
    },
  });

  // ==================== Subscription Verifications ====================
  const { 
    data: pendingVerificationsData, 
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications 
  } = useQuery({
    queryKey: queryKeys.adminPendingVerifications,
    queryFn: () => apiClient.getPendingVerifications(),
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
    }) => apiClient.verifySubscription(id, { is_verified, verification_note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingVerifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardStats });
    },
  });

  // ==================== Reports ====================
  const { 
    data: reportsData, 
    isLoading: isLoadingReports,
    refetch: refetchReports 
  } = useQuery({
    queryKey: queryKeys.adminReports,
    queryFn: () => apiClient.getAdminReports(),
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
    }) => apiClient.resolveReport(id, { status, resolution_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardStats });
    },
  });

  // ==================== Transactions ====================
  const { 
    data: transactionsData, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: queryKeys.adminTransactions,
    queryFn: () => apiClient.getAdminTransactions(),
  });

  // ==================== Users ====================
  const { 
    data: usersData, 
    isLoading: isLoadingUsers,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => apiClient.getAdminUsers(),
  });

  const adjustUserBalanceMutation = useMutation({
    mutationFn: ({ 
      id, 
      amount, 
      type, 
      notes 
    }: { 
      id: number; 
      amount: number; 
      type: "add" | "subtract"; 
      notes?: string 
    }) => apiClient.adjustUserBalance(id, { amount, type, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardStats });
    },
  });

  // ==================== Settings ====================
  const { 
    data: settingsData, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings 
  } = useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: () => apiClient.getAdminSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: {
      settings: Array<{ key: string; value: string }>;
    }) => apiClient.updateAdminSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSettings });
    },
  });

  // ==================== Dashboard Stats ====================
  const { 
    data: statsData, 
    isLoading: isLoadingStats,
    refetch: refetchStats 
  } = useQuery({
    queryKey: queryKeys.adminDashboardStats,
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Helper to get setting by key
  const getSettingByKey = (key: string) => {
    return settingsData?.data?.find(s => s.key === key);
  };

  // Helper to get commission percentage
  const getCommissionPercentage = () => {
    const setting = getSettingByKey("commission_percentage");
    return setting ? parseFloat(setting.value) : 10; // Default 10%
  };

  return {
    // Topup Requests
    topupRequests: topupRequestsData?.data || [],
    isLoadingTopupRequests,
    approveTopup: approveTopupMutation.mutateAsync,
    rejectTopup: rejectTopupMutation.mutateAsync,
    approveTopupMutation,
    rejectTopupMutation,
    refetchTopupRequests,

    // Verifications
    pendingVerifications: pendingVerificationsData?.data || [],
    isLoadingVerifications,
    verifySubscription: verifySubscriptionMutation.mutateAsync,
    verifySubscriptionMutation,
    refetchVerifications,

    // Reports
    reports: reportsData?.data || [],
    isLoadingReports,
    resolveReport: resolveReportMutation.mutateAsync,
    resolveReportMutation,
    refetchReports,

    // Transactions
    transactions: transactionsData?.data || [],
    isLoadingTransactions,
    refetchTransactions,

    // Users
    users: usersData?.data || [],
    isLoadingUsers,
    adjustUserBalance: adjustUserBalanceMutation.mutateAsync,
    adjustUserBalanceMutation,
    refetchUsers,

    // Settings
    settings: settingsData?.data || [],
    isLoadingSettings,
    updateSettings: updateSettingsMutation.mutateAsync,
    updateSettingsMutation,
    refetchSettings,
    getSettingByKey,
    getCommissionPercentage,

    // Dashboard Stats
    stats: statsData?.data || {
      totalUsers: 0,
      totalSubscriptions: 0,
      totalRevenue: 0,
      pendingTopups: 0,
      pendingVerifications: 0,
      activeAccesses: 0,
      totalCommission: 0,
    },
    isLoadingStats,
    refetchStats,
  };
}