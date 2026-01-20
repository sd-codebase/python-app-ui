export type UserRole = 'user' | 'admin';
export type UserType = 'regular' | 'temp';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  user_type: UserType;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  otp_code?: string | null;
  otp_expiry?: string | null;
}

export interface UserFilters {
  role?: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
}

export interface UserCreate {
  full_name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdate {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  new_password: string;
}
