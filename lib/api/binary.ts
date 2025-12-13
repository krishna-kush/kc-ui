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

  upload: async (file: File, description?: string, filename?: string) => {
    const formData = new FormData();
    formData.append("binary", file, filename || file.name);
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
    
    // Step 1: Get one-time download token (requires auth)
    const tokenResponse = await api.post<{
      token: string;
      download_url: string;
      expires_in: number;
    }>(`/binary/${id}/download-token`, { license_id: licenseId });
    
    // Step 2: Construct download URL using frontend's baseURL (not server's internal URL)
    // The server may return localhost URL, but we use the public API URL
    const token = tokenResponse.data.token;
    const downloadUrl = licenseId
      ? `${baseURL}/download/${id}?license_id=${licenseId}&token=${token}`
      : `${baseURL}/download/${id}?token=${token}`;
    
    // Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Return a resolved promise (download started)
    return Promise.resolve();
  },

  // Legacy download method that returns blob (for cases where you need the data in memory)
  downloadBlob: async (id: string, licenseId?: string) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const url = licenseId 
      ? `${baseURL}/binary/${id}/download?license_id=${licenseId}`
      : `${baseURL}/binary/${id}/download`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Download failed');
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
