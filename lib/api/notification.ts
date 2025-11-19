import axios from "axios";
import { api } from "./client";
import type { Notification, CreateNotificationRequest, UpdateNotificationRequest } from "./types";

export const notificationApi = {
  getAll: async () => {
    try {
      const response = await api.get<Notification[]>("/notifications");
      return response.data;
    } catch (error) {
      // Return empty array if endpoint doesn't exist or network error
      if (axios.isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK')) {
        return [];
      }
      throw error;
    }
  },

  create: async (notification: CreateNotificationRequest) => {
    console.log('[Notification API] Creating notification:', notification);
    console.log('[Notification API] BaseURL:', process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
    console.log('[Notification API] Full URL:', `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/notifications`);
    try {
      const response = await api.post<Notification>("/notifications", notification);
      console.log('[Notification API] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Notification API] Failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Notification API] Axios error details:', {
          code: error.code,
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          request: error.request
        });
      }
      throw error;
    }
  },

  update: async (id: string, updates: UpdateNotificationRequest) => {
    const response = await api.patch(`/notifications/${id}`, updates);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post("/notifications/read-all");
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete("/notifications");
    return response.data;
  },
};
