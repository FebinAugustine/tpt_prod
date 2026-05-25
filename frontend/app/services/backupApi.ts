import { api } from './baseApi';
import { API_BASE_URL } from './types';

export type ExportFormat = 'json' | 'excel' | 'pdf';
export type ExportType = 'users' | 'products' | 'orders' | 'categories' | 'all';

export interface ExportResponse {
  success: boolean;
  data?: any;
  filename?: string;
  count?: number;
  message?: string;
  error?: string;
}

export const backupApi = {
  exportData: async (
    format: ExportFormat,
    type: ExportType,
  ): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/backup/export?format=${format}&type=${type}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.error || 'Export failed' };
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const formatExtension: Record<ExportFormat, string> = {
        json: 'json',
        excel: 'xlsx',
        pdf: 'pdf',
      };

      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${type}.${formatExtension[format]}`;

      return { success: true, blob, filename };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  previewData: async (
    type: ExportType,
  ): Promise<{ success: boolean; data?: ExportResponse; error?: string }> => {
    return api.get<ExportResponse>(`/backup/preview?type=${type}`);
  },
};