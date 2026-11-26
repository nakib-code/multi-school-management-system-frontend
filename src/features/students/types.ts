import type {
  AcademicGroup,
  HefzWing,
  ResidentialType,
} from "@/features/admissions/types";

export interface StudentEnrollmentSummary {
  id: number;
  academicYear: string;
  rollNumber: number | null;
  shift?: string | null;
  academicGroup?: AcademicGroup | null;
  boardName?: string | null;
  boardRollNo?: string | null;
  boardRegNo?: string | null;
  fourthSubject?: string | null;
  status: string;
  enrolledAt?: string;
  class: { id: number; name: string; code: string };
  section: { id: number; name: string; code: string } | null;
}

export interface StudentGuardianSummary {
  isPrimary: boolean;
  guardian: {
    id: number;
    relation: string | null;
    occupation?: string | null;
    address?: string | null;
    nid?: string | null;
    user: {
      id?: number;
      name: string;
      phone: string | null;
      email: string;
    };
  };
}

export interface StudentHefzEnrollmentSummary {
  id: number;
  wing: HefzWing;
  currentPara: number | null;
  currentSurah: string | null;
  startDate: string;
  status: string;
  ustad: {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string | null;
  };
}

export interface StudentRecord {
  id: number;
  userId: number | null;
  schoolId: number;
  studentId: string;
  firstName: string;
  lastName: string | null;
  nameBangla?: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  admissionDate: string;
  residentialType?: ResidentialType;
  shift?: string | null;
  quranWing?: HefzWing | null;

  // Identity & Localization
  birthRegNo?: string | null;
  bloodGroup?: string | null;
  religion?: string | null;
  nationality?: string | null;
  studentPhotoUrl?: string | null;

  // Parents & Emergency
  fatherName?: string | null;
  fatherPhone?: string | null;
  fatherOccupation?: string | null;
  fatherNid?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
  motherOccupation?: string | null;
  motherNid?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  // Addresses
  presentAddress?: string | null;
  permanentAddress?: string | null;

  // Kindergarten / Junior Safety
  authorizedPickupName?: string | null;
  authorizedPickupRelation?: string | null;
  authorizedPickupPhone?: string | null;
  authorizedPickupNid?: string | null;
  pickupPersonPhotoUrl?: string | null;

  // Class 9-10 / Board Exam
  academicGroup?: AcademicGroup | null;
  boardName?: string | null;
  boardRollNo?: string | null;
  boardRegNo?: string | null;
  fourthSubject?: string | null;

  // Previous Institution
  previousSchool?: string | null;
  previousClass?: string | null;
  tcNumber?: string | null;
  tcDate?: string | null;

  // Health & Care
  allergies?: string | null;
  medicalConditions?: string | null;
  medications?: string | null;
  healthNotes?: string | null;

  // Documents
  birthCertificateUrl?: string | null;
  guardianNidUrl?: string | null;
  previousTcUrl?: string | null;
  marksheetUrl?: string | null;

  isActive: boolean;

  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: string;
    role: string;
  } | null;

  enrollments?: StudentEnrollmentSummary[];
  guardians?: StudentGuardianSummary[];
  hefzEnrollments?: StudentHefzEnrollmentSummary[];
}

export interface StudentListResponse {
  students: StudentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateStudentInput {
  // Stage 1 — Required
  studentName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  residentialType: ResidentialType;
  academicYear: string;
  classId: number;
  guardianName: string;
  guardianPhone: string;

  // Stage 1 — Optional
  sectionId?: number;
  rollNumber?: number;
  shift?: "MORNING" | "DAY" | "EVENING";
  guardianRelation?: string;
  guardianEmail?: string;
  guardianNid?: string;
  academicGroup?: AcademicGroup;
  quranWing?: HefzWing;
  ustadId?: number;
  studentPhotoUrl?: string;
}

export interface CreateStudentResponse {
  student: StudentRecord;
  enrollment: StudentEnrollmentSummary;
  guardian: {
    guardianId: number;
    name: string;
    phone: string;
    email: string;
    isExistingGuardian: boolean;
    defaultPassword?: string;
    temporaryPassword?: string;
  } | null;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string | null;
  nameBangla?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  residentialType?: ResidentialType;
  shift?: string | null;
  quranWing?: HefzWing | null;
  birthRegNo?: string | null;
  bloodGroup?: string | null;
  religion?: string | null;
  nationality?: string | null;
  studentPhotoUrl?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  fatherOccupation?: string | null;
  fatherNid?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
  motherOccupation?: string | null;
  motherNid?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  authorizedPickupName?: string | null;
  authorizedPickupRelation?: string | null;
  authorizedPickupPhone?: string | null;
  authorizedPickupNid?: string | null;
  pickupPersonPhotoUrl?: string | null;
  academicGroup?: AcademicGroup | null;
  boardName?: string | null;
  boardRollNo?: string | null;
  boardRegNo?: string | null;
  fourthSubject?: string | null;
  previousSchool?: string | null;
  previousClass?: string | null;
  tcNumber?: string | null;
  tcDate?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  medications?: string | null;
  healthNotes?: string | null;
  birthCertificateUrl?: string | null;
  guardianNidUrl?: string | null;
  previousTcUrl?: string | null;
  marksheetUrl?: string | null;
}
