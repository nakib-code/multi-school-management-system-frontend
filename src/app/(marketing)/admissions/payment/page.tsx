"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Search,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type InitiateAdmissionPaymentResponse,
  initiateAdmissionPayment,
} from "@/features/admissions/api";

function PaymentContent() {
  const searchParams = useSearchParams();

  const schoolIdParam = searchParams.get("schoolId");
  const admissionIdParam = searchParams.get("admissionId");

  const schoolId = Number(schoolIdParam);
  const admissionId = Number(admissionIdParam);

  const isValid =
    schoolIdParam !== null &&
    admissionIdParam !== null &&
    Number.isInteger(schoolId) &&
    schoolId > 0 &&
    Number.isInteger(admissionId) &&
    admissionId > 0;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] =
    useState<InitiateAdmissionPaymentResponse | null>(null);

  const startedRef = useRef(false);

  const loadPaymentDetails = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await initiateAdmissionPayment(schoolId, admissionId);
      setPaymentInfo(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load mobile banking payment details.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isValid, isLoading, schoolId, admissionId]);

  useEffect(() => {
    if (!isValid || startedRef.current) return;

    startedRef.current = true;
    void loadPaymentDetails();
  }, [isValid, loadPaymentDetails]);

  if (!isValid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />

          <h1 className="mt-4 text-2xl font-bold text-[#061842]">
            Invalid Payment Request
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The school or admission information is missing or invalid.
          </p>

          <Link
            href="/schools"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#008f87] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Schools
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <Smartphone className="h-8 w-8 text-[#008f87]" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#061842]">
            Admission Mobile Banking Payment
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {paymentInfo?.message ??
              "Send your admission fee via bKash, Nagad, or Rocket using the school account numbers below."}
          </p>
        </div>

        {error ? (
          <div className="mt-6 space-y-4">
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700"
            >
              {error}
            </div>

            <button
              type="button"
              onClick={() => void loadPaymentDetails()}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#008f87] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00776f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Retry
            </button>
          </div>
        ) : isLoading || !paymentInfo ? (
          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#008f87]" />
            Loading payment instructions...
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Admission Fee Amount
              </p>
              <p className="mt-1 text-2xl font-bold text-[#061842]">
                ৳{Number(paymentInfo.amount).toLocaleString("en-BD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Admission ID: #{paymentInfo.admissionId}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {paymentInfo.supportedMethods.map((method) => (
                <div
                  key={method}
                  className="rounded-xl border border-slate-200 p-3 text-center"
                >
                  <p className="text-xs font-bold text-[#061842]">{method}</p>
                  <p className="mt-1 font-mono text-xs text-slate-600">
                    {paymentInfo.receiverNumbers[method] ?? "Contact school"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admissions/track"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#008f87] px-4 text-sm font-semibold text-white transition hover:bg-[#00776f]"
              >
                <Search className="h-4 w-4" />
                Track Application
              </Link>

              <Link
                href="/schools"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Schools
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function PaymentLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-7 w-7 animate-spin text-[#008f87]" />
    </main>
  );
}

export default function AdmissionPaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
