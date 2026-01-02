import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import type { SharedSubscription } from "@/types";

interface SubscriptionFilters {
  platform_id?: number;
  search?: string;
  status?: boolean;
  is_verified?: boolean;
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  const queryClient = useQueryClient();

  // Get all subscriptions with filters
  const { 
    data: subscriptionsData, 
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions 
  } = useQuery({
    queryKey: queryKeys.subscriptions(filters),
    queryFn: () => apiClient.getSubscriptions(filters),
  });

  // Get single subscription
  const useSubscription = (id: number) => {
    return useQuery({
      queryKey: queryKeys.subscription(id),
      queryFn: () => apiClient.getSubscription(id),
      enabled: !!id,
    });
  };

  // Get my subscriptions (accessed)
  const { 
    data: mySubscriptionsData, 
    isLoading: isLoadingMySubscriptions,
    refetch: refetchMySubscriptions 
  } = useQuery({
    queryKey: queryKeys.mySubscriptions,
    queryFn: () => apiClient.getMySubscriptions(),
  });

  // Get shared subscriptions (created by me)
  const { 
    data: sharedSubscriptionsData, 
    isLoading: isLoadingSharedSubscriptions,
    refetch: refetchSharedSubscriptions 
  } = useQuery({
    queryKey: queryKeys.sharedSubscriptions,
    queryFn: () => apiClient.getSharedSubscriptions(),
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (data: {
      platform_id: number;
      credentials_username: string;
      credentials_password: string;
      price_per_hour: number;
      expires_at?: string;
    }) => apiClient.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedSubscriptions });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: Partial<SharedSubscription> 
    }) => apiClient.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedSubscriptions });
    },
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedSubscriptions });
    },
  });

  // Unlock subscription mutation
  const unlockSubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      duration_days 
    }: { 
      id: number; 
      duration_days: number 
    }) => apiClient.unlockSubscription(id, { duration_days }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletTransactions });
    },
  });

  // Get subscription credentials
  const useSubscriptionCredentials = (id: number, hasAccess: boolean) => {
    return useQuery({
      queryKey: queryKeys.subscriptionCredentials(id),
      queryFn: () => apiClient.getSubscriptionCredentials(id),
      enabled: !!id && hasAccess,
    });
  };

  // Report subscription mutation
  const reportSubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      reason 
    }: { 
      id: number; 
      reason: string 
    }) => apiClient.reportSubscription(id, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(variables.id) });
    },
  });

  return {
    subscriptions: subscriptionsData?.data || [],
    mySubscriptions: mySubscriptionsData?.data || [],
    sharedSubscriptions: sharedSubscriptionsData?.data || [],
    isLoadingSubscriptions,
    isLoadingMySubscriptions,
    isLoadingSharedSubscriptions,
    useSubscription,
    useSubscriptionCredentials,
    createSubscription: createSubscriptionMutation.mutateAsync,
    updateSubscription: updateSubscriptionMutation.mutateAsync,
    deleteSubscription: deleteSubscriptionMutation.mutateAsync,
    unlockSubscription: unlockSubscriptionMutation.mutateAsync,
    reportSubscription: reportSubscriptionMutation.mutateAsync,
    createSubscriptionMutation,
    updateSubscriptionMutation,
    deleteSubscriptionMutation,
    unlockSubscriptionMutation,
    reportSubscriptionMutation,
    refetchSubscriptions,
    refetchMySubscriptions,
    refetchSharedSubscriptions,
  };
}