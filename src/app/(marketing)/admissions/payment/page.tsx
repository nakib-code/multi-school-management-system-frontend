"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Search,
  Send,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type InitiateAdmissionPaymentResponse,
  initiateAdmissionPayment,
  submitOnlinePaymentTrx,
} from "@/features/admissions/api";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  PERSONAL: "Send Money (Personal)",
  MERCHANT: "Make Payment (Merchant)",
  AGENT: "Cash Out (Agent)",
};

function PaymentContent() {
  const searchParams = useSearchParams();

  const schoolIdParam = searchParams.get("schoolId");
  const admissionIdParam = searchParams.get("admissionId");
  const applicationNoParam = searchParams.get("applicationNo") ?? "";
  const guardianPhoneParam = searchParams.get("guardianPhone") ?? "";

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

  const [guardianPhone, setGuardianPhone] = useState(guardianPhoneParam);
  const [selectedMethod, setSelectedMethod] = useState<
    "BKASH" | "NAGAD" | "ROCKET"
  >("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isSubmittingTrx, setIsSubmittingTrx] = useState(false);
  const [submittedTrxId, setSubmittedTrxId] = useState<string | null>(null);

  const startedRef = useRef(false);

  const loadPaymentDetails = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await initiateAdmissionPayment(schoolId, admissionId);
      setPaymentInfo(data);
      if (
        data.paymentMethod === "BKASH" ||
        data.paymentMethod === "NAGAD" ||
        data.paymentMethod === "ROCKET"
      ) {
        setSelectedMethod(data.paymentMethod);
      } else {
        const firstConfigured = data.supportedMethods.find((m) =>
          Boolean(data.receiverNumbers[m]),
        );
        if (firstConfigured) {
          setSelectedMethod(firstConfigured);
        }
      }
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

  const resolvedApplicationNo =
    paymentInfo?.applicationNo || applicationNoParam;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  const handleSubmitTrx = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedApplicationNo) {
      toast.error("Application number is missing.");
      return;
    }
    if (!guardianPhone.trim()) {
      toast.error(
        "Please enter the guardian phone number used in your application.",
      );
      return;
    }
    if (transactionId.trim().length < 4) {
      toast.error(
        "Please enter a valid Transaction ID (at least 4 characters).",
      );
      return;
    }

    setIsSubmittingTrx(true);
    try {
      const res = await submitOnlinePaymentTrx({
        applicationNo: resolvedApplicationNo,
        guardianPhone: guardianPhone.trim(),
        paymentMethod: selectedMethod,
        transactionId: transactionId.trim().toUpperCase(),
        ...(senderPhone.trim() ? { senderPhone: senderPhone.trim() } : {}),
      });
      setSubmittedTrxId(
        res.transactionId ?? transactionId.trim().toUpperCase(),
      );
      toast.success("Transaction ID submitted for school verification!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit Transaction ID.",
      );
    } finally {
      setIsSubmittingTrx(false);
    }
  };

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
              {resolvedApplicationNo ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5">
                  <span className="text-xs font-medium text-teal-800">
                    Application No:
                  </span>
                  <span className="font-mono text-sm font-bold text-[#061842]">
                    {resolvedApplicationNo}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy(resolvedApplicationNo, "Application No")
                    }
                    className="rounded p-1 text-teal-700 transition hover:bg-teal-100"
                    title="Copy Application Number"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              <p className="mt-1.5 text-xs text-slate-500">
                Admission ID: #{paymentInfo.admissionId} — Save your Application
                Number to track status.
              </p>
            </div>

            {paymentInfo.instruction ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {paymentInfo.instruction}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              {paymentInfo.supportedMethods.map((method) => {
                const receiver = paymentInfo.receiverNumbers[method];
                const accountType =
                  paymentInfo.receiverAccountTypes?.[method] ?? "PERSONAL";
                return (
                  <div
                    key={method}
                    className="rounded-xl border border-slate-200 p-3 text-center"
                  >
                    <p className="text-xs font-bold text-[#061842]">{method}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ACCOUNT_TYPE_LABELS[accountType] ?? accountType}
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <p className="font-mono text-xs font-medium text-slate-700">
                        {receiver ?? "Not configured"}
                      </p>
                      {receiver ? (
                        <button
                          type="button"
                          onClick={() => void handleCopy(receiver, method)}
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title={`Copy ${method} number`}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {submittedTrxId ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <p className="mt-2 text-sm font-semibold text-emerald-900">
                  Transaction ID Submitted!
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  TrxID{" "}
                  <span className="font-mono font-bold">{submittedTrxId}</span>{" "}
                  is now awaiting verification by the school office.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => void handleSubmitTrx(e)}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-sm font-semibold text-[#061842]">
                  Submit Payment Transaction ID (TrxID)
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="trx-method"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Payment Method
                    </label>
                    <select
                      id="trx-method"
                      value={selectedMethod}
                      onChange={(e) =>
                        setSelectedMethod(
                          e.target.value as "BKASH" | "NAGAD" | "ROCKET",
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="ROCKET">Rocket</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="guardian-phone"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Guardian Phone (from application)
                    </label>
                    <input
                      id="guardian-phone"
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="trx-id"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Transaction ID (TrxID)
                    </label>
                    <input
                      id="trx-id"
                      type="text"
                      value={transactionId}
                      onChange={(e) =>
                        setTransactionId(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. 9K2A8X12BC"
                      required
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm uppercase"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sender-phone"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Sender Number (Optional)
                    </label>
                    <input
                      id="sender-phone"
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTrx}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#061842] px-4 text-sm font-semibold text-white transition hover:bg-[#0d2760] disabled:opacity-60"
                >
                  {isSubmittingTrx ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmittingTrx ? "Submitting..." : "Submit TrxID"}
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={
                  resolvedApplicationNo
                    ? `/admissions/track?applicationNo=${encodeURIComponent(resolvedApplicationNo)}`
                    : "/admissions/track"
                }
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
