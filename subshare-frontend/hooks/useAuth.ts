import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials, RegisterData } from "@/lib/api";
import { User } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  // Get current user
  const { 
    data: currentUserData, 
    isLoading: isLoadingUser,
    refetch: refetchUser
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const userData = await apiClient.getCurrentUser();
      if (userData) {
        updateUser(userData as User);
      }
      return userData;
    },
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user profile (separate from auth check)
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiClient.getUserProfile(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => apiClient.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user as User, data.token);
      queryClient.setQueryData(["currentUser"], data.user);
      queryClient.setQueryData(["userProfile"], data.user);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login error:", error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => apiClient.register(data),
    onSuccess: (data) => {
      setAuth(data.user as User, data.token);
      queryClient.setQueryData(["currentUser"], data.user);
      queryClient.setQueryData(["userProfile"], data.user);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Register error:", error.message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/");
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      router.push("/");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string }) => apiClient.updateUserProfile(data),
    onSuccess: (updatedUser) => {
      // Update all relevant caches
      updateUser(updatedUser as User);
      queryClient.setQueryData(["currentUser"], updatedUser);
      queryClient.setQueryData(["userProfile"], updatedUser);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      apiClient.updatePassword(currentPassword, newPassword),
  });

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const updateProfile = (data: { name?: string }) => {
    return updateProfileMutation.mutateAsync(data);
  };

  const updatePassword = (currentPassword: string, newPassword: string) => {
    return updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  return {
    user: userProfile || currentUserData || user,
    isAuthenticated,
    isLoadingUser: isLoadingUser || isLoadingProfile,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    refetchUser,
    refetchProfile,
    loginMutation,
    registerMutation,
    logoutMutation,
    updateProfileMutation,
    updatePasswordMutation,
  };
}