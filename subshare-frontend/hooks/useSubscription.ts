import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface SubscriptionFilters {
  platform_id?: number;
  verified_only?: boolean;
  active_only?: boolean;
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  const queryClient = useQueryClient();

  // Get all subscriptions with filters
  const { 
    data: subscriptionsData, 
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions 
  } = useQuery({
    queryKey: ["subscriptions", filters],
    queryFn: () => apiClient.getSubscriptions(filters),
  });

  // Get single subscription
  const useSubscription = (id: number) => {
    return useQuery({
      queryKey: ["subscription", id],
      queryFn: () => apiClient.getSubscription(id),
      enabled: !!id && id > 0,
    });
  };

  // Get my subscriptions (accessed)
  const { 
    data: mySubscriptionsData, 
    isLoading: isLoadingMySubscriptions,
    refetch: refetchMySubscriptions 
  } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => apiClient.getMySubscriptions(),
  });

  // Get shared subscriptions (created by me)
  const { 
    data: sharedSubscriptionsData, 
    isLoading: isLoadingSharedSubscriptions,
    refetch: refetchSharedSubscriptions 
  } = useQuery({
    queryKey: ["sharedSubscriptions"],
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
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["sharedSubscriptions"] });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: {
        credentials_username?: string;
        credentials_password?: string;
        price_per_hour?: number;
        status?: boolean;
      }
    }) => apiClient.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["sharedSubscriptions"] });
    },
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["sharedSubscriptions"] });
    },
  });

  // Unlock subscription mutation
  const unlockSubscriptionMutation = useMutation({
    mutationFn: ({ 
      id, 
      hours 
    }: { 
      id: number; 
      hours: number 
    }) => apiClient.unlockSubscription(id, hours),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
    },
  });

  // Get subscription credentials
  const useSubscriptionCredentials = (id: number, hasAccess: boolean) => {
    return useQuery({
      queryKey: ["subscriptionCredentials", id],
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
    }) => apiClient.createReport(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription", variables.id] });
    },
  });

  return {
    subscriptions: subscriptionsData || [],
    mySubscriptions: mySubscriptionsData || [],
    sharedSubscriptions: sharedSubscriptionsData || [],
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