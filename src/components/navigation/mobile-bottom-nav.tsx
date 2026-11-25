"use client";

import {
  Bell,
  BookOpen,
  BookOpenCheck,
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

  if (!user || (user.role !== "TEACHER" && user.role !== "GUARDIAN")) {
    return null;
  }

  const hasHefz = user.schoolSetting?.hasHefzSection !== false;

  const items: BottomNavItem[] =
    user.role === "TEACHER"
      ? [
          {
            label: "Dashboard",
            href: "/dashboard/teacher",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: "Attendance",
            href: "/dashboard/teacher/attendance",
            icon: CalendarCheck,
          },
          hasHefz
            ? {
                label: "Hefz/Diary",
                href: "/dashboard/teacher/hefz",
                icon: BookOpenCheck,
              }
            : {
                label: "Classes",
                href: "/dashboard/teacher/classes",
                icon: BookOpen,
              },
          {
            label: "Notices",
            href: "/dashboard/notifications",
            icon: Bell,
          },
        ]
      : [
          {
            label: "My Children",
            href: "/dashboard/guardian",
            icon: Users,
            exact: true,
          },
          hasHefz
            ? {
                label: "Sabak/Diary",
                href: "/dashboard/guardian/hefz",
                icon: BookOpenCheck,
              }
            : {
                label: "Attendance",
                href: "/dashboard/guardian/attendance",
                icon: CalendarCheck,
              },
          {
            label: "Fees",
            href: "/dashboard/guardian/fees",
            icon: CreditCard,
          },
          {
            label: "Notices",
            href: "/dashboard/notifications",
            icon: Bell,
          },
        ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div className="grid h-16 grid-cols-4 items-center px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
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
