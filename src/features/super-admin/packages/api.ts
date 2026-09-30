
import { api } from "@/lib/api";
import type {
  CreatePackagePayload,
  Package,
  PackageListResponse,
  PackageResponse,
  UpdatePackagePayload,
} from "./type";

export const packageApi = {
  getAll: async (): Promise<Package[]> => {
    const response = await api.get<PackageListResponse>("/packages");

    return response.data.data;
  },

  getById: async (id: number): Promise<Package> => {
    const response = await api.get<PackageResponse>(`/packages/${id}`);

    return response.data.data;
  },

  create: async (payload: CreatePackagePayload): Promise<Package> => {
    const response = await api.post<PackageResponse>(
      "/packages",
      payload,
    );

    return response.data.data;
  },

  update: async (
    id: number,
    payload: UpdatePackagePayload,
  ): Promise<Package> => {
    const response = await api.patch<PackageResponse>(
      `/packages/${id}`,
      payload,
    );

    return response.data.data;
  },

  updateStatus: async (
    id: number,
    isActive: boolean,
  ): Promise<Package> => {
    const response = await api.patch<PackageResponse>(
      `/packages/${id}/status`,
      { isActive },
    );

    return response.data.data;
  },
};