"use client";

import {
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  const roleName = user.role.replace("_", " ");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      toast.success("Logged out successfully");

      router.replace("/auth/login");
    } catch {
      toast.error("Logout failed", {
        description: "Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="hidden min-w-0 text-left md:block">
          <p className="max-w-32 truncate text-sm font-medium">
            {user.name}
          </p>

          <p className="max-w-32 truncate text-xs text-muted-foreground">
            {roleName}
          </p>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-muted-foreground transition-transform md:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close user menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-background shadow-lg"
          >
            <div className="border-b px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {roleName}
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  toast.info("Profile page coming soon");
                }}
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UserRound className="h-4 w-4" />
                Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  toast.info("Settings page coming soon");
                }}
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>

            <div className="border-t p-2">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />

                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}