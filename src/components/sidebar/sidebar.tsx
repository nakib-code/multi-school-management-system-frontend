"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { SidebarItem } from "./sidebar-item";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  featureKey?:
    | "hasGeneralSection"
    | "hasHefzSection"
    | "hasOnlineAdmission"
    | "hasTeacherPayroll"
    | "smsEnabled";
}

const navigationByRole: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/super-admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Institutions",
      href: "/dashboard/super-admin/schools",
      icon: Building2,
    },
    { label: "Users", href: "/dashboard/super-admin/users", icon: Users },
    {
      label: "Packages",
      href: "/dashboard/super-admin/packages",
      icon: Package,
    },
    {
      label: "Subscriptions",
      href: "/dashboard/super-admin/subscriptions",
      icon: CreditCard,
    },
    {
      label: "Payments",
      href: "/dashboard/super-admin/payments",
      icon: Wallet,
    },
    {
      label: "Reports",
      href: "/dashboard/super-admin/reports",
      icon: BarChart3,
    },
    {
      label: "Platform Audit Logs",
      href: "/dashboard/super-admin/audit-logs",
      icon: ScrollText,
    },
    {
      label: "Settings",
      href: "/dashboard/super-admin/settings",
      icon: Settings,
    },
  ],
  ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Admissions",
      href: "/dashboard/admin/admissions",
      icon: UserPlus,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: GraduationCap,
    },
    {
      label: "Enrollments",
      href: "/dashboard/admin/enrollments",
      icon: FileCheck,
    },
    { label: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
    { label: "Managers", href: "/dashboard/admin/managers", icon: ShieldCheck },
    {
      label: "Guardians",
      href: "/dashboard/admin/guardians",
      icon: HeartHandshake,
    },
    {
      label: "Classes & Sections",
      href: "/dashboard/admin/classes",
      icon: BookOpen,
    },
    {
      label: "Class Routine",
      href: "/dashboard/admin/routine",
      icon: CalendarCheck,
    },
    {
      label: "Subjects",
      href: "/dashboard/admin/subjects",
      icon: ClipboardList,
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Daily Diary",
      href: "/dashboard/admin/diary",
      icon: BookOpen,
    },
    { label: "Exams", href: "/dashboard/admin/exams", icon: FileText },
    { label: "Results", href: "/dashboard/admin/results", icon: Award },
    {
      label: "Fees & Payments",
      href: "/dashboard/admin/fees",
      icon: CreditCard,
    },
    {
      label: "Teacher Salaries",
      href: "/dashboard/admin/salaries",
      icon: Wallet,
    },
    {
      label: "কাস্টম বিল / খরচ",
      href: "/dashboard/admin/custom-expenses",
      icon: Receipt,
    },
    {
      label: "Hefz & Najera",
      href: "/dashboard/admin/hefz",
      icon: BookOpenCheck,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit-logs",
      icon: ScrollText,
    },
    {
      label: "Subscription",
      href: "/dashboard/admin/subscription/payment",
      icon: Package,
    },
    {
      label: "Reports",
      href: "/dashboard/admin/reports",
      icon: BarChart3,
    },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  MANAGER: [
    {
      label: "Dashboard",
      href: "/dashboard/manager",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Admissions",
      href: "/dashboard/manager/admissions",
      icon: UserPlus,
    },
    {
      label: "Students",
      href: "/dashboard/manager/students",
      icon: GraduationCap,
    },
    {
      label: "Enrollments",
      href: "/dashboard/manager/enrollments",
      icon: FileCheck,
    },
    { label: "Teachers", href: "/dashboard/manager/teachers", icon: Users },
    {
      label: "Guardians",
      href: "/dashboard/manager/guardians",
      icon: HeartHandshake,
    },
    {
      label: "Classes & Sections",
      href: "/dashboard/manager/classes",
      icon: BookOpen,
    },
    {
      label: "Class Routine",
      href: "/dashboard/manager/routine",
      icon: CalendarCheck,
    },
    {
      label: "Subjects",
      href: "/dashboard/manager/subjects",
      icon: ClipboardList,
    },
    {
      label: "Attendance",
      href: "/dashboard/manager/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Daily Diary",
      href: "/dashboard/manager/diary",
      icon: BookOpen,
    },
    { label: "Exams", href: "/dashboard/manager/exams", icon: FileText },
    { label: "Results", href: "/dashboard/manager/results", icon: Award },
    {
      label: "Fees & Payments",
      href: "/dashboard/manager/fees",
      icon: CreditCard,
    },
    {
      label: "Teacher Salaries",
      href: "/dashboard/manager/salaries",
      icon: Wallet,
    },
    {
      label: "কাস্টম বিল / খরচ",
      href: "/dashboard/manager/custom-expenses",
      icon: Receipt,
    },
    {
      label: "Hefz & Najera",
      href: "/dashboard/manager/hefz",
      icon: BookOpenCheck,
    },
    {
      label: "Reports",
      href: "/dashboard/manager/reports",
      icon: BarChart3,
    },
    { label: "Settings", href: "/dashboard/manager/settings", icon: Settings },
  ],
  TEACHER: [
    {
      label: "Dashboard",
      href: "/dashboard/teacher",
      icon: LayoutDashboard,
      exact: true,
    },
    { label: "My Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
    {
      label: "My Timetable",
      href: "/dashboard/teacher/routine",
      icon: CalendarCheck,
    },
    {
      label: "Students",
      href: "/dashboard/teacher/students",
      icon: GraduationCap,
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Daily Diary",
      href: "/dashboard/teacher/diary",
      icon: BookOpen,
    },
    { label: "Exams", href: "/dashboard/teacher/exams", icon: FileText },
    { label: "Results", href: "/dashboard/teacher/results", icon: Award },
    { label: "My Salaries", href: "/dashboard/teacher/salaries", icon: Wallet },
    {
      label: "Hefz & Najera",
      href: "/dashboard/teacher/hefz",
      icon: BookOpenCheck,
    },
  ],
  STUDENT: [
    {
      label: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Profile",
      href: "/dashboard/student/profile",
      icon: UserCheck,
    },
    {
      label: "Class Routine",
      href: "/dashboard/student/routine",
      icon: CalendarCheck,
    },
    {
      label: "Attendance",
      href: "/dashboard/student/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Daily Diary",
      href: "/dashboard/student/diary",
      icon: BookOpen,
    },
    { label: "Exams", href: "/dashboard/student/exams", icon: FileText },
    { label: "Results", href: "/dashboard/student/results", icon: Award },
    {
      label: "Fees & Payments",
      href: "/dashboard/student/fees",
      icon: CreditCard,
    },
    {
      label: "Hefz Progress",
      href: "/dashboard/student/hefz",
      icon: BookOpenCheck,
    },
  ],
  GUARDIAN: [
    {
      label: "Dashboard",
      href: "/dashboard/guardian",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Class Routine",
      href: "/dashboard/guardian/routine",
      icon: CalendarCheck,
    },
    {
      label: "Attendance",
      href: "/dashboard/guardian/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Daily Diary",
      href: "/dashboard/guardian/diary",
      icon: BookOpen,
    },
    { label: "Exams", href: "/dashboard/guardian/exams", icon: FileText },
    { label: "Results", href: "/dashboard/guardian/results", icon: Award },
    {
      label: "Fees & Payments",
      href: "/dashboard/guardian/fees",
      icon: CreditCard,
    },
    {
      label: "Hefz Progress",
      href: "/dashboard/guardian/hefz",
      icon: BookOpenCheck,
    },
  ],
};

const dashboardPathByRole: Record<string, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  ADMIN: "/dashboard/admin",
  MANAGER: "/dashboard/manager",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  GUARDIAN: "/dashboard/guardian",
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const rawNavigation = user ? (navigationByRole[user.role] ?? []) : [];
  const navigation = rawNavigation.filter((item) => {
    const settings = user?.schoolSetting;
    if (!settings) return true;
    if (item.href.endsWith("/hefz") && !settings.hasHefzSection) return false;
    if (item.href.endsWith("/admissions") && !settings.hasOnlineAdmission)
      return false;
    if (item.href.endsWith("/salaries") && !settings.hasTeacherPayroll)
      return false;
    return true;
  });
  const dashboardPath = user
    ? (dashboardPathByRole[user.role] ?? "/dashboard")
    : "/dashboard";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.replace("/auth/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href={dashboardPath}
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">MadrasaOS</p>
              <p className="text-[11px] text-muted-foreground">
                Management System
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b px-4 py-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.role.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              return (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive}
                  onClick={onClose}
                />
              );
            })}
          </div>
        </nav>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
