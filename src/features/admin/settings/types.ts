export interface AdmissionFeeResponse {
  id: number;
  schoolId: number;
  admissionFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdmissionFeeInput {
  admissionFee: number;
}
