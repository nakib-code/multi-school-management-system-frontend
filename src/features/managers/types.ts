export interface ManagerRecord {
  id: number;
  userId: number;
  schoolId: number;
  employeeId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  designation: string | null;
  isActive: boolean;
  user?: { id: number; name: string; email: string; status: string };
}

export interface CreateManagerInput {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  designation?: string;
}
