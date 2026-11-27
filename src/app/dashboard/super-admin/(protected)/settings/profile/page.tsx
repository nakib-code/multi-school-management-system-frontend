"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SelfProfileForm } from "@/components/shared/self-profile-form";

export default function SuperAdminProfileSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/super-admin/settings"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Super Admin account information and avatar.
        </p>
      </div>

      <SelfProfileForm />
    </div>
  );
}
