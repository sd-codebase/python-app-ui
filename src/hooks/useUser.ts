import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@services/user.service';
import { getErrorMessage } from '@utils/helpers';
import type { User, UserFilters, UserCreate, UserUpdate } from '@app-types/index';

export const useUser = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    profile: profile?.data,
    isLoadingProfile,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error
      ? getErrorMessage(updateProfileMutation.error)
      : null,
  };
};

export const useUsers = (filters?: UserFilters) => {
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getAllUsers(filters),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserCreate) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => userService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
  });

  return {
    users: users?.data || [],
    isLoadingUsers,
    refetchUsers: refetch,
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,
    toggleActive: toggleActiveMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};
