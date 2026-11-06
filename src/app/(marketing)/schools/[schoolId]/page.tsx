"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useSchool } from "@/features/schools/hooks";

export default function SchoolDetailsPage() {
  const params = useParams();

  const schoolId = Number(params.schoolId);

  const { data: school, isLoading, isError } = useSchool(schoolId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="school-container flex min-h-[500px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00a99d]" />
        </div>
      </main>
    );
  }

  if (isError || !school) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="school-container">
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#061842]">
              School Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              We could not find this school. It may no longer be available.
            </p>

            <Link
              href="/schools"
              className="school-btn school-btn-primary mt-6"
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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#061842] py-14 text-white sm:py-20">
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#00d2c4]/10 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="school-container relative z-10">
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Link>

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
            {/* Logo */}
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl sm:h-40 sm:w-40">
              {school.logo ? (
                <img
                  src={school.logo}
                  alt={`${school.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#00d2c4] text-5xl font-black text-[#061842]">
                  {school.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* School Info */}
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Admission Open
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {school.name}
              </h1>

              <p className="mt-3 text-sm text-white/60">
                School Code: {school.code}
              </p>

              {school.address && (
                <div className="mt-4 flex items-start gap-2 text-sm text-white/65">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00d2c4]" />
                  <span>{school.address}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div>
              <Link
                href={`/admissions?schoolId=${school.id}`}
                className="school-btn school-btn-accent school-btn-lg inline-flex w-full sm:w-auto"
              >
                Apply for Admission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="school-container">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* About */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
              <span className="school-section-badge">
                About School
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#061842]">
                Welcome to {school.name}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Explore admission opportunities at {school.name}. Complete
                your application online and provide the required student and
                guardian information.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Academic Year
                  </p>
                  <p className="mt-1 font-semibold text-[#061842]">
                    2026–2027
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Admission Status
                  </p>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Open
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#061842]">
                Contact School
              </h2>

              <div className="mt-6 space-y-5">
                {school.email && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00d2c4]/10">
                      <Mail className="h-5 w-5 text-[#008f87]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="mt-1 break-all text-sm font-medium text-[#061842]">
                        {school.email}
                      </p>
                    </div>
                  </div>
                )}

                {school.phone && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00d2c4]/10">
                      <Phone className="h-5 w-5 text-[#008f87]" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="mt-1 text-sm font-medium text-[#061842]">
                        {school.phone}
                      </p>
                    </div>
                  </div>
                )}

                {school.address && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00d2c4]/10">
                      <MapPin className="h-5 w-5 text-[#008f87]" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Address</p>
                      <p className="mt-1 text-sm leading-6 font-medium text-[#061842]">
                        {school.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admission CTA */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-[#061842] p-7 text-white sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-[#5ff5eb]">
                  Admission 2026–2027
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Ready to apply?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                  Start your admission application for {school.name}.
                </p>
              </div>

              <Link
                href={`/admissions?schoolId=${school.id}`}
                className="school-btn school-btn-accent school-btn-lg shrink-0"
              >
                Start Application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}