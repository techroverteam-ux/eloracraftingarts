import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

class MobileApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        this.setToken(token);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    }
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
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/api/v1/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken } = response.data.data;
              this.setToken(accessToken);
              await AsyncStorage.setItem('token', accessToken);
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearAuth();
            // Navigate to login screen
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  async clearAuth() {
    this.token = null;
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/api/v1/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    
    this.setToken(accessToken);
    await AsyncStorage.multiSet([
      ['token', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuth();
    }
  }

  // Orders
  async getMyOrders() {
    const response = await this.client.get('/api/v1/orders/my-orders');
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/api/v1/orders/${id}`);
    return response.data;
  }

  // Measurements
  async submitMeasurement(data: {
    orderId: string;
    measurements: Record<string, number>;
    notes?: string;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
  }) {
    const response = await this.client.post('/api/v1/measurements', data);
    return response.data;
  }

  // File upload
  async uploadFile(uri: string, category?: string) {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'measurement.jpg',
    } as any);
    
    if (category) {
      formData.append('category', category);
    }

    const response = await this.client.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Installation
  async submitInstallation(data: {
    orderId: string;
    completionChecklist: Record<string, boolean>;
    notes?: string;
  }) {
    const response = await this.client.post('/api/v1/installations', data);
    return response.data;
  }
}

export const mobileApiClient = new MobileApiClient();
export default mobileApiClient;