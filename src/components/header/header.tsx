"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { NotificationMenu } from "./notification-menu";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard/super-admin": "Super Admin Dashboard",
  "/dashboard/admin": "Admin Dashboard",
  "/dashboard/manager": "Manager Dashboard",
  "/dashboard/teacher": "Teacher Dashboard",
  "/dashboard/student": "Student Dashboard",
  "/dashboard/guardian": "Guardian Dashboard",
};

export function Header({
  onMenuClick,
}: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const basePath = user
    ? `/dashboard/${user.role
        .toLowerCase()
        .replace("_", "-")}`
    : "";

  const title =
    pageTitles[basePath] ?? "School Management System";

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
        <h1 className="truncate text-sm font-semibold sm:text-base">
          {title}
        </h1>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Manage your school efficiently
        </p>
      </div>

      <div className="flex items-center gap-2">
        <NotificationMenu />
        <UserMenu />
      </div>
    </header>
  );
}