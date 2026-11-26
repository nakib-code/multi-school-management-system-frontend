"use client";

import {
  Bell,
  BookOpen,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface BottomNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (
    !user ||
    (user.role !== "TEACHER" &&
      user.role !== "GUARDIAN" &&
      user.role !== "STUDENT")
  ) {
    return null;
  }

  const items: BottomNavItem[] =
    user.role === "TEACHER"
      ? [
          {
            label: "Home",
            href: "/dashboard/teacher",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Attendance",
            href: "/dashboard/teacher/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Diary",
            href: "/dashboard/teacher/diary",
            icon: BookOpen,
          },
          {
            label: "Alerts",
            href: "/dashboard/notifications",
            icon: Bell,
          },
        ]
      : user.role === "GUARDIAN"
        ? [
            {
              label: "Home",
              href: "/dashboard/guardian",
              icon: Users,
              exact: true,
            },
            {
              label: "Attendance",
              href: "/dashboard/guardian/attendance",
              icon: CalendarCheck,
            },
            {
              label: "Diary",
              href: "/dashboard/guardian/diary",
              icon: BookOpen,
            },
            {
              label: "Alerts",
              href: "/dashboard/notifications",
              icon: Bell,
            },
          ]
        : [
            {
              label: "Home",
              href: "/dashboard/student",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              label: "Attendance",
              href: "/dashboard/student/attendance",
              icon: CalendarCheck,
            },
            {
              label: "Diary",
              href: "/dashboard/student/diary",
              icon: BookOpen,
            },
            {
              label: "Fees",
              href: "/dashboard/student/fees",
              icon: CreditCard,
            },
          ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div className="grid h-16 grid-cols-4 items-center px-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[11px] py-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "stroke-[2.25]" : "stroke-[1.75]"}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
