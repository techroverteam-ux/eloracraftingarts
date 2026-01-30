class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.token || this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.data.accessToken) {
      this.setToken(data.data.accessToken);
    }
    
    return data;
  }

  async logout() {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Stats endpoint
  async getStats() {
    return this.request('/api/v1/stats');
  }

  // Orders endpoints
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/orders?${queryString}`);
  }

  async getOrder(id) {
    return this.request(`/api/v1/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id) {
    return this.request(`/api/v1/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/users?${queryString}`);
  }

  async getUser(id) {
    return this.request(`/api/v1/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(id) {
    return this.request(`/api/v1/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  async activateUser(id) {
    return this.request(`/api/v1/users/${id}/activate`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;