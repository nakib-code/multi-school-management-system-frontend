import type {
  AdminAdmissionDetails,
  CreateAdmissionInput,
  CreateAdmissionResponse,
  ConfirmCashPaymentInput,
  GetAdmissionsParams,
  GetAdmissionsResponse,
  RejectAdmissionInput,
  TrackAdmissionInput,
  TrackAdmissionResponse,
  ApproveAdmissionResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api/v1";

// ==================================================
// Create Admission (Public)
// ==================================================

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

// ==================================================
// Track Admission (Public)
// ==================================================

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

// ==================================================
// Get Admissions (Admin / Manager)
// ==================================================

export async function getAdmissions(
  schoolId: number,
  params: GetAdmissionsParams = {},
): Promise<GetAdmissionsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.paymentStatus) {
    query.set("paymentStatus", params.paymentStatus);
  }

  const queryString = query.toString();

  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ?? "Failed to fetch admissions",
    );
  }

  return result.data;
}

// ==================================================
// Get Admission Details (Admin / Manager)
// ==================================================

export async function getAdmissionById(
  schoolId: number,
  admissionId: number,
): Promise<AdminAdmissionDetails> {
  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions/${admissionId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        "Failed to fetch admission details",
    );
  }

  return result.data;
}

// ==================================================
// Approve Admission (Admin / Manager)
// ==================================================

export async function approveAdmission(
  schoolId: number,
  admissionId: number,
): Promise<ApproveAdmissionResponse> {
  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions/${admissionId}/approve`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        "Failed to approve admission",
    );
  }

  return result.data;
}

// ==================================================
// Reject Admission (Admin / Manager)
// ==================================================

export async function rejectAdmission(
  schoolId: number,
  admissionId: number,
  input: RejectAdmissionInput,
): Promise<AdminAdmissionDetails> {
  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions/${admissionId}/reject`,
    {
      method: "PATCH",
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
        "Failed to reject admission",
    );
  }

  return result.data;
}

// ==================================================
// Confirm Cash Payment (Admin / Manager)
// ==================================================

export async function confirmCashPayment(
  schoolId: number,
  admissionId: number,
  input: ConfirmCashPaymentInput = {},
): Promise<AdminAdmissionDetails> {
  const response = await fetch(
    `${API_URL}/schools/${schoolId}/admissions/${admissionId}/payment/confirm-cash`,
    {
      method: "PATCH",
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
        "Failed to confirm cash payment",
    );
  }

  return result.data;
}


// Verify Student Email OTP
export interface VerifyStudentEmailResponse {
  admissionId: number;
  applicationNo: string;
  email: string;
  emailVerified: boolean;
}

export async function verifyStudentEmail(
  email: string,
  code: string,
): Promise<VerifyStudentEmailResponse> {
  const response = await fetch(`${API_URL}/admissions/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ?? "Failed to verify email",
    );
  }

  return result.data;
}
