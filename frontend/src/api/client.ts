import axios from 'axios';
import { User, Customer, Product, Challan, PaginatedResponse, FollowUp, StockMovement } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post<{user: User, token: string}>('/auth/login', data).then(r => r.data),
  getMe: () => api.get<User>('/auth/me').then(r => r.data),
};

export const customersApi = {
  list: (params?: any) => api.get<PaginatedResponse<Customer>>('/customers', { params }).then(r => r.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data).then(r => r.data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  getFollowUps: (id: string) => api.get<FollowUp[]>(`/customers/${id}/follow-ups`).then(r => r.data),
  addFollowUp: (id: string, data: { note: string }) => api.post<FollowUp>(`/customers/${id}/follow-ups`, data).then(r => r.data),
};

export const productsApi = {
  list: (params?: any) => api.get<PaginatedResponse<Product>>('/products', { params }).then(r => r.data),
  getById: (id: string) => api.get<Product>(`/products/${id}`).then(r => r.data),
  create: (data: Partial<Product>) => api.post<Product>('/products', data).then(r => r.data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data).then(r => r.data),
  getStockMovements: (id: string) => api.get<StockMovement[]>(`/products/${id}/stock-movements`).then(r => r.data),
  addStockMovement: (id: string, data: any) => api.post<StockMovement>(`/products/${id}/stock-movements`, data).then(r => r.data),
};

export const challansApi = {
  list: (params?: any) => api.get<PaginatedResponse<Challan>>('/challans', { params }).then(r => r.data),
  getById: (id: string) => api.get<Challan>(`/challans/${id}`).then(r => r.data),
  create: (data: any) => api.post<Challan>('/challans', data).then(r => r.data),
  confirm: (id: string) => api.put<Challan>(`/challans/${id}/confirm`).then(r => r.data),
  cancel: (id: string) => api.put<Challan>(`/challans/${id}/cancel`).then(r => r.data),
};
