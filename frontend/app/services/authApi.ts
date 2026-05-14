import { api, fetchWithAuth, handleResponse } from './baseApi';
import {
  ApiResponse,
  User,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  StatsData,
} from './types';
import { API_BASE_URL } from './types';

export const authApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }, { credentials: 'include' }),

  logout: () =>
    api.post('/auth/logout', undefined, { credentials: 'include' }),

   register: (fullName: string, email: string, password: string, phone: string) =>
     api.post<RegisterResponse>('/auth/register', { fullName, email, password, phone }),

  forgotPassword: (email: string) =>
    api.post<ForgotPasswordResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ResetPasswordResponse>('/auth/reset-password', { token, newPassword }),

  getProfile: () =>
    api.get<User>('/auth/profile'),

  addUser: (fullName: string, email: string, password: string, role: string) =>
    api.post('/auth/add-user', { fullName, email, password, role }),

  getStats: () =>
    api.get<StatsData>('/auth/stats'),

  getUsers: (page?: number, limit?: number, search?: string) =>
    api.get<any>(`/auth/users?page=${page || 1}&limit=${limit || 20}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  updateUser: (id: string, data: any) =>
    api.put(`/auth/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/auth/users/${id}`),

  // Addresses
  getAddresses: () =>
    api.get<any>('/addresses'),

  addAddress: (data: any) =>
    api.post('/addresses', data),

  updateAddress: (id: string, data: any) =>
    api.put(`/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete(`/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.put(`/addresses/${id}/set-default`),

  createAddress: (data: any) =>
    api.post('/addresses', data),

  // Orders
  getOrders: (page?: number, limit?: number, search?: string, status?: string) =>
    api.get<any>(`/orders?page=${page || 1}&limit=${limit || 20}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${status}` : ''}`),

  getOrderById: (id: string) =>
    api.get<any>(`/orders/${id}`),

  createOrder: (data: any) =>
    api.post<any>('/orders', data),

   updateOrderStatus: (id: string, status: string) =>
     api.put(`/orders/${id}/status`, { orderStatus: status }),

  cancelOrder: (id: string) =>
    api.delete(`/orders/${id}`),

   updatePaymentStatus: (orderId: string, status: string) =>
     api.put(`/orders/${orderId}/payment`, { paymentStatus: status }),

  // User
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  deleteAccount: () =>
    api.delete('/auth/account'),

  // Products
  getProducts: () =>
    api.get<any>('/products'),

  getProductById: (id: string) =>
    api.get<any>(`/products/${id}`),

  addProduct: async (productData: any, images?: File[]) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    if (images && images.length > 0) images.forEach(img => formData.append('images', img));

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        const retryResponse = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        return handleResponse<any>(retryResponse);
      }
    }

    return handleResponse<any>(response);
  },

  updateProduct: async (id: string, productData: any, images?: File[], removedImageIndices?: number[]) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    if (images && images.length > 0) images.forEach(img => formData.append('images', img));
    if (removedImageIndices && removedImageIndices.length > 0) formData.append('removedImageIndices', JSON.stringify(removedImageIndices));

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        const retryResponse = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formData,
        });
        return handleResponse<any>(retryResponse);
      }
    }

    return handleResponse<any>(response);
  },

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),

  searchProducts: (query: string, limit = 10) =>
    api.get<any>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Categories
  getCategories: () =>
    api.get<any>('/categories'),

  addCategory: (name: string, description = '', isActive = true, sortOrder = 0) =>
    api.post('/categories', { name, description, isActive, sortOrder }),

  updateCategory: (id: string, data: any) =>
    api.put(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),

  // Banners
  getBanners: () =>
    api.get<any>('/uimanager/banners'),

  getBannerById: (id: string) =>
    api.get<any>(`/uimanager/banners/${id}`),

  addBanner: (bannerData: any, image?: File) => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));
    if (image) formData.append('image', image);
    return fetchWithAuth(`${API_BASE_URL}/uimanager/banners`, { method: 'POST', body: formData });
  },

  updateBanner: (id: string, bannerData: any, image?: File) => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));
    if (image) formData.append('image', image);
    return fetchWithAuth(`${API_BASE_URL}/uimanager/banners/${id}`, { method: 'PUT', body: formData });
  },

  deleteBanner: (id: string) =>
    api.delete(`/uimanager/banners/${id}`),

  // Offer Cards
  getOfferCards: () =>
    api.get<any>('/uimanager/offer-cards'),

  getOfferCardById: (id: string) =>
    api.get<any>(`/uimanager/offer-cards/${id}`),

  addOfferCard: (cardData: any, image?: File) => {
    const formData = new FormData();
    formData.append('offerCard', JSON.stringify(cardData));
    if (image) formData.append('image', image);
    return fetchWithAuth(`${API_BASE_URL}/uimanager/offer-cards`, { method: 'POST', body: formData });
  },

  deleteOfferCard: (id: string) =>
    api.delete(`/uimanager/offer-cards/${id}`),

  // Careers
  getCareers: (active?: boolean) =>
    api.get<any>(`/careers${active ? '?active=true' : ''}`),

  addCareer: (data: any) =>
    api.post('/careers', data),

  updateCareer: (id: string, data: any) =>
    api.put(`/careers/${id}`, data),

  deleteCareer: (id: string) =>
    api.delete(`/careers/${id}`),

  // Press
  getPress: (active?: boolean) =>
    api.get<any>(`/press${active ? '?active=true' : ''}`),

  addPress: (data: any) =>
    api.post('/press', data),

  updatePress: (id: string, data: any) =>
    api.put(`/press/${id}`, data),

  deletePress: (id: string) =>
    api.delete(`/press/${id}`),

  // Settings
  getUpiSettings: () =>
    api.get<any>('/settings/upi'),

  updateUpiSettings: (data: any) =>
    api.put('/settings/upi', data),

  setUpiSettings: (data: any, file?: File) => {
    const formData = new FormData();
    formData.append('settings', JSON.stringify(data));
    if (file) formData.append('qrCode', file);
    return fetchWithAuth(`${API_BASE_URL}/settings/upi`, { method: 'PUT', body: formData });
  },
};
