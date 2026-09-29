import { School, SchoolListResponse } from "@/types/school";
import { SchoolStatus } from "./types";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface GetSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SchoolStatus;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "Something went wrong",
    );
  }

  return result.data;
}

export async function getSchools(
  params: GetSchoolsParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  return apiRequest<SchoolListResponse>(
    `/schools${query ? `?${query}` : ""}`,
  );
}

export async function approveSchool(id: number) {
  return apiRequest<School>(
    `/schools/${id}/approve`,
    {
      method: "PATCH",
    },
  );
}

export async function blockSchool(id: number) {
  return apiRequest<School>(
    `/schools/${id}/block`,
    {
      method: "PATCH",
    },
  );
}

export async function unblockSchool(id: number) {
  return apiRequest<School>(
    `/schools/${id}/unblock`,
    {
      method: "PATCH",
    },
  );
}

export async function rejectSchool(
  id: number,
  rejectionReason: string,
) {
  return apiRequest<School>(
    `/schools/${id}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({
        rejectionReason,
      }),
    },
  );
}

export async function deleteSchool(id: number) {
  return apiRequest<{
    schoolId: number;
    deleted: boolean;
  }>(
    `/schools/${id}`,
    {
      method: "DELETE",
    },
  );
}