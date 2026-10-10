import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdmissionFee,
  updateAdmissionFee,
} from "./api";

import type { UpdateAdmissionFeeInput } from "./types";

export function useAdmissionFee(
  schoolId: number | null,
) {
  return useQuery({
    queryKey: ["school-settings", schoolId, "admission-fee"],

    queryFn: async () => {
      try {
        return await getAdmissionFee(schoolId!);
      } catch (error: any) {
        // Setting does not exist yet.
        // Admin can create it by saving the admission fee.
        if (error?.response?.status === 404) {
          return null;
        }

        throw error;
      }
    },

    enabled: !!schoolId,
  });
}

export function useUpdateAdmissionFee(
  schoolId: number | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdmissionFeeInput) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }

      return updateAdmissionFee(
        schoolId,
        input,
      );
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        [
          "school-settings",
          schoolId,
          "admission-fee",
        ],
        data,
      );
    },
  });
}
