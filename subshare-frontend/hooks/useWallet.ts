import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useWallet() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  // Get wallet balance
  const { 
    data: balanceData, 
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const data = await apiClient.getWalletBalance();
      // Update user balance in store
      if (user && data.balance !== undefined) {
        updateUser({ ...user, balance: data.balance });
      }
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get wallet transactions
  const { 
    data: transactionsData, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: ["walletTransactions"],
    queryFn: () => apiClient.getWalletTransactions(),
  });

  // Get topup requests
  const { 
    data: topupRequestsData, 
    isLoading: isLoadingTopupRequests,
    refetch: refetchTopupRequests 
  } = useQuery({
    queryKey: ["topupRequests"],
    queryFn: () => apiClient.getTopupRequests(),
  });

  // Request topup mutation
  const requestTopupMutation = useMutation({
    mutationFn: (data: {
      amount: number;
      transaction_id: string;
      screenshot_url?: string;
    }) => apiClient.createTopupRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topupRequests"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
  });

  // Cancel topup request mutation
  const cancelTopupMutation = useMutation({
    mutationFn: (id: number) => apiClient.cancelTopupRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topupRequests"] });
    },
  });

  // Helper to update balance in store
  const updateBalance = (newBalance: number) => {
    if (user) {
      updateUser({ ...user, balance: newBalance });
    }
    queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
  };

  return {
    balance: balanceData?.balance || user?.balance || 0,
    transactions: transactionsData || [],
    topupRequests: topupRequestsData || [],
    isLoadingBalance,
    isLoadingTransactions,
    isLoadingTopupRequests,
    requestTopup: requestTopupMutation.mutateAsync,
    cancelTopup: cancelTopupMutation.mutateAsync,
    requestTopupMutation,
    cancelTopupMutation,
    refetchBalance,
    refetchTransactions,
    refetchTopupRequests,
    updateBalance,
  };
}