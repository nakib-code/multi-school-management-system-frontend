import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import type {
  CreateSchoolInput,
  CreateSchoolResponse,
  RejectSchoolPayload,
  VerifyAdminEmailPayload,
  VerifyAdminEmailResponse,
} from "./types";

import type { School } from "@/types/school";

// ============================================
// Public School Registration
// ============================================

export const createSchool = async (
  payload: CreateSchoolInput,
): Promise<CreateSchoolResponse> => {
  const response = await api.post<
    ApiResponse<CreateSchoolResponse>
  >("/schools/register", payload);

  return response.data.data;
};

export const verifyAdminEmail = async (
  payload: VerifyAdminEmailPayload,
): Promise<VerifyAdminEmailResponse> => {
  const response = await api.post<
    ApiResponse<VerifyAdminEmailResponse>
  >("/schools/verify-admin-email", payload);

  return response.data.data;
};

// ============================================
// Super Admin - School Management
// ============================================

export interface GetSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: School["status"];
}

export interface SchoolListResponse {
  schools: School[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getSchools = async (
  params: GetSchoolsParams = {},
): Promise<SchoolListResponse> => {
  const response = await api.get<
    ApiResponse<SchoolListResponse>
  >("/schools", {
    params,
  });

  return response.data.data;
};

export const approveSchool = async (
  id: number,
): Promise<School> => {
  const response = await api.patch<ApiResponse<School>>(
    `/schools/${id}/approve`,
  );

  return response.data.data;
};

export const blockSchool = async (
  id: number,
): Promise<School> => {
  const response = await api.patch<ApiResponse<School>>(
    `/schools/${id}/block`,
  );

  return response.data.data;
};

export const unblockSchool = async (
  id: number,
): Promise<School> => {
  const response = await api.patch<ApiResponse<School>>(
    `/schools/${id}/unblock`,
  );

  return response.data.data;
};

export const rejectSchool = async (
  id: number,
  payload: RejectSchoolPayload,
): Promise<School> => {
  const response = await api.patch<ApiResponse<School>>(
    `/schools/${id}/reject`,
    payload,
  );

  return response.data.data;
};

export const deleteSchool = async (
  id: number,
): Promise<{
  schoolId: number;
  deleted: boolean;
}> => {
  const response = await api.delete<
    ApiResponse<{
      schoolId: number;
      deleted: boolean;
    }>
  >(`/schools/${id}`);

  return response.data.data;
};


// ============================================
// Public - School Details
// ============================================

export const getPublicSchoolById = async (
  id: number,
): Promise<School> => {
  const response = await api.get<ApiResponse<School>>(
    `/schools/${id}/public`,
  );

  return response.data.data;
};



// ============================================
// Public - School List
// ============================================

export interface GetPublicSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PublicSchoolListResponse {
  schools: School[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPublicSchools = async (
  params: GetPublicSchoolsParams = {},
): Promise<PublicSchoolListResponse> => {
  const response = await api.get<
    ApiResponse<PublicSchoolListResponse>
  >("/schools/public", {
    params,
  });

  return response.data.data;
};