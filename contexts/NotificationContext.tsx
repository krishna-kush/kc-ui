"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { notificationApi } from "@/lib/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "error" | "warning" | "progress";
  percentage?: number;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => Promise<string>;
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  unreadCount: number;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from database on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await notificationApi.getAll();
        setNotifications(
          data.map((n) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {
        // Silently fail - notifications are non-critical
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn("Failed to load notifications:", error instanceof Error ? error.message : 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    try {
      console.log("NotificationContext: Creating notification:", notification.title);
      const created = await notificationApi.create(notification);
      console.log("NotificationContext: Notification created successfully:", created.id);
      const newNotification: Notification = {
        ...created,
        timestamp: new Date(created.timestamp),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      return created.id;
    } catch (error) {
      console.error("NotificationContext: Failed to create notification:", error);
      if (error instanceof Error) {
        console.error("NotificationContext: Error message:", error.message);
      }
      // Fallback to local-only notification
      console.log("NotificationContext: Using fallback local notification");
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      return id;
    }
  }, []);

  const updateNotification = useCallback(async (id: string, updates: Partial<Notification>) => {
    try {
      await notificationApi.update(id, updates);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, ...updates } : notif))
      );
    } catch (error) {
      console.error("Failed to update notification:", error);
      // Still update locally on error
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, ...updates } : notif))
      );
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Still remove locally on error
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Still update locally on error
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Still update locally on error
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      // Still clear locally on error
      setNotifications([]);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        updateNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
