"use client";

import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  UserRoundCog,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { SidebarItem } from "@/components/sidebar/sidebar-item";
import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigationByRole: Record<string, NavigationItem[]> = {
  SUPER_ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/super-admin",
      icon: LayoutDashboard,
    },
    {
      label: "Schools",
      href: "/dashboard/super-admin/schools",
      icon: Building2,
    },
    {
      label: "Users",
      href: "/dashboard/super-admin/users",
      icon: Users,
    },
    {
      label: "Reports",
      href: "/dashboard/super-admin/reports",
      icon: FileBarChart,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/super-admin/audit-logs",
      icon: ShieldCheck,
    },
  ],

  ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: GraduationCap,
    },
    {
      label: "Teachers",
      href: "/dashboard/admin/teachers",
      icon: Users,
    },
    {
      label: "Managers",
      href: "/dashboard/admin/managers",
      icon: UserRoundCog,
    },
    {
      label: "Classes",
      href: "/dashboard/admin/classes",
      icon: BookOpen,
    },
    {
      label: "Sections",
      href: "/dashboard/admin/sections",
      icon: ClipboardList,
    },
    {
      label: "Subjects",
      href: "/dashboard/admin/subjects",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Exams",
      href: "/dashboard/admin/exams",
      icon: ClipboardList,
    },
    {
      label: "Results",
      href: "/dashboard/admin/results",
      icon: BarChart3,
    },
    {
      label: "Fees & Payments",
      href: "/dashboard/admin/fees",
      icon: CreditCard,
    },
    {
      label: "Reports",
      href: "/dashboard/admin/reports",
      icon: FileBarChart,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],

  MANAGER: [
    {
      label: "Dashboard",
      href: "/dashboard/manager",
      icon: LayoutDashboard,
    },
    {
      label: "Students",
      href: "/dashboard/manager/students",
      icon: GraduationCap,
    },
    {
      label: "Teachers",
      href: "/dashboard/manager/teachers",
      icon: Users,
    },
    {
      label: "Classes",
      href: "/dashboard/manager/classes",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      href: "/dashboard/manager/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Exams",
      href: "/dashboard/manager/exams",
      icon: ClipboardList,
    },
    {
      label: "Results",
      href: "/dashboard/manager/results",
      icon: BarChart3,
    },
    {
      label: "Fees",
      href: "/dashboard/manager/fees",
      icon: CreditCard,
    },
    {
      label: "Reports",
      href: "/dashboard/manager/reports",
      icon: FileBarChart,
    },
  ],

  TEACHER: [
    {
      label: "Dashboard",
      href: "/dashboard/teacher",
      icon: LayoutDashboard,
    },
    {
      label: "My Students",
      href: "/dashboard/teacher/students",
      icon: GraduationCap,
    },
    {
      label: "My Classes",
      href: "/dashboard/teacher/classes",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Exams",
      href: "/dashboard/teacher/exams",
      icon: ClipboardList,
    },
    {
      label: "Results",
      href: "/dashboard/teacher/results",
      icon: BarChart3,
    },
  ],

  STUDENT: [
    {
      label: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      label: "My Classes",
      href: "/dashboard/student/classes",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      href: "/dashboard/student/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Exams",
      href: "/dashboard/student/exams",
      icon: ClipboardList,
    },
    {
      label: "Results",
      href: "/dashboard/student/results",
      icon: BarChart3,
    },
    {
      label: "Fees & Payments",
      href: "/dashboard/student/fees",
      icon: CreditCard,
    },
  ],

  GUARDIAN: [
    {
      label: "Dashboard",
      href: "/dashboard/guardian",
      icon: LayoutDashboard,
    },
    {
      label: "My Children",
      href: "/dashboard/guardian/children",
      icon: UserRound,
    },
    {
      label: "Attendance",
      href: "/dashboard/guardian/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Results",
      href: "/dashboard/guardian/results",
      icon: BarChart3,
    },
    {
      label: "Fees & Payments",
      href: "/dashboard/guardian/fees",
      icon: CreditCard,
    },
  ],
};

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const navigation = user
    ? navigationByRole[user.role] ?? []
    : [];

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
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold">
                SchoolHub
              </p>

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
                <p className="truncate text-sm font-medium">
                  {user.name}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                }
                onClick={onClose}
              />
            ))}
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