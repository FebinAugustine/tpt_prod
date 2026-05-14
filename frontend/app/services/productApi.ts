import { api, fetchWithAuth, handleResponse, refreshAccessToken } from './baseApi';
import { ApiResponse, Product, Category, AddProductDto } from './types';
import { API_BASE_URL } from './types';

export const productApi = {
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>('/products');
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return api.get<Product>(`/products/${id}`);
  },

  searchProducts: async (query: string, limit = 10): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  addProduct: async (productData: AddProductDto, images?: File[]): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    try {
      const response = await fetchWithAuth<Product>(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  updateProduct: async (id: string, productData: AddProductDto, images?: File[], removedImageIndices?: number[]): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    if (removedImageIndices && removedImageIndices.length > 0) {
      formData.append('removedImageIndices', JSON.stringify(removedImageIndices));
    }

    try {
      const response = await fetchWithAuth<Product>(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/products/${id}`);
  },
};

export const categoryApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return api.get<Category[]>('/categories');
  },

  addCategory: async (name: string, description = '', isActive = true, sortOrder = 0): Promise<ApiResponse<Category>> => {
    return api.post<Category>('/categories', { name, description, isActive, sortOrder });
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return api.put<Category>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/categories/${id}`);
  },
};