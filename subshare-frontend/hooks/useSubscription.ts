import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "./useToast";

interface SubscriptionFilters {
  platform_id?: number;
  verified_only?: boolean;
  active_only?: boolean;
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all subscriptions with filters (marketplace)
  const { 
    data: subscriptions = [], 
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions 
  } = useQuery({
    queryKey: ["subscriptions", filters],
    queryFn: () => apiClient.getSubscriptions(filters),
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Get single subscription
  const useSubscription = (id: number, enabled: boolean = true) => {
    return useQuery({
      queryKey: ["subscription", id],
      queryFn: () => apiClient.getSubscription(id),
      enabled: enabled && !!id && id > 0,
      staleTime: 1000 * 60 * 2,
    });
  };

  // Get my subscriptions (subscriptions I'm accessing)
  const { 
    data: mySubscriptions = [], 
    isLoading: isLoadingMySubscriptions,
    refetch: refetchMySubscriptions 
  } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => apiClient.getMySubscriptions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get shared subscriptions (subscriptions I'm sharing)
  const { 
    data: sharedSubscriptions = [], 
    isLoading: isLoadingSharedSubscriptions,
    refetch: refetchSharedSubscriptions 
  } = useQuery({
    queryKey: ["sharedSubscriptions"],
    queryFn: () => apiClient.getSharedSubscriptions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get subscription credentials
  const useSubscriptionCredentials = (id: number, enabled: boolean = true) => {
    return useQuery({
      queryKey: ["subscriptionCredentials", id],
      queryFn: () => apiClient.getSubscriptionCredentials(id),
      enabled: enabled && !!id && id > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    });
  };

  // Create subscription mutation (POST /api/subscriptions)
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
      toast.success("Subscription shared successfully! Waiting for admin verification.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share subscription");
    },
  });

  // Update subscription mutation (PUT /api/subscriptions/:id)
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
      toast.success("Subscription updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });

  // Delete subscription mutation (DELETE /api/subscriptions/:id)
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["sharedSubscriptions"] });
      toast.success("Subscription deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete subscription");
    },
  });

  // Unlock subscription mutation (POST /api/subscriptions/:id/unlock)
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
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Subscription unlocked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unlock subscription");
    },
  });

  // Report subscription mutation (POST /api/subscriptions/:id/report)
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
      toast.success("Report submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit report");
    },
  });

  // Helper functions
  const createSubscription = (data: any) => {
    return createSubscriptionMutation.mutateAsync(data);
  };

  const updateSubscription = (id: number, data: any) => {
    return updateSubscriptionMutation.mutateAsync({ id, data });
  };

  const deleteSubscription = (id: number) => {
    return deleteSubscriptionMutation.mutateAsync(id);
  };

  const unlockSubscription = (params: { id: number; hours: number }) => {
    return unlockSubscriptionMutation.mutateAsync(params);
  };

  const reportSubscription = (params: { id: number; reason: string }) => {
    return reportSubscriptionMutation.mutateAsync(params);
  };

  return {
    // Data
    subscriptions,
    mySubscriptions,
    sharedSubscriptions,

    // Loading states
    isLoadingSubscriptions,
    isLoadingMySubscriptions,
    isLoadingSharedSubscriptions,

    // Refetch functions
    refetchSubscriptions,
    refetchMySubscriptions,
    refetchSharedSubscriptions,

    // Query hooks
    useSubscription,
    useSubscriptionCredentials,

    // Mutation functions
    createSubscription,
    updateSubscription,
    deleteSubscription,
    unlockSubscription,
    reportSubscription,

    // Mutation objects (for isPending, etc.)
    createSubscriptionMutation,
    updateSubscriptionMutation,
    deleteSubscriptionMutation,
    unlockSubscriptionMutation,
    reportSubscriptionMutation,
  };
}