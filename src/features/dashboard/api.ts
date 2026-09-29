import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { DashboardResponse } from "./types";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get<ApiResponse<DashboardResponse>>(
    "/dashboard",
  );

  return response.data.data;
};
