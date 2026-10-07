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