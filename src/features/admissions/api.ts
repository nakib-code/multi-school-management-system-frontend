import type {
  CreateAdmissionInput,
  CreateAdmissionResponse,
  TrackAdmissionInput,
  TrackAdmissionResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api/v1";

export async function createAdmission(
  input: CreateAdmissionInput,
): Promise<CreateAdmissionResponse> {
  const response = await fetch(
    `${API_URL}/schools/${input.schoolId}/admissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        "Failed to submit admission application",
    );
  }

  return result.data;
}

// ==================================================
// Initiate Online Admission Payment
// ==================================================

export interface InitiateAdmissionPaymentResponse {
  transactionId: string;
  amount: number;
  paymentUrl: string;
}

export async function initiateAdmissionPayment(
  schoolId: number,
  admissionId: number,
): Promise<InitiateAdmissionPaymentResponse> {
  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions/${admissionId}/payment/online/initiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        "Failed to initiate online payment",
    );
  }

  return result.data;
}

export async function trackAdmission(
  input: TrackAdmissionInput,
): Promise<TrackAdmissionResponse> {
  const response = await fetch(
    `${API_URL}/admissions/track`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        "Failed to track admission application",
    );
  }

  return result.data;
}