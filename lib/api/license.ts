import { api } from "./client";
import type { License, UpdateLicenseRequest } from "./types";

export const licenseApi = {
  create: async (licenseData: { 
    binary_id: string; 
    license_type?: string;
    sync_mode?: boolean;
    check_interval_ms?: number;
    grace_period?: number; 
    network_failure_kill_count?: number;
    kill_method?: string;
    max_executions?: number; 
    expires_in_seconds?: number;
    allowed_machines?: string[];
  }) => {
    const response = await api.post("/license/create", licenseData);
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<License>(`/license/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateLicenseRequest) => {
    const response = await api.patch(`/license/${id}`, data);
    return response.data;
  },

  revoke: async (id: string) => {
    const response = await api.post(`/license/${id}/revoke`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/license/${id}`);
    return response.data;
  },

  listForBinary: async (binaryId: string) => {
    const response = await api.get<License[]>(`/binary/${binaryId}/licenses`);
    return response.data;
  },

  listAll: async (params?: { page?: number; per_page?: number; status?: string; search?: string; sort_by?: string; sort_order?: string }) => {
    const response = await api.get<{
      licenses: License[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>("/licenses", { params });
    return response.data;
  },

  stats: async (licenseId: string) => {
    const response = await api.get(`/license/${licenseId}/stats`);
    return response.data;
  },

  getStats: async (licenseId: string) => {
    const response = await api.get(`/license/${licenseId}/stats`);
    return response.data;
  },
};
