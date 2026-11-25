"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { NotificationMenu } from "./notification-menu";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

const segmentTitles: Record<string, string> = {
  "super-admin": "Super Admin Dashboard",
  admin: "Institution Admin Dashboard",
  manager: "Manager Dashboard",
  teacher: "Teacher Dashboard",
  student: "Student Portal",
  guardian: "Guardian Portal",
  schools: "Institutions",
  users: "Users",
  packages: "Packages",
  subscriptions: "Subscriptions",
  subscription: "Subscription & Billing",
  payments: "Payments",
  reports: "Reports & Analytics",
  admissions: "Admissions",
  students: "Students",
  enrollments: "Enrollments",
  teachers: "Teachers & Assignments",
  managers: "Managers",
  guardians: "Guardians",
  classes: "Classes & Sections",
  routine: "Class Routine & Timetable",
  notifications: "Notifications",
  subjects: "Subjects",
  attendance: "Attendance",
  exams: "Examinations",
  results: "Results & Grades",
  fees: "Fees & Payments",
  salaries: "Teacher Salaries",
  hefz: "Hefz & Najera",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  profile: "My Profile",
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";
  const secondLast = segments[segments.length - 2] ?? "";
  const key = /^\d+$/.test(lastSegment) ? secondLast : lastSegment;
  const title = segmentTitles[key] ?? "Madrasa Management System";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {user
            ? `${user.role.replaceAll("_", " ")} Workspace`
            : "Madrasa Management System"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <NotificationMenu />
        <UserMenu />
      </div>
    </header>
  );
}
