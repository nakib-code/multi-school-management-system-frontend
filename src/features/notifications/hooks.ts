"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";

export interface NotificationItem {
  id: number;
  schoolId: number | null;
  recipientId: number;
  title: string;
  message: string;
  type: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    [...notificationKeys.all, "list", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: { notifications: NotificationItem[]; unreadCount: number };
        meta?: { page: number; limit: number; total: number; totalPages: number };
      }>("/notifications", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 15,
          ...(params?.isRead !== undefined ? { isRead: String(params.isRead) } : {}),
        },
      });
      return {
        notifications: res.data.data.notifications,
        unreadCount: res.data.data.unreadCount,
        meta: res.data.meta,
      };
    },
    refetchInterval: 15_000, // Serverless-compatible polling fallback
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: { unreadCount: number };
      }>("/notifications/unread-count");
      return res.data.data.unreadCount;
    },
    refetchInterval: 15_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update notification")),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to mark all as read")),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      toast.success("Notification deleted");
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete notification")),
  });
};
