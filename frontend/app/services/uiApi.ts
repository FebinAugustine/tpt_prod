import { api, fetchWithAuth, handleResponse, refreshAccessToken } from './baseApi';
import { ApiResponse, Banner, OfferCard } from './types';
import { API_BASE_URL } from './types';

export const uiApi = {
  getBanners: async (): Promise<ApiResponse<Banner[]>> => {
    return api.get<Banner[]>('/uimanager/banners');
  },

  getBannerById: async (id: string): Promise<ApiResponse<Banner>> => {
    return api.get<Banner>(`/uimanager/banners/${id}`);
  },

  addBanner: async (bannerData: Omit<Banner, '_id' | 'createdAt' | 'updatedAt'>, image?: File): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));

    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetchWithAuth<Banner>(`${API_BASE_URL}/uimanager/banners`, {
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

  updateBanner: async (id: string, bannerData: Partial<Banner>, image?: File): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    formData.append('banner', JSON.stringify(bannerData));

    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetchWithAuth<Banner>(`${API_BASE_URL}/uimanager/banners/${id}`, {
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

  deleteBanner: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/uimanager/banners/${id}`);
  },

  getOfferCards: async (): Promise<ApiResponse<OfferCard[]>> => {
    return api.get<OfferCard[]>('/uimanager/offer-cards');
  },

  getOfferCardById: async (id: string): Promise<ApiResponse<OfferCard>> => {
    return api.get<OfferCard>(`/uimanager/offer-cards/${id}`);
  },

  addOfferCard: async (cardData: Omit<OfferCard, '_id' | 'createdAt' | 'updatedAt'>, image?: File): Promise<ApiResponse<OfferCard>> => {
    const formData = new FormData();
    formData.append('offerCard', JSON.stringify(cardData));

    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetchWithAuth<OfferCard>(`${API_BASE_URL}/uimanager/offer-cards`, {
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

  deleteOfferCard: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/uimanager/offer-cards/${id}`);
  },
};