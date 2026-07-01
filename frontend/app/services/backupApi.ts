import { api } from './baseApi';
import { API_BASE_URL } from './types';

export type ExportFormat = 'json' | 'excel' | 'pdf';
export type ExportType = 'users' | 'products' | 'orders' | 'categories' | 'all';
export type DateRangeOption = 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months';

export interface ExportSingleResponse {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
}

export interface ExportResponse {
  success: boolean;
  data?: any;
  filename?: string;
  count?: number;
  message?: string;
  error?: string;
}

export interface ExportSingleResponse {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
}

export interface ExportAllResponse {
  success: boolean;
  files?: { blob: Blob; filename: string }[];
  error?: string;
}

export const backupApi = {
  exportData: async (
    format: ExportFormat,
    type: ExportType,
    dateRange?: DateRangeOption,
  ): Promise<ExportSingleResponse> => {
    try {
      const dateParam = dateRange && dateRange !== 'all' ? `&dateRange=${dateRange}` : '';
      const response = await fetch(`${API_BASE_URL}/backup/export?format=${format}&type=${type}${dateParam}`, {
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

  exportAllData: async (
    format: ExportFormat,
    dateRange?: DateRangeOption,
  ): Promise<ExportAllResponse> => {
    const types: ExportType[] = ['users', 'products', 'categories', 'orders'];
    try {
      const results = await Promise.all(
        types.map((type) => backupApi.exportData(format, type, dateRange)),
      );

      const files = results
        .filter((r) => r.success && r.blob && r.filename)
        .map((r) => ({ blob: r.blob!, filename: r.filename! }));

      if (files.length === 0) {
        return { success: false, error: 'No files were generated' };
      }

      return { success: true, files };
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