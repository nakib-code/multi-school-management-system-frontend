export type AdmissionPaymentMethod =
  | "CASH"
  | "ONLINE"
  | "BKASH"
  | "NAGAD"
  | "ROCKET";

export type AdmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdmissionPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export type ResidentialType = "NON_RESIDENTIAL" | "RESIDENTIAL" | "DAY_CARE";
export type AcademicGroup = "SCIENCE" | "ARTS" | "COMMERCE";
export type HefzWing = "NOORANI" | "QAIDA" | "AMPARA" | "NAJERA" | "HEFZ";

export interface CreateAdmissionInput {
  schoolId: number;

  // Stage 1 — Required
  studentName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  residentialType: ResidentialType;
  classId: number;
  academicYear: string;
  guardianName: string;
  guardianPhone: string;

  // Stage 1 — Optional
  sectionId?: number;
  shift?: "MORNING" | "DAY" | "EVENING";
  guardianRelationship?: string;
  guardianEmail?: string;
  guardianNid?: string;
  guardianOccupation?: string;
  academicGroup?: AcademicGroup;
  group?: string;
  quranWing?: HefzWing;

  // Optional Student Login (NOT required)
  studentEmail?: string;
  password?: string;

  // Stage 2 — Optional
  nameBangla?: string;
  birthRegNo?: string;
  bloodGroup?: string;
  previousSchool?: string;
  previousClass?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  presentAddress?: string;
  permanentAddress?: string;

  // Documents
  studentPhotoUrl?: string;
  birthCertificateUrl?: string;
  previousCertificateUrl?: string;
  guardianNidUrl?: string;
  previousTcUrl?: string;
  marksheetUrl?: string;

  // Optional Payment
  paymentMethod?: AdmissionPaymentMethod;
}

export interface CreateAdmissionResponse {
  id: number;
  schoolId: number;
  applicationNo: string;
  studentName: string;
  studentEmail: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  paymentMethod: AdmissionPaymentMethod | null;
  paymentStatus: AdmissionPaymentStatus | null;
  emailVerificationRequired: boolean;
  payment: {
    id: number;
    amount: number;
    paymentMethod: AdmissionPaymentMethod;
    status: AdmissionPaymentStatus;
  } | null;
}

export interface TrackAdmissionInput {
  applicationNo: string;
  guardianPhone?: string;
  studentEmail?: string;
}

export interface TrackAdmissionResponse {
  admissionId: number;
  applicationNo: string;

  student: {
    name: string;
    email: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    residentialType?: ResidentialType;
    emailVerified: boolean;
  };

  school: {
    id: number;
    name: string;
    code: string;
  };

  academic: {
    year: string;
    class: { id: number; name: string; code: string } | null;
    section: { id: number; name: string; code?: string } | null;
    shift: string | null;
    group: string | null;
    quranWing?: HefzWing | null;
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

export interface GetAdmissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: number;
  academicYear?: string;
  status?: AdmissionStatus;
  paymentStatus?: AdmissionPaymentStatus;
}

export interface AdminAdmission {
  id: number;
  applicationNo: string;
  studentName: string;
  nameBangla?: string | null;
  studentEmail: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  residentialType?: ResidentialType;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelationship?: string | null;
  academicYear: string;
  shift: string | null;
  group: string | null;
  academicGroup?: AcademicGroup | null;
  quranWing?: HefzWing | null;
  studentPhotoUrl?: string | null;
  status: AdmissionStatus;
  studentEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;

  class: { id: number; name: string; code: string };
  section?: { id: number; name: string; code: string } | null;

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

export interface AdminAdmissionDetails {
  id: number;
  applicationNo: string;
  schoolId: number;
  classId: number;
  sectionId: number | null;

  studentName: string;
  nameBangla: string | null;
  studentEmail: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  birthRegNo: string | null;
  residentialType: ResidentialType;
  previousSchool: string | null;
  previousClass: string | null;

  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
  guardianRelationship: string | null;
  guardianNid: string | null;
  guardianOccupation: string | null;
  fatherName: string | null;
  motherName: string | null;

  address: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;

  academicYear: string;
  shift: string | null;
  group: string | null;
  academicGroup: AcademicGroup | null;
  quranWing: HefzWing | null;

  studentPhotoUrl: string | null;
  birthCertificateUrl: string | null;
  previousCertificateUrl: string | null;
  guardianNidUrl: string | null;
  previousTcUrl: string | null;
  marksheetUrl: string | null;

  status: AdmissionStatus;
  studentEmailVerified: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;

  createdAt: string;
  updatedAt: string;

  class: { id: number; name: string; code: string };
  section: { id: number; name: string; code?: string } | null;

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

export interface RejectAdmissionInput {
  rejectionReason: string;
}

export interface ConfirmCashPaymentInput {
  remarks?: string;
}

export interface SubmitOnlinePaymentTrxInput {
  applicationNo: string;
  guardianPhone?: string;
  studentEmail?: string;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET";
  transactionId: string;
  senderPhone?: string;
}

export interface VerifyOnlinePaymentInput {
  remarks?: string;
}

export interface RejectOnlinePaymentInput {
  remarks: string;
}

export interface ApproveAdmissionResponse {
  admissionId: number;
  applicationNo: string;
  studentId: string;
  studentRecordId: number;
  studentName: string;
  studentEmail: string | null;
  enrollmentId: number;
  classId: number;
  sectionId: number | null;
  academicYear: string;
  guardian?: {
    guardianId: number;
    name: string;
    phone: string;
    email: string;
    isExistingGuardian: boolean;
    temporaryPassword?: string;
  } | null;
  status: AdmissionStatus;
  reviewedAt: string;
}
