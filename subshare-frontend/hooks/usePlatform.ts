import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import type { SubscriptionPlatform } from "@/types";

export function usePlatforms() {
  const queryClient = useQueryClient();

  // Get all platforms
  const { 
    data: platformsData, 
    isLoading: isLoadingPlatforms,
    refetch: refetchPlatforms 
  } = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: () => apiClient.getPlatforms(),
  });

  // Create platform mutation (admin only)
  const createPlatformMutation = useMutation({
    mutationFn: (data: {
      name: string;
      logo_url?: string;
    }) => apiClient.createPlatform(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
    },
  });

  // Update platform mutation (admin only)
  const updatePlatformMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: Partial<SubscriptionPlatform> 
    }) => apiClient.updatePlatform(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform(variables.id) });
    },
  });

  // Verify platform mutation (admin only)
  const verifyPlatformMutation = useMutation({
    mutationFn: (id: number) => apiClient.verifyPlatform(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform(id) });
    },
  });

  // Helper to get platform by id
  const getPlatformById = (id: number) => {
    return platformsData?.data?.find(p => p.id === id);
  };

  // Helper to get active platforms only
  const getActivePlatforms = () => {
    return platformsData?.data?.filter(p => p.is_active && p.status) || [];
  };

  return {
    platforms: platformsData?.data || [],
    activePlatforms: getActivePlatforms(),
    isLoadingPlatforms,
    getPlatformById,
    getActivePlatforms,
    createPlatform: createPlatformMutation.mutateAsync,
    updatePlatform: updatePlatformMutation.mutateAsync,
    verifyPlatform: verifyPlatformMutation.mutateAsync,
    createPlatformMutation,
    updatePlatformMutation,
    verifyPlatformMutation,
    refetchPlatforms,
  };
}