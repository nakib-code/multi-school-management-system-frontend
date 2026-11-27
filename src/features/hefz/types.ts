export type HefzWing = "NOORANI" | "QAIDA" | "AMPARA" | "NAJERA" | "HEFZ";
export type SobokQuality = "GOOD" | "AVERAGE" | "WEAK" | "REVISE";
export type HefzAttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface HefzEnrollmentRecord {
  id: number;
  schoolId: number;
  studentId: number;
  ustadId: number;
  wing: HefzWing;
  currentPara: number | null;
  currentSurah: string | null;
  status: string;
  startDate: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  ustad?: {
    id: number;
    firstName: string;
    lastName: string | null;
    employeeId: string;
  };
}

export interface HefzDailyLogRecord {
  id: number;
  hefzEnrollmentId: number;
  logDate: string;
  sobok: string;
  sobokPagesOrLines: string | null;
  sobokQuality: SobokQuality;
  sobokAm: string | null;
  manzil: string | null;
  manzilParas: string | null;
  attendanceStatus: HefzAttendanceStatus;
  ustadNote: string | null;
  hefzEnrollment?: HefzEnrollmentRecord;
}

export interface CreateHefzEnrollmentInput {
  studentId: number;
  ustadId: number;
  wing: HefzWing;
  currentPara?: number;
  currentSurah?: string;
}

export interface UpsertHefzDailyLogInput {
  hefzEnrollmentId: number;
  logDate: string;
  sobok: string;
  sobokPagesOrLines?: string;
  sobokQuality: SobokQuality;
  sobokAm?: string;
  manzil?: string;
  manzilParas?: string;
  attendanceStatus: HefzAttendanceStatus;
  ustadNote?: string;
}
