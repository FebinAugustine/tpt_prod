import { api } from './baseApi';
import { ApiResponse, Order, Address } from './types';

export const orderApi = {
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    return api.get<Order[]>('/orders');
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return api.get<Order>(`/orders/${id}`);
  },

  createOrder: async (data: {
    items: { product: string; quantity: number }[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
  }): Promise<ApiResponse<Order>> => {
    return api.post<Order>('/orders', data);
  },

  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    return api.put<Order>(`/orders/${id}/status`, { orderStatus: status });
  },

  cancelOrder: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/orders/${id}`);
  },
};

export const addressApi = {
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    return api.get<Address[]>('/addresses');
  },

  addAddress: async (data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<Address>> => {
    return api.post<Address>('/addresses', data);
  },

  updateAddress: async (id: string, data: Partial<Address>): Promise<ApiResponse<Address>> => {
    return api.put<Address>(`/addresses/${id}`, data);
  },

  deleteAddress: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<ApiResponse<Address>> => {
    return api.put<Address>(`/addresses/${id}/set-default`);
  },
};