import { api } from "@/lib/api";
import type { PublicPackage } from "./types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getPublicPackages = async (): Promise<PublicPackage[]> => {
  const response = await api.get<ApiResponse<PublicPackage[]>>(
    "/packages/public",
  );

  return response.data.data;
};