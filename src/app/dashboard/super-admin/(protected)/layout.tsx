"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SuperAdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}