import {
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import type { SchoolUserRole } from "./types";

export const USER_CATEGORIES = [
  {
    key: "admin",
    role: "ADMIN",
    label: "Admin",
    icon: ShieldCheck,
    description: "School administrators",
  },
  {
    key: "manager",
    role: "MANAGER",
    label: "Manager",
    icon: UserRound,
    description: "School managers",
  },
  {
    key: "teacher",
    role: "TEACHER",
    label: "Teacher",
    icon: GraduationCap,
    description: "Teaching staff",
  },
  {
    key: "student",
    role: "STUDENT",
    label: "Student",
    icon: Users,
    description: "Enrolled students",
  },
  {
    key: "guardian",
    role: "GUARDIAN",
    label: "Guardian",
    icon: HeartHandshake,
    description: "Student guardians",
  },
] as const satisfies readonly {
  key: string;
  role: SchoolUserRole;
  label: string;
  icon: typeof ShieldCheck;
  description: string;
}[];

export type UserCategoryKey =
  (typeof USER_CATEGORIES)[number]["key"];