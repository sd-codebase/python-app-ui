import { ApiService } from './api.service';
import type {
  SignupRequest,
  SignupResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  SetPasswordRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ApiResponse,
  User,
} from '@app-types/index';

class AuthServiceClass extends ApiService {
  async signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    return this.post<SignupResponse>('/api/auth/signup', data);
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> {
    return this.post<VerifyOtpResponse>('/api/auth/verify-otp', data);
  }

  async setPassword(data: SetPasswordRequest): Promise<ApiResponse<User>> {
    return this.post<User>('/api/auth/set-password', data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/api/auth/login', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    return this.post<null>('/api/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return this.post<null>('/api/auth/reset-password', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return this.post<null>('/api/auth/change-password', data);
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/api/auth/me');
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.post<null>('/api/auth/logout');
  }
}

export const authService = new AuthServiceClass();
