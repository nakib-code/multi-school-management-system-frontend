"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/header/header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useAuth } from "@/providers/auth-provider";

interface DashboardShellProps {
  children: React.ReactNode;
}

const ROUTE_FEATURE_MAP: {
  segment: string;
  key:
    | "hasHefzSection"
    | "hasOnlineAdmission"
    | "hasTeacherPayroll"
    | "hasPublicWebsite";
  label: string;
}[] = [
  { segment: "/hefz", key: "hasHefzSection", label: "Hefz & Najera Tracking" },
  {
    segment: "/admissions",
    key: "hasOnlineAdmission",
    label: "Online Admissions",
  },
  {
    segment: "/salaries",
    key: "hasTeacherPayroll",
    label: "Teacher Payroll & Salaries",
  },
  {
    segment: "/website",
    key: "hasPublicWebsite",
    label: "Public Website Builder",
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role === "SUPER_ADMIN" || !user.schoolSetting) return;

    const blocked = ROUTE_FEATURE_MAP.find(
      (rule) =>
        (pathname.endsWith(rule.segment) ||
          pathname.includes(`${rule.segment}/`)) &&
        user.schoolSetting?.[rule.key] === false,
    );

    if (blocked) {
      toast.error(`${blocked.label} is not enabled for your institution.`);
      router.replace("/dashboard");
    }
  }, [pathname, router, user]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)] p-4 pb-20 sm:p-6 md:pb-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
