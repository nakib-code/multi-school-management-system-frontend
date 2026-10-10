import { api } from "@/lib/api";

import type {
  AdmissionFeeResponse,
  UpdateAdmissionFeeInput,
} from "./types";

export async function getAdmissionFee(
  schoolId: number,
): Promise<AdmissionFeeResponse> {
  const response = await api.get(
    `/schools/${schoolId}/settings/admission-fee`,
  );

  return response.data.data;
}

export async function updateAdmissionFee(
  schoolId: number,
  input: UpdateAdmissionFeeInput,
): Promise<AdmissionFeeResponse> {
  const response = await api.patch(
    `/schools/${schoolId}/settings/admission-fee`,
    input,
  );

  return response.data.data;
}
