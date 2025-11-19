import { api, getAuthHeaders } from "./client";
import type { Binary, BinaryAnalytics } from "./types";

export const binaryApi = {
  list: async (params?: { search?: string; page?: number; per_page?: number; status?: string; sort_by?: string; sort_order?: string }) => {
    const response = await api.get<{
      binaries: Binary[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>("/binaries", { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Binary>(`/binary/${id}`);
    return response.data;
  },

  upload: async (file: File, description?: string) => {
    const formData = new FormData();
    formData.append("binary", file);
    if (description) {
      formData.append("description", description);
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${baseURL}/binary/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "Upload failed";
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<{
      binary_id: string;
      license_id: string;
      message: string;
      task_id: string;
      progress_url: string;
      progress_stream: string;
    }>;
  },

  download: async (id: string, licenseId?: string) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const url = licenseId 
      ? `${baseURL}/binary/${id}/download?license_id=${licenseId}`
      : `${baseURL}/binary/${id}/download`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  update: async (id: string, data: Partial<Binary>) => {
    const response = await api.patch(`/binary/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/binary/${id}`);
    return response.data;
  },

  analytics: async (id: string) => {
    const response = await api.get<BinaryAnalytics>(`/binary/${id}/analytics`);
    return response.data;
  },

  executions: async (id: string) => {
    const response = await api.get(`/binary/${id}/executions`);
    return response.data;
  },

  verificationAttempts: async (id: string, limit: number = 20, skip: number = 0) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(
      `${baseURL}/binary/${id}/verification-attempts?limit=${limit}&skip=${skip}`,
      {
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch verification attempts');
    }
    
    return response.json();
  },
};
