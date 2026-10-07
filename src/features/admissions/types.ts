export type AdmissionPaymentMethod = "CASH" | "ONLINE";

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
  sectionId: number;
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
      code: string;
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