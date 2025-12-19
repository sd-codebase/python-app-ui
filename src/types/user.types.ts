export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
