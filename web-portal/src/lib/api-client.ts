import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/api/v1/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken } = response.data.data;
              this.setToken(accessToken);
              localStorage.setItem('token', accessToken);
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearAuth() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload
  async uploadFile(file: File, category?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    return this.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.post('/api/v1/auth/login', { email, password });
  }

  async logout() {
    return this.post('/api/v1/auth/logout');
  }

  async getProfile() {
    return this.post('/api/v1/auth/me');
  }

  // Orders
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
  }) {
    return this.get<PaginatedResponse<any>>('/api/v1/orders', { params });
  }

  async getOrder(id: string) {
    return this.get(`/api/v1/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.post('/api/v1/orders', data);
  }

  async updateOrder(id: string, data: any) {
    return this.patch(`/api/v1/orders/${id}`, data);
  }

  async deleteOrder(id: string) {
    return this.delete(`/api/v1/orders/${id}`);
  }

  // Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }) {
    return this.get<PaginatedResponse<any>>('/api/v1/users', { params });
  }

  async getUser(id: string) {
    return this.get(`/api/v1/users/${id}`);
  }

  async createUser(data: any) {
    return this.post('/api/v1/users', data);
  }

  async updateUser(id: string, data: any) {
    return this.patch(`/api/v1/users/${id}`, data);
  }

  // Clients
  async getClients(params?: { page?: number; limit?: number }) {
    return this.get<PaginatedResponse<any>>('/api/v1/users/clients/list', { params });
  }

  async getClient(id: string) {
    return this.get(`/api/v1/users/clients/${id}`);
  }

  async createClient(data: any) {
    return this.post('/api/v1/users/clients', data);
  }
}

export const apiClient = new ApiClient();
export default apiClient;