export interface AdmissionFeeResponse {
  id: number;
  schoolId: number;
  admissionFee: number;
  bkashNumber: string | null;
  nagadNumber: string | null;
  rocketNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdmissionFeeInput {
  admissionFee: number;
  bkashNumber?: string | null;
  nagadNumber?: string | null;
  rocketNumber?: string | null;
}
