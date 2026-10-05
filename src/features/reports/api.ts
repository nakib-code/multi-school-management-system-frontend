
import { api } from "@/lib/api";
import type { ReportOverview } from "./types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getReportOverview = async (): Promise<ReportOverview> => {
  const response = await api.get<ApiResponse<ReportOverview>>(
    "/reports",
  );

  return response.data.data;
};
