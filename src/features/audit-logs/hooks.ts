"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AuditLogRecord {
  id: number;
  schoolId: number;
  userId: number | null;
  action: string;
  entity: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { id: number; name: string; email: string; role: string } | null;
}

export const useAuditLogs = (schoolId: number, page = 1, limit = 25) =>
  useQuery({
    queryKey: ["audit-logs", schoolId, page, limit],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        data: AuditLogRecord[];
        meta?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/schools/${schoolId}/audit-logs`, { params: { page, limit } });
      return { logs: res.data.data, meta: res.data.meta };
    },
    enabled: schoolId > 0,
  });
