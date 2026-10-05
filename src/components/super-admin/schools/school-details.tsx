"use client";

import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";

import type { School } from "@/types/school";

import { SchoolStatusBadge } from "./school-status-badge";

interface SchoolDetailsProps {
  school: School;
}

export function SchoolDetails({
  school,
}: SchoolDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/super-admin/schools"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to schools
      </Link>

      {/* Header */}
      <div className="rounded-xl border bg-background">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {school.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={school.logo}
                  alt={school.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">
                  {school.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {school.name}
              </h1>

              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {school.code}
              </p>
            </div>
          </div>

          <SchoolStatusBadge status={school.status} />
        </div>
      </div>

      {/* School Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">School Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Basic information about this school.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <InfoItem
            icon={Mail}
            label="School Email"
            value={school.email}
          />

          <InfoItem
            icon={Phone}
            label="School Phone"
            value={school.phone}
          />

          <InfoItem
            icon={MapPin}
            label="Address"
            value={school.address}
            className="sm:col-span-2"
          />

          <InfoItem
            icon={CalendarDays}
            label="Registered"
            value={formatDate(school.createdAt)}
          />

          <InfoItem
            icon={CalendarDays}
            label="Last Updated"
            value={formatDate(school.updatedAt)}
          />
        </div>
      </section>

      {/* Admin Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">School Admin</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrator information for this school.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <InfoItem
            icon={User}
            label="Admin Name"
            value={school.adminName}
          />

          <InfoItem
            icon={Mail}
            label="Admin Email"
            value={school.adminEmail}
          />

          <InfoItem
            icon={Phone}
            label="Admin Phone"
            value={school.adminPhone}
          />

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Email Verification
              </p>

              <p className="mt-1 text-sm font-medium">
                {school.adminEmailVerified
                  ? "Verified"
                  : "Not verified"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rejection */}
      {school.status === "REJECTED" &&
        school.rejectionReason && (
          <section className="rounded-xl border border-destructive/20 bg-destructive/5">
            <div className="p-6">
              <h2 className="font-semibold text-destructive">
                Rejection Reason
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {school.rejectionReason}
              </p>
            </div>
          </section>
        )}
    </div>
  );
}

interface InfoItemProps {
  icon: typeof Mail;
  label: string;
  value: string | null | undefined;
  className?: string;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: InfoItemProps) {
  return (
    <div
      className={`flex items-start gap-3 ${
        className ?? ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
