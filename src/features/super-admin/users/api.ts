import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import type {
  GetSchoolUsersParams,
  SchoolUserSummary,
  SchoolUsersResponse,
} from "./types";

export const getSchoolUserSummary = async (
  schoolId: number,
): Promise<SchoolUserSummary> => {
  const response = await api.get<ApiResponse<SchoolUserSummary>>(
    `/schools/${schoolId}/users/summary`,
  );

  return response.data.data;
};

export const getSchoolUsers = async (
  schoolId: number,
  params: GetSchoolUsersParams = {},
): Promise<SchoolUsersResponse> => {
  const response = await api.get<ApiResponse<SchoolUsersResponse>>(
    `/schools/${schoolId}/users`,
    { params },
  );

  return response.data.data;
};