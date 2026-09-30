import { api } from "@/lib/api";
import { CustomPackageRequest, CustomPackageRequestListResponse, CustomPackageRequestResponse, ReviewCustomPackageRequestPayload } from "./type";


export const customPackageRequestApi = {
  getAll: async (): Promise<CustomPackageRequest[]> => {
    const response =
      await api.get<CustomPackageRequestListResponse>(
        "/custom-package-requests",
      );

    return response.data.data;
  },

  getById: async (
    id: number,
  ): Promise<CustomPackageRequest> => {
    const response =
      await api.get<CustomPackageRequestResponse>(
        `/custom-package-requests/${id}`,
      );

    return response.data.data;
  },

  review: async (
    id: number,
    payload: ReviewCustomPackageRequestPayload,
  ): Promise<CustomPackageRequest> => {
    const response =
      await api.patch<CustomPackageRequestResponse>(
        `/custom-package-requests/${id}/review`,
        payload,
      );

    return response.data.data;
  },
};