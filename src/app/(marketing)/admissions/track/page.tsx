"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  submitOnlinePaymentTrx,
  trackAdmission,
} from "@/features/admissions/api";
import type { TrackAdmissionResponse } from "@/features/admissions/types";

function TrackAdmissionContent() {
  const searchParams = useSearchParams();
  const initialAppNo = searchParams.get("applicationNo") ?? "";

  const [applicationNo, setApplicationNo] = useState(initialAppNo);
  const [guardianPhone, setGuardianPhone] = useState("");
  const [verifiedContact, setVerifiedContact] = useState("");
  const [result, setResult] = useState<TrackAdmissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [trxMethod, setTrxMethod] = useState<"BKASH" | "NAGAD" | "ROCKET">(
    "BKASH",
  );
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isSubmittingTrx, setIsSubmittingTrx] = useState(false);

  useEffect(() => {
    if (initialAppNo) {
      setApplicationNo(initialAppNo);
    }
  }, [initialAppNo]);

  useEffect(() => {
    const method = result?.payment?.paymentMethod;
    if (method === "BKASH" || method === "NAGAD" || method === "ROCKET") {
      setTrxMethod(method);
    }
  }, [result?.payment?.paymentMethod]);

  const handleSubmitTrx = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!result) return;
    if (trxId.trim().length < 4) {
      toast.error("Please enter a valid Transaction ID");
      return;
    }

    const contact = (verifiedContact || guardianPhone).trim();
    const isEmail = contact.includes("@");

    try {
      setIsSubmittingTrx(true);
      await submitOnlinePaymentTrx({
        applicationNo: result.applicationNo,
        ...(isEmail ? { studentEmail: contact } : { guardianPhone: contact }),
        paymentMethod: trxMethod,
        transactionId: trxId.trim().toUpperCase(),
        ...(senderPhone.trim() ? { senderPhone: senderPhone.trim() } : {}),
      });
      toast.success("Transaction ID submitted for verification");
      setTrxId("");
      setSenderPhone("");
      const refreshed = await trackAdmission({
        applicationNo: result.applicationNo,
        ...(isEmail ? { studentEmail: contact } : { guardianPhone: contact }),
      });
      setResult(refreshed);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit transaction ID",
      );
    } finally {
      setIsSubmittingTrx(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!applicationNo.trim()) {
      toast.error("Please enter your application number");
      return;
    }

    if (!guardianPhone.trim()) {
      toast.error("Please enter guardian phone or email");
      return;
    }

    const contact = guardianPhone.trim();
    const isEmail = contact.includes("@");

    try {
      setIsLoading(true);
      setResult(null);

      const data = await trackAdmission({
        applicationNo: applicationNo.trim(),
        ...(isEmail ? { studentEmail: contact } : { guardianPhone: contact }),
      });

      setResult(data);
      setVerifiedContact(contact);
      toast.success("Application found successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to track application",
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
            Enter your application number and guardian phone (or student email)
            to check your admission status.
          </p>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(event) => setApplicationNo(event.target.value)}
                placeholder="ADM-1234567890-1234"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#00a99d] focus:ring-2 focus:ring-[#00a99d]/10"
              />
            </div>

            <div>
              <label
                htmlFor="guardianPhone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Guardian Phone (or Student Email)
              </label>

              <input
                id="guardianPhone"
                type="text"
                value={guardianPhone}
                onChange={(event) => setGuardianPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
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
                  <p className="text-sm text-slate-500">Application Number</p>

                  <h2 className="mt-1 text-xl font-bold text-[#061842]">
                    {result.applicationNo}
                  </h2>
                </div>

                <StatusBadge status={status} />
              </div>
            </div>

            {/* Approved Student Enrollment Details */}
            {result.status === "APPROVED" && result.approvedStudent && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">
                    Student Enrolled Successfully
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    label="Student ID"
                    value={result.approvedStudent.studentId}
                  />
                  <InfoItem
                    label="Roll Number"
                    value={
                      result.approvedStudent.rollNumber !== null
                        ? String(result.approvedStudent.rollNumber)
                        : "Assigned by office"
                    }
                  />
                  <InfoItem
                    label="Enrolled Class"
                    value={
                      result.approvedStudent.className ??
                      result.academic.class?.name ??
                      "—"
                    }
                  />
                  <InfoItem
                    label="Section"
                    value={
                      result.approvedStudent.sectionName ??
                      result.academic.section?.name ??
                      "—"
                    }
                  />
                </div>
              </div>
            )}

            {/* Application Information */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-[#061842]">
                Application Details
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem label="Student Name" value={result.student.name} />

                <InfoItem
                  label="Guardian Phone"
                  value={
                    result.student.guardianPhone ?? result.student.email ?? "—"
                  }
                />

                <InfoItem label="School" value={result.school.name} />

                <InfoItem label="School Code" value={result.school.code} />

                <InfoItem
                  label="Class"
                  value={result.academic.class?.name ?? "—"}
                />

                <InfoItem
                  label="Section"
                  value={result.academic.section?.name ?? "—"}
                />

                <InfoItem label="Academic Year" value={result.academic.year} />

                <InfoItem label="Shift" value={result.academic.shift ?? "—"} />

                <InfoItem label="Group" value={result.academic.group ?? "—"} />

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
                    value={result.payment.paymentMethod}
                  />

                  <InfoItem
                    label="Payment Status"
                    value={result.payment.status}
                  />

                  <InfoItem
                    label="Amount"
                    value={`৳${result.payment.amount}`}
                  />

                  <InfoItem
                    label="Paid At"
                    value={
                      result.payment.paidAt
                        ? formatDate(result.payment.paidAt)
                        : "Not paid yet"
                    }
                  />

                  {result.payment.transactionId && (
                    <InfoItem
                      label="Transaction ID"
                      value={result.payment.transactionId}
                    />
                  )}

                  {result.payment.remarks && (
                    <InfoItem label="Remarks" value={result.payment.remarks} />
                  )}
                </div>

                {result.status === "PENDING" &&
                  result.payment.paymentMethod !== "CASH" &&
                  result.payment.status !== "PAID" && (
                    <form
                      onSubmit={handleSubmitTrx}
                      className="mt-6 space-y-4 border-t pt-5"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-[#061842]">
                          {result.payment.transactionId
                            ? "Update Mobile Banking Transaction ID"
                            : "Submit Mobile Banking Transaction ID"}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                          Send ৳{result.payment.amount} via bKash, Nagad, or
                          Rocket and enter your TrxID below for school
                          verification.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <select
                          value={trxMethod}
                          onChange={(e) =>
                            setTrxMethod(
                              e.target.value as "BKASH" | "NAGAD" | "ROCKET",
                            )
                          }
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                        >
                          <option value="BKASH">bKash</option>
                          <option value="NAGAD">Nagad</option>
                          <option value="ROCKET">Rocket</option>
                        </select>

                        <input
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder="Transaction ID (e.g. 9K2L8M4N)"
                          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                          required
                        />

                        <input
                          type="text"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="Sender Phone (optional)"
                          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingTrx}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00a99d] px-5 text-sm font-semibold text-white transition hover:bg-[#008f87] disabled:opacity-60"
                      >
                        {isSubmittingTrx ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Transaction ID"
                        )}
                      </button>
                    </form>
                  )}
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
                  value={formatDate(result.reviewedAt)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function InfoItem({ label, value }: { label: string; value: string }) {
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

export default function TrackAdmissionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-7 w-7 animate-spin text-[#00a99d]" />
        </main>
      }
    >
      <TrackAdmissionContent />
    </Suspense>
  );
}
