"use client";

import Link from "next/link";
import { Home, RotateCcw, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentFailContent() {
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("transactionId");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-9 w-9 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Payment Failed
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            Unfortunately, your admission payment could not
            be completed.
          </p>

          {transactionId && (
            <div className="mt-8 rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Transaction ID
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                {transactionId}
              </p>
            </div>
          )}

          <p className="mt-6 text-sm text-slate-500">
            You can try the payment again from your admission
            application.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/admissions"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#061842] px-5 text-sm font-medium text-white transition hover:bg-[#0a2457]"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailPage() {
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
      <PaymentFailContent />
    </Suspense>
  );
}