import type { User, UserRole } from './user.types';

export interface SignupRequest {
  full_name: string;
  email: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
}

export interface SetPasswordRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export type SignupFlowStep = 'signup' | 'verify-otp' | 'set-password' | 'complete';

export interface SignupFlowState {
  step: SignupFlowStep;
  email: string;
  userId: string;
}
