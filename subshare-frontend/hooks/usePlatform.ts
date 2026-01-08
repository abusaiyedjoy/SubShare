import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function usePlatforms() {
  const queryClient = useQueryClient();

  // Get all platforms
  const { 
    data: platformsData, 
    isLoading: isLoadingPlatforms,
    refetch: refetchPlatforms 
  } = useQuery({
    queryKey: ["platforms"],
    queryFn: () => apiClient.getPlatforms(),
  });

  // Search platforms
  const searchPlatformsMutation = useMutation({
    mutationFn: ({ searchTerm, activeOnly }: { searchTerm: string; activeOnly?: boolean }) => 
      apiClient.searchPlatforms(searchTerm, activeOnly),
  });

  // Create platform mutation (admin only)
  const createPlatformMutation = useMutation({
    mutationFn: (data: {
      name: string;
      logo_url?: string;
    }) => apiClient.createPlatform(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
  });

  // Update platform mutation (admin only)
  const updatePlatformMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: any
    }) => apiClient.updatePlatform(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      queryClient.invalidateQueries({ queryKey: ["platform", variables.id] });
    },
  });

  // Verify platform mutation (admin only)
  const verifyPlatformMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiClient.verifyPlatform(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      queryClient.invalidateQueries({ queryKey: ["platform", variables.id] });
    },
  });

  // Delete platform mutation (admin only)
  const deletePlatformMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePlatform(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
  });

  // Helper to get platform by id
  const getPlatformById = (id: number) => {
    return platformsData?.find((p: any) => p.id === id);
  };

  // Helper to get active platforms only
  const getActivePlatforms = () => {
    return platformsData?.filter((p: any) => p.is_active && p.status) || [];
  };

  return {
    platforms: platformsData || [],
    activePlatforms: getActivePlatforms(),
    isLoadingPlatforms,
    getPlatformById,
    getActivePlatforms,
    searchPlatforms: searchPlatformsMutation.mutateAsync,
    createPlatform: createPlatformMutation.mutateAsync,
    updatePlatform: updatePlatformMutation.mutateAsync,
    verifyPlatform: verifyPlatformMutation.mutateAsync,
    deletePlatform: deletePlatformMutation.mutateAsync,
    searchPlatformsMutation,
    createPlatformMutation,
    updatePlatformMutation,
    verifyPlatformMutation,
    deletePlatformMutation,
    refetchPlatforms,
  };
}