import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, SignupFlowStep } from '@app-types/index';
import { storage } from '@utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signupFlow: {
    step: SignupFlowStep;
    email: string;
    userId: string;
  };
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  login: (user: User, token: string, role: UserRole) => void;
  logout: () => void;
  setSignupFlowStep: (step: SignupFlowStep) => void;
  setSignupFlowEmail: (email: string) => void;
  setSignupFlowUserId: (userId: string) => void;
  resetSignupFlow: () => void;
}

const initialSignupFlow = {
  step: 'signup' as SignupFlowStep,
  email: '',
  userId: '',
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isAuthenticated: storage.isAuthenticated(),
      user: storage.getUser(),
      role: storage.getRole(),
      loading: false,
      signupFlow: initialSignupFlow,

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setLoading: (loading) => set({ loading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      login: (user, token, role) => {
        storage.setToken(token);
        storage.setUser(user);
        storage.setRole(role);
        set({ isAuthenticated: true, user, role });
      },

      logout: () => {
        storage.clearAuth();
        set({
          isAuthenticated: false,
          user: null,
          role: null,
          signupFlow: initialSignupFlow,
        });
      },

      setSignupFlowStep: (step) =>
        set((state) => ({
          signupFlow: { ...state.signupFlow, step },
        })),

      setSignupFlowEmail: (email) =>
        set((state) => ({
          signupFlow: { ...state.signupFlow, email },
        })),

      setSignupFlowUserId: (userId) =>
        set((state) => ({
          signupFlow: { ...state.signupFlow, userId },
        })),

      resetSignupFlow: () => set({ signupFlow: initialSignupFlow }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        signupFlow: state.signupFlow,
      }),
    }
  )
);
