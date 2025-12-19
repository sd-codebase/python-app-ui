import apiClient from '@config/axios';
import type { ApiResponse } from '@app-types/index';

export class ApiService {
  protected async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url);
    return response.data;
  }

  protected async post<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  protected async put<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  protected async patch<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  }
}
