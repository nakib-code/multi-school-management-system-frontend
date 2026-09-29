"use client";

import { useState } from "react";

import { Header } from "@/components/header/header";
import { Sidebar } from "@/components/sidebar/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}