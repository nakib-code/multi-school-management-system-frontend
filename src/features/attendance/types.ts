export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: number;
  schoolId: number;
  studentId: number;
  enrollmentId: number;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  student?: { id: number; firstName: string; lastName: string | null; studentId: string };
  enrollment?: {
    id: number;
    rollNumber: number | null;
    class?: { id: number; name: string };
    section?: { id: number; name: string } | null;
  };
  markedByUser?: { id: number; name: string };
}

export interface BulkAttendanceInput {
  date: string;
  records: Array<{
    studentId: number;
    enrollmentId: number;
    status: AttendanceStatus;
    remarks?: string;
  }>;
}
