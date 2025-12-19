export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const config = {
  apiBaseUrl: API_BASE_URL,
  tokenKey: 'access_token',
  roleKey: 'user_role',
  userKey: 'user_data',
};

export * from './axios';
export * from './queryClient';
