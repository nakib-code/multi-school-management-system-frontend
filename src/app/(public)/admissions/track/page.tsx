"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { trackAdmission } from "@/features/admissions/api";
import type {
  TrackAdmissionResponse,
} from "@/features/admissions/types";

export default function TrackAdmissionPage() {
  const [applicationNo, setApplicationNo] =
    useState("");

  const [studentEmail, setStudentEmail] =
    useState("");

  const [result, setResult] =
    useState<TrackAdmissionResponse | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!applicationNo.trim()) {
      toast.error(
        "Please enter your application number",
      );
      return;
    }

    if (!studentEmail.trim()) {
      toast.error(
        "Please enter your student email",
      );
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);

      const data = await trackAdmission({
        applicationNo: applicationNo.trim(),
        studentEmail: studentEmail.trim(),
      });

      setResult(data);

      toast.success(
        "Application found successfully",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to track application",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const status = result?.status ?? "";

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-[#061842]">
            Track Your Admission
          </h1>

          <p className="mt-2 text-slate-600">
            Enter your application number and
            student email to check your admission
            status.
          </p>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="applicationNo"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Application Number
              </label>

              <input
                id="applicationNo"
                value={applicationNo}
                onChange={(event) =>
                  setApplicationNo(event.target.value)
                }
                placeholder="ADM-1234567890-1234"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#00a99d] focus:ring-2 focus:ring-[#00a99d]/10"
              />
            </div>

            <div>
              <label
                htmlFor="studentEmail"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Student Email
              </label>

              <input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(event) =>
                  setStudentEmail(event.target.value)
                }
                placeholder="student@example.com"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#00a99d] focus:ring-2 focus:ring-[#00a99d]/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00a99d] px-5 text-sm font-semibold text-white transition hover:bg-[#008f87] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Status */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Application Number
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#061842]">
                    {result.applicationNo}
                  </h2>
                </div>

                <StatusBadge status={status} />
              </div>
            </div>

            {/* Application Information */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-[#061842]">
                Application Details
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Student Name"
                  value={result.student.name}
                />

                <InfoItem
                  label="Student Email"
                  value={result.student.email}
                />

                <InfoItem
                  label="School"
                  value={result.school.name}
                />

                <InfoItem
                  label="School Code"
                  value={result.school.code}
                />

                <InfoItem
                  label="Class"
                  value={
                    result.academic.class?.name ??
                    "—"
                  }
                />

                <InfoItem
                  label="Section"
                  value={
                    result.academic.section?.name ??
                    "—"
                  }
                />

                <InfoItem
                  label="Academic Year"
                  value={result.academic.year}
                />

                <InfoItem
                  label="Shift"
                  value={
                    result.academic.shift ?? "—"
                  }
                />

                <InfoItem
                  label="Group"
                  value={
                    result.academic.group ?? "—"
                  }
                />

                <InfoItem
                  label="Submitted"
                  value={formatDate(result.createdAt)}
                />
              </div>
            </div>

            {/* Payment */}
            {result.payment && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-[#061842]">
                  Payment Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Payment Method"
                    value={
                      result.payment.paymentMethod
                    }
                  />

                  <InfoItem
                    label="Payment Status"
                    value={
                      result.payment.status
                    }
                  />

                  <InfoItem
                    label="Amount"
                    value={`৳${result.payment.amount}`}
                  />

                  <InfoItem
                    label="Paid At"
                    value={
                      result.payment.paidAt
                        ? formatDate(
                            result.payment.paidAt,
                          )
                        : "Not paid yet"
                    }
                  />

                  {result.payment.transactionId && (
                    <InfoItem
                      label="Transaction ID"
                      value={
                        result.payment.transactionId
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* Rejection */}
            {result.rejectionReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <h2 className="font-semibold text-red-800">
                      Application Rejected
                    </h2>

                    <p className="mt-1 text-sm text-red-700">
                      {result.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Review */}
            {result.reviewedAt && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <InfoItem
                  label="Reviewed At"
                  value={formatDate(
                    result.reviewedAt,
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();

  if (normalized === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Approved
      </span>
    );
  }

  if (normalized === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
        <XCircle className="h-4 w-4" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700">
      <Clock3 className="h-4 w-4" />
      {status}
    </span>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}