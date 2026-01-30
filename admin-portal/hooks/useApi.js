import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

export function useStats() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useOrders(params = {}) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (newParams = {}) => {
    try {
      setLoading(true);
      const response = await apiClient.getOrders({ ...params, ...newParams });
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { 
    orders, 
    pagination, 
    loading, 
    error, 
    refetch: fetchOrders 
  };
}

export function useUsers(params = {}) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async (newParams = {}) => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers({ ...params, ...newParams });
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { 
    users, 
    pagination, 
    loading, 
    error, 
    refetch: fetchUsers 
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = apiClient.getToken();
    if (token) {
      // Mock user data - replace with actual API call to validate token
      setUser({ 
        token, 
        name: 'Demo User',
        email: 'demo@eloraart.com',
        role: 'admin' // Default role - should come from API
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success) {
        // Mock role assignment based on email - replace with actual API response
        let role = 'rookie';
        if (email.includes('admin')) role = 'admin';
        else if (email.includes('install')) role = 'installation_boys';
        else if (email.includes('maintain')) role = 'maintainer';
        
        const userData = {
          ...response.data.user,
          role: response.data.user?.role || role
        };
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}