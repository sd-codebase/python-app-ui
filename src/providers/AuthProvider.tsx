import type { AuthProvider as RefineAuthProvider } from '@refinedev/core';
import { authService } from '@services/auth.service';
import { storage } from '@utils/storage';
import { useAuthStore } from '@stores/authStore';

export const createAuthProvider = (): RefineAuthProvider => {
  return {
    login: async ({ email, password }) => {
      try {
        const response = await authService.login({ email, password });
        if (response.data) {
          const { access_token, role } = response.data;
          storage.setToken(access_token);
          storage.setRole(role);

          const userResponse = await authService.getCurrentUser();
          if (userResponse.data) {
            storage.setUser(userResponse.data);
            useAuthStore.getState().login(userResponse.data, access_token, role);
          }

          return {
            success: true,
            redirectTo: role === 'admin' ? '/admin' : '/dashboard',
          };
        }
        return {
          success: false,
          error: { message: 'Login failed', name: 'LoginError' },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: 'Invalid credentials',
            name: 'LoginError',
          },
        };
      }
    },

    logout: async () => {
      try {
        await authService.logout();
      } catch {
        // Ignore logout errors
      }
      storage.clearAuth();
      useAuthStore.getState().logout();
      return {
        success: true,
        redirectTo: '/login',
      };
    },

    check: async () => {
      const token = storage.getToken();
      if (!token) {
        return {
          authenticated: false,
          redirectTo: '/login',
        };
      }

      try {
        const response = await authService.getCurrentUser();
        if (response.data) {
          storage.setUser(response.data);
          useAuthStore.getState().setUser(response.data);
          return {
            authenticated: true,
          };
        }
        return {
          authenticated: false,
          redirectTo: '/login',
        };
      } catch {
        storage.clearAuth();
        return {
          authenticated: false,
          redirectTo: '/login',
        };
      }
    },

    getPermissions: async () => {
      const role = storage.getRole();
      return role;
    },

    getIdentity: async () => {
      const user = storage.getUser();
      if (user) {
        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          avatar: undefined,
        };
      }
      return null;
    },

    onError: async (error) => {
      if (error?.statusCode === 401) {
        return {
          logout: true,
          redirectTo: '/login',
          error,
        };
      }
      return { error };
    },
  };
};

export const authProvider = createAuthProvider();
