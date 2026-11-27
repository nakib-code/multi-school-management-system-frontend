export type SalaryStatus = "PENDING" | "PARTIAL" | "PAID";
export type SalaryPaymentMethod = "CASH" | "BANK" | "MOBILE_BANKING" | "ONLINE";

export interface TeacherSalaryRecord {
  id: number;
  schoolId: number;
  teacherId: number;
  month: number;
  year: number;
  basicSalary: number | string;
  bonus: number | string;
  deduction: number | string;
  netSalary: number | string;
  status: SalaryStatus;
  remarks: string | null;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string | null;
    employeeId: string;
  };
}

export interface CreateTeacherSalaryInput {
  teacherId: number;
  month: number;
  year: number;
  basicSalary: number;
  bonus?: number;
  deduction?: number;
  remarks?: string;
}

export interface CreateSalaryPaymentInput {
  teacherId: number;
  salaryId: number;
  amount: number;
  paymentMethod: SalaryPaymentMethod;
  remarks?: string;
}
