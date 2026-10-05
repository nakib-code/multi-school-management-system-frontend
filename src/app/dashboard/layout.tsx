"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";

const roleDashboardPaths = {
  SUPER_ADMIN: "/dashboard/super-admin",
  ADMIN: "/dashboard/admin",
  MANAGER: "/dashboard/manager",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  GUARDIAN: "/dashboard/guardian",
} as const;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // User is not authenticated
    if (!isAuthenticated || !user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    const expectedPath = roleDashboardPaths[user.role];

    // Unknown / unsupported role
    if (!expectedPath) {
      router.replace("/auth/login");
      return;
    }

    // /dashboard → user's own dashboard
    if (pathname === "/dashboard") {
      router.replace(expectedPath);
      return;
    }

    // Check role-based access
    const isAuthorizedPath =
      pathname === expectedPath ||
      pathname.startsWith(`${expectedPath}/`);

    if (!isAuthorizedPath) {
      router.replace(expectedPath);
    }
  }, [
    isAuthenticated,
    isLoading,
    pathname,
    router,
    user,
  ]);

  // Authentication loading
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  const expectedPath = roleDashboardPaths[user.role];

  // Invalid role
  if (!expectedPath) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting...
          </p>
        </div>
      </main>
    );
  }

  // Check role-based access
  const isAuthorizedPath =
    pathname === expectedPath ||
    pathname.startsWith(`${expectedPath}/`);

  if (!isAuthorizedPath) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting...
          </p>
        </div>
      </main>
    );
  }


  return <>{children}</>;
}