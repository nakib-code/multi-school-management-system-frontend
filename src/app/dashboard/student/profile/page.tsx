"use client";

import {
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";

export default function StudentProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-sm rounded-xl border bg-background p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />

          <h1 className="mt-3 font-semibold">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Please log in to view your profile information.
          </p>
        </div>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/student"
          aria-label="Back to dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your personal account information.
          </p>
        </div>
      </div>

      {/* Profile hero */}
      <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/50 to-blue-500/60" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                {initials || <UserRound className="h-10 w-10" />}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Student Account
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {user.status}
            </span>
          </div>
        </div>
      </section>

      {/* Information cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Personal Information</h2>
              <p className="text-xs text-muted-foreground">
                Your account details
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <InfoRow label="Full Name" value={user.name} />

            <InfoRow
              label="Account ID"
              value={`#${user.id}`}
            />

            <InfoRow
              label="Account Status"
              value={user.status}
            />

            <InfoRow
              label="Role"
              value={user.role.replaceAll("_", " ")}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Contact Information</h2>
              <p className="text-xs text-muted-foreground">
                Your registered contact details
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <InfoRow
              label="Email Address"
              value={user.email}
              icon={<Mail className="h-4 w-4" />}
            />

            <InfoRow
              label="Phone Number"
              value={user.phone || "Not provided"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-background p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">School Information</h2>
              <p className="text-xs text-muted-foreground">
                Your school association
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoRow
              label="School ID"
              value={user.schoolId ? `#${user.schoolId}` : "Not assigned"}
            />

            <InfoRow
              label="Student Record"
              value="Managed by your school"
            />
          </div>
        </section>
      </div>

      {/* Account notice */}
      <div className="flex gap-3 rounded-xl border bg-muted/30 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

        <div>
          <h3 className="text-sm font-semibold">Account information</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            This page displays information from your account. Contact your
            school administrator if any details need to be updated.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      {icon && (
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
