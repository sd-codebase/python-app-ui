import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@stores/authStore';
import { getErrorMessage } from '@utils/helpers';
import { ROUTES } from '@utils/constants';
import { storage } from '@utils/storage';
import type {
  SignupRequest,
  VerifyOtpRequest,
  SetPasswordRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@app-types/index';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    login: storeLogin,
    logout: storeLogout,
    setUser,
    setSignupFlowStep,
    setSignupFlowEmail,
    setSignupFlowUserId,
    resetSignupFlow,
    isAuthenticated,
    user,
    role,
    signupFlow,
  } = useAuthStore();

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (response) => {
      if (response.data) {
        setSignupFlowEmail(response.data.email);
        setSignupFlowUserId(response.data.user_id);
        setSignupFlowStep('verify-otp');
        navigate(ROUTES.VERIFY_OTP);
      }
      return response;
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      if (response.data?.verified) {
        setSignupFlowStep('set-password');
        navigate(ROUTES.SET_PASSWORD);
      }
      return response;
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: (data: SetPasswordRequest) => authService.setPassword(data),
    onSuccess: () => {
      resetSignupFlow();
      navigate(ROUTES.LOGIN);
      return { success: true };
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      if (response.data) {
        const { access_token, role } = response.data;

        // Only allow admin users
        if (role !== 'admin') {
          throw new Error('You are not authorized to access this application. Admin access only.');
        }

        // Save token first so getCurrentUser request is authenticated
        storage.setToken(access_token);
        storage.setRole(role);

        try {
          const userResponse = await authService.getCurrentUser();
          if (userResponse.data) {
            storeLogin(userResponse.data, access_token, role);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate(ROUTES.ADMIN_DASHBOARD);
          }
        } catch {
          // If getCurrentUser fails, still proceed with login
          storeLogin({ id: '', full_name: '', email: '', role, is_active: true, is_verified: true, created_at: '', updated_at: '' }, access_token, role);
          navigate(ROUTES.ADMIN_DASHBOARD);
        }
      }
      return response;
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      navigate(ROUTES.LOGIN);
      return { success: true };
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      storeLogout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    isAuthenticated,
    user: currentUser?.data || user,
    role,
    isLoadingUser,
    signupFlow,
    setUser,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error ? getErrorMessage(signupMutation.error) : null,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error ? getErrorMessage(verifyOtpMutation.error) : null,
    setPassword: setPasswordMutation.mutateAsync,
    isSettingPassword: setPasswordMutation.isPending,
    setPasswordError: setPasswordMutation.error ? getErrorMessage(setPasswordMutation.error) : null,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgettingPassword: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error ? getErrorMessage(forgotPasswordMutation.error) : null,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error ? getErrorMessage(resetPasswordMutation.error) : null,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error ? getErrorMessage(changePasswordMutation.error) : null,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    resetSignupFlow,
  };
};
