"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PlatformAuditLogItem {
  id: number;
  actorId: number | null;
  action: string;
  entityType: string;
  entityId: string | null;
  schoolId: number | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor?: { id: number; name: string; email: string; role: string } | null;
  school?: { id: number; name: string; code: string; status: string } | null;
}

export const usePlatformAuditLogs = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
}) =>
  useQuery({
    queryKey: ["platform-audit-logs", params],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: PlatformAuditLogItem[];
        meta?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>("/platform-audit-logs", { params });
      return { logs: res.data.data, meta: res.data.meta };
    },
  });
