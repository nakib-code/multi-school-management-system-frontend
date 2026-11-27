import type { FeeType } from "@/features/fees/types";

export interface ClassFeeStructureItem {
  id: number;
  classId?: number;
  feeType: FeeType;
  title: string | null;
  amount: number;
  academicYear: string | null;
  isActive?: boolean;
}

export interface ClassWithFeeStructure {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  resolvedAdmissionFee: number;
  feeStructures: ClassFeeStructureItem[];
}

export interface ClassFeeStructuresResponse {
  schoolDefaultAdmissionFee: number;
  classes: ClassWithFeeStructure[];
}

export interface UpsertClassFeeStructuresPayload {
  academicYear?: string | null;
  items: Array<{
    feeType: FeeType;
    amount: number | null;
    title?: string | null;
    isActive?: boolean;
  }>;
}

export interface SchoolClass {
  id: number;
  schoolId: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sections: number;
    teacherAssignments: number;
    enrollments: number;
    exams: number;
    admissions: number;
  };
}

export interface SchoolSection {
  id: number;
  schoolId: number;
  classId: number;
  name: string;
  code: string;
  capacity: number | null;
  roomNumber: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  class?: {
    id: number;
    name: string;
    code: string;
  };
  _count?: {
    teacherAssignments: number;
    enrollments: number;
    exams: number;
    admissions: number;
  };
}

export interface CreateClassPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateClassPayload {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateSectionPayload {
  classId: number;
  name: string;
  code: string;
  capacity?: number;
  roomNumber?: string;
}

export interface UpdateSectionPayload {
  name?: string;
  code?: string;
  capacity?: number | null;
  roomNumber?: string | null;
  isActive?: boolean;
}
