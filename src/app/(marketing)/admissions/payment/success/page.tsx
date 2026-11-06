"use client";

import Link from "next/link";
import { CheckCircle2, Home, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const admissionId = searchParams.get("admissionId");
  const transactionId = searchParams.get("transactionId");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Payment Successful
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            Your admission payment has been successfully verified.
            Your application has been received successfully.
          </p>

          <div className="mt-8 rounded-xl bg-slate-50 p-5 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">
                  Admission ID
                </span>

                <span className="font-semibold text-slate-900">
                  {admissionId ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">
                  Transaction ID
                </span>

                <span className="max-w-[220px] truncate font-semibold text-slate-900">
                  {transactionId ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">
                  Payment Status
                </span>

                <span className="font-semibold text-emerald-600">
                  PAID
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Please keep your admission ID and transaction ID
            for future reference.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#061842] px-5 text-sm font-medium text-white transition hover:bg-[#0a2457]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>

            <Link
              href="/admissions/track"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              Track Application
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">
            Loading payment result...
          </div>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}