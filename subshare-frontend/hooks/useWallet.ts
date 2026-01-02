import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

export function useWallet() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  // Get wallet balance
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: queryKeys.walletBalance,
    queryFn: () => apiClient.getWalletBalance(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get wallet transactions
  const { 
    data: transactionsData, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: queryKeys.walletTransactions,
    queryFn: () => apiClient.getWalletTransactions(),
  });

  // Get topup requests
  const { 
    data: topupRequestsData, 
    isLoading: isLoadingTopupRequests,
    refetch: refetchTopupRequests 
  } = useQuery({
    queryKey: queryKeys.topupRequests,
    queryFn: () => apiClient.getTopupRequests(),
  });

  // Request topup mutation
  const requestTopupMutation = useMutation({
    mutationFn: (data: {
      amount: number;
      transaction_id: string;
      screenshot_url?: string;
    }) => apiClient.requestTopup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topupRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletTransactions });
    },
  });

  // Helper to update balance in store
  const updateBalance = (newBalance: number) => {
    if (user) {
      updateUser({ ...user, balance: newBalance });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
  };

  return {
    balance: balanceData?.data?.balance || user?.balance || 0,
    transactions: transactionsData?.data || [],
    topupRequests: topupRequestsData?.data || [],
    isLoadingBalance,
    isLoadingTransactions,
    isLoadingTopupRequests,
    requestTopup: requestTopupMutation.mutateAsync,
    requestTopupMutation,
    refetchTransactions,
    refetchTopupRequests,
    updateBalance,
  };
}