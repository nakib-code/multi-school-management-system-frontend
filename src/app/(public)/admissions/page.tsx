"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useSchool } from "@/features/schools/hooks";
import AdmissionForm from "@/components/admissions/admission-form";

function AdmissionsContent() {
  const searchParams = useSearchParams();

  const schoolId = Number(searchParams.get("schoolId"));

  const isValidSchoolId =
    Number.isInteger(schoolId) && schoolId > 0;

  const {
    data: school,
    isLoading,
    isError,
  } = useSchool(schoolId);

  if (!isValidSchoolId) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="school-container">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />

            <h1 className="mt-4 text-2xl font-bold text-[#061842]">
              School Not Selected
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please select a school before applying for admission.
            </p>

            <Link
              href="/schools"
              className="school-btn school-btn-primary mt-6 inline-flex"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Schools
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="school-container">
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a99d]" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !school) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="school-container">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

            <h1 className="mt-4 text-2xl font-bold text-[#061842]">
              School Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We could not find the selected school.
            </p>

            <Link
              href="/schools"
              className="school-btn school-btn-primary mt-6 inline-flex"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Schools
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="school-container">
        {/* Selected School */}
        <div className="mx-auto mb-8 max-w-5xl">
          <div className="rounded-2xl border border-[#00d2c4]/20 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#008f87]">
              Applying to
            </p>

            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#061842] sm:text-2xl">
                  {school.name}
                </h1>

                {school.address && (
                  <p className="mt-1 text-sm text-slate-500">
                    {school.address}
                  </p>
                )}
              </div>

              <Link
                href={`/schools/${school.id}`}
                className="hidden text-sm font-medium text-[#008f87] hover:underline sm:block"
              >
                View School
              </Link>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="school-badge-teal">
            Admission 2026–2027
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#061842] sm:text-4xl">
            Apply for Admission
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Complete the application form with your student and guardian
            information.
          </p>
        </div>

        {/* Admission Form */}
        <AdmissionForm schoolId={school.id} />
      </div>
    </main>
  );
}

function AdmissionsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="school-container">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#00a99d]" />
        </div>
      </div>
    </main>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense fallback={<AdmissionsLoading />}>
      <AdmissionsContent />
    </Suspense>
  );
}