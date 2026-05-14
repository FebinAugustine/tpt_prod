import { API_BASE_URL } from './types';

export const handleResponse = async <T>(response: Response): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      error: data.error || data.message || `HTTP error! status: ${response.status}`,
    };
  }

  return {
    success: true,
    data: data as T,
    message: data.message,
  };
};

const refreshAccessToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      const refreshResponse = await refreshAccessToken();

      if (refreshResponse.success) {
        const retryResponse = await fetch(url, {
          ...options,
          credentials: 'include',
        });

        return handleResponse(retryResponse);
      }

      // Refresh failed — clear auth state by calling logout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      return {
        success: false,
        error: 'Session expired. Please log in again.',
      };
    }

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
    return fetchWithAuth<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
    });
  },

  post: async <T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
    return fetchWithAuth<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put: async <T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
    return fetchWithAuth<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete: async <T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
    return fetchWithAuth<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
    });
  },
};

export { refreshAccessToken, fetchWithAuth };