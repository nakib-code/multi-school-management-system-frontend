export type AdmissionPaymentMethod = "CASH" | "ONLINE";

export type AdmissionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type AdmissionPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface CreateAdmissionInput {
  schoolId: number;

  // Student
  studentName: string;
  studentEmail: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  previousSchool?: string;
  previousClass?: string;

  // Guardian
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  guardianNid?: string;
  guardianOccupation?: string;

  // Address
  address?: string;

  // Academic
  classId: number;
  academicYear: string;
  shift?: string;
  group?: string;

  // Documents
  studentPhotoUrl?: string;
  birthCertificateUrl?: string;
  previousCertificateUrl?: string;

  // Payment
  paymentMethod: AdmissionPaymentMethod;
}

export interface CreateAdmissionResponse {
  id: number;
  applicationNo: string;
  studentEmail: string;
  paymentMethod: AdmissionPaymentMethod;
  paymentStatus: "PENDING";
  emailVerificationRequired: boolean;
}

export interface TrackAdmissionInput {
  applicationNo: string;
  studentEmail: string;
}

export interface TrackAdmissionResponse {
  admissionId: number;
  applicationNo: string;

  student: {
    name: string;
    email: string;
    emailVerified: boolean;
  };

  school: {
    id: number;
    name: string;
    code: string;
  };

  academic: {
  year: string;
  class: {
    id: number;
    name: string;
    code: string;
  } | null;
  section: {
    id: number;
    name: string;
  } | null;
  shift: string | null;
  group: string | null;
};

  status: string;
  rejectionReason: string | null;
  reviewedAt: string | null;

  payment: {
    id: number;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionId: string | null;
    paidAt: string | null;
    remarks: string | null;
  } | null;

  createdAt: string;
  updatedAt: string;
}

// ==================================================
// Admin Admission List
// ==================================================

export interface GetAdmissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdmissionStatus;
  paymentStatus?: AdmissionPaymentStatus;
}

export interface AdminAdmission {
  id: number;
  applicationNo: string;
  studentName: string;
  studentEmail: string;
  guardianName: string | null;
  guardianPhone: string | null;
  academicYear: string;
  shift: string | null;
  group: string | null;
  status: AdmissionStatus;
  studentEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;

  class: {
    id: number;
    name: string;
    code: string;
  };

  payment: {
    id: number;
    amount: number;
    paymentMethod: AdmissionPaymentMethod;
    status: AdmissionPaymentStatus;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
}

export interface AdmissionsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAdmissionsResponse {
  admissions: AdminAdmission[];
  meta: AdmissionsMeta;
}

// ==================================================
// Admin Admission Details
// ==================================================

export interface AdminAdmissionDetails {
  id: number;
  applicationNo: string;
  schoolId: number;
  classId: number;
  sectionId: number | null;

  studentName: string;
  studentEmail: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  previousSchool: string | null;
  previousClass: string | null;

  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
  guardianRelationship: string | null;
  guardianNid: string | null;
  guardianOccupation: string | null;

  address: string | null;

  academicYear: string;
  shift: string | null;
  group: string | null;

  studentPhotoUrl: string | null;
  birthCertificateUrl: string | null;
  previousCertificateUrl: string | null;

  status: AdmissionStatus;
  studentEmailVerified: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;

  createdAt: string;
  updatedAt: string;

  class: {
    id: number;
    name: string;
    code: string;
  };

  section: {
    id: number;
    name: string;
  } | null;

  payment: {
    id: number;
    amount: number;
    paymentMethod: AdmissionPaymentMethod;
    status: AdmissionPaymentStatus;
    transactionId: string | null;
    paidAt: string | null;
    remarks: string | null;
  } | null;
}

// ==================================================
// Admin Actions
// ==================================================

export interface RejectAdmissionInput {
  rejectionReason: string;
}

export interface ConfirmCashPaymentInput {
  remarks?: string;
}

export interface ApproveAdmissionResponse {
  admissionId: number;
  applicationNo: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  enrollmentId: number;
  classId: number;
  sectionId: number | null;
  academicYear: string;
  status: AdmissionStatus;
  reviewedAt: string;
}


