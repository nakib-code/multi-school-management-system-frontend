export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AttendanceRecord {
  id: number;
  schoolId: number;
  studentId: number;
  enrollmentId: number;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  enrollment?: {
    id: number;
    rollNumber: number | null;
    class?: { id: number; name: string };
    section?: { id: number; name: string } | null;
  };
  markedByUser?: { id: number; name: string; role?: string };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedAttendanceResponse {
  records: AttendanceRecord[];
  meta: PaginationMeta;
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

export interface BulkAttendanceResult {
  records: AttendanceRecord[];
  changedCount: number;
  notifiedCount: number;
}

export interface UpdateAttendanceInput {
  status?: AttendanceStatus;
  remarks?: string | null;
}

export interface UpdateAttendanceResult {
  record: AttendanceRecord;
  changed: boolean;
  notifiedCount: number;
}

export interface DayAttendanceRow {
  enrollmentId: number;
  studentId: number;
  rollNumber: number | null;
  student: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string | null;
    nameBangla: string | null;
  };
  class: { id: number; name: string };
  section: { id: number; name: string } | null;
  existing: {
    id: number;
    status: AttendanceStatus;
    remarks: string | null;
    markedBy: { id: number; name: string };
    updatedAt: string;
  } | null;
  approvedLeave: {
    id: number;
    reason: string;
    fromDate: string;
    toDate: string;
  } | null;
  suggestedStatus: AttendanceStatus | null;
  suggestedRemarks: string | null;
}

export interface DayAttendanceResponse {
  date: string;
  isWorkingDay: boolean;
  isWeeklyOff: boolean;
  isHoliday: boolean;
  holidayTitle: string | null;
  weeklyOffDays: number[];
  canEditDate: boolean;
  alreadyMarked: boolean;
  rows: DayAttendanceRow[];
}

export interface AttendanceHistoryItem {
  id: number;
  attendanceId: number;
  oldStatus: AttendanceStatus | null;
  newStatus: AttendanceStatus;
  oldRemarks: string | null;
  newRemarks: string | null;
  changedAt: string;
  changedByUser: { id: number; name: string; role: string };
}

export interface LinkedStudent {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string | null;
  nameBangla: string | null;
  activeEnrollment: {
    id: number;
    rollNumber: number | null;
    class: { id: number; name: string };
    section: { id: number; name: string } | null;
  } | null;
}

export interface CalendarDayCell {
  date: string;
  status: AttendanceStatus | null;
  remarks: string | null;
  attendanceId: number | null;
  isWeeklyOff: boolean;
  isHoliday: boolean;
  holidayTitle: string | null;
  isFuture: boolean;
}

export interface StudentCalendarResponse {
  studentId: number;
  month: string;
  today: string;
  weeklyOffDays: number[];
  holidays: Array<{ date: string; title: string }>;
  days: CalendarDayCell[];
  summary: {
    workingDays: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  };
  previousMonth: {
    month: string;
    workingDays: number;
    rate: number;
  };
}

export interface MonthlyReportStudentRow {
  studentId: number;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  nameBangla: string | null;
  rollNumber: number | null;
  present: number;
  absent: number;
  late: number;
  excused: number;
  workingDays: number;
  percent: number;
}

export interface MonthlyReportResponse {
  month: string;
  class: { id: number; name: string };
  section: { id: number; name: string } | null;
  workingDays: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  publishedBy: { id: number; name: string } | null;
  totals: {
    students: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    averagePercent: number;
  };
  rows: MonthlyReportStudentRow[];
}

export interface PublishedGuardianReport {
  reportId: number;
  month: string;
  publishedAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  class: { id: number; name: string };
  section: { id: number; name: string } | null;
  workingDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percent: number;
}

export interface AttendanceSettings {
  schoolId: number;
  weeklyOffDays: number[];
}

export interface SchoolHoliday {
  id: number;
  schoolId: number;
  date: string;
  title: string;
}

export interface LeaveRequestItem {
  id: number;
  schoolId: number;
  studentId: number;
  requestedBy: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveRequestStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  student: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string | null;
    enrollments: Array<{
      classId: number;
      sectionId: number | null;
      class: { id: number; name: string };
      section: { id: number; name: string } | null;
    }>;
  };
  requestedByUser: { id: number; name: string; role: string };
  reviewedByUser: { id: number; name: string; role: string } | null;
}
