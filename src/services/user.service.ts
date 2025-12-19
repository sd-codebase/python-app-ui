import { ApiService } from './api.service';
import type {
  ApiResponse,
  User,
  UserFilters,
  UserCreate,
  UserUpdate,
  ResetPasswordResponse,
} from '@app-types/index';

class UserServiceClass extends ApiService {
  // Profile endpoints (for current user)
  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>('/api/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.patch<User>('/api/users/me', data);
  }

  // Admin user management endpoints
  async getAllUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.is_verified !== undefined) params.append('is_verified', String(filters.is_verified));
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';
    return this.get<User[]>(url);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/api/admin/users/${id}`);
  }

  async createUser(data: UserCreate): Promise<ApiResponse<User>> {
    return this.post<User, UserCreate>('/api/admin/users', data);
  }

  async updateUser(id: string, data: UserUpdate): Promise<ApiResponse<User>> {
    return this.put<User, UserUpdate>(`/api/admin/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/api/admin/users/${id}`);
  }

  async resetPassword(id: string): Promise<ApiResponse<ResetPasswordResponse>> {
    return this.post<ResetPasswordResponse>(`/api/admin/users/${id}/reset-password`);
  }

  async toggleActive(id: string): Promise<ApiResponse<User>> {
    return this.post<User>(`/api/admin/users/${id}/toggle-active`);
  }
}

export const userService = new UserServiceClass();
