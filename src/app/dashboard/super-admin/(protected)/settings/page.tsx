"use client";

import {
  Bell,
  ChevronRight,
  Lock,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";

const settingsItems = [
  {
    title: "Profile",
    description: "View and manage your Super Admin profile.",
    icon: User,
    href: "/dashboard/super-admin/settings/profile",
  },
  {
    title: "Security",
    description: "Manage password and account security.",
    icon: Lock,
    href: "/dashboard/super-admin/settings/security",
  },
  {
    title: "Notifications",
    description: "Manage your notification preferences.",
    icon: Bell,
    href: "/dashboard/super-admin/settings/notifications",
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and dashboard preferences.
        </p>
      </div>

      {/* Account Overview */}
      <section className="rounded-xl border bg-background p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>

          <div>
            <p className="font-semibold">Super Admin Account</p>

            <p className="text-sm text-muted-foreground">
              Manage your account settings and security.
            </p>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Account Settings
          </h2>

          <p className="text-sm text-muted-foreground">
            Choose a setting to manage.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-background">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-4 p-5 transition hover:bg-muted/40 ${
                  index !== settingsItems.length - 1
                    ? "border-b"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* System Information */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            System
          </h2>

          <p className="text-sm text-muted-foreground">
            General information about your dashboard.
          </p>
        </div>

        <div className="rounded-xl border bg-background">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <p className="font-medium">Role</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your current system role.
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              SUPER ADMIN
            </span>
          </div>

          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">Dashboard</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Multi-School Management System
              </p>
            </div>

            <span className="text-sm text-muted-foreground">
              v1.0
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}