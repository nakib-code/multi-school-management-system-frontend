"use client";

import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { initiateAdmissionPayment } from "@/features/admissions/api";

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

  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  // Prevent repeated automatic initiation within this mounted component.
  const startedRef = useRef(false);

  const startPayment = useCallback(async () => {
    if (!isValid || isPaying) return;

    setIsPaying(true);
    setError("");

    try {
      const payment = await initiateAdmissionPayment(
        schoolId,
        admissionId,
      );

      if (!payment.paymentUrl) {
        throw new Error(
          "Payment gateway URL was not returned.",
        );
      }

      // Only allow HTTPS payment URLs.
      let paymentUrl: URL;

      try {
        paymentUrl = new URL(payment.paymentUrl);
      } catch {
        throw new Error("Invalid payment gateway URL.");
      }

      if (paymentUrl.protocol !== "https:") {
        throw new Error("Invalid payment gateway URL.");
      }

      window.location.assign(paymentUrl.toString());
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to start the payment.";

      setError(message);
      toast.error(message);
      setIsPaying(false);
    }
  }, [isValid, isPaying, schoolId, admissionId]);

  useEffect(() => {
    if (!isValid || startedRef.current) return;

    startedRef.current = true;
    void startPayment();
  }, [isValid, startPayment]);

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
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <CreditCard className="h-8 w-8 text-[#008f87]" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#061842]">
          Admission Payment
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          We are connecting you to the secure payment gateway
          to complete your admission payment.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-[#008f87]" />
          Secure payment processing
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
              onClick={() => void startPayment()}
              disabled={isPaying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#008f87] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00776f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPaying && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Retry Payment
            </button>
          </div>
        ) : (
          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#008f87]" />
            Connecting to payment gateway...
          </div>
        )}

        <Link
          href="/schools"
          className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#008f87]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Link>
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
