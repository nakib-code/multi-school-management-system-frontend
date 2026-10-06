"use client";

import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, GraduationCap } from "lucide-react";

import { useCreateSchool } from "@/features/schools/hooks";
import { RegistrationForm } from "@/components/home/registration/registration-form";

export default function RegisterSchoolPage() {
  const { mutateAsync: registerSchool } = useCreateSchool();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden bg-[#061842] text-white">
        {/* Decorative backgrounds */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#00d2c4]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Back */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-[#00d2c4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5ff5eb]">
                <Building2 className="h-4 w-4" />
                For Schools
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Bring Your School
                <span className="block text-[#00d2c4]">
                  Online With Us
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                Register your school and manage students, teachers, admissions,
                payments, and daily operations from one simple platform.
              </p>

              {/* Benefits */}
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Easy School Management",
                  "Online Admission",
                  "Secure Platform",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-white/65"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Logo Icon */}
            <div className="hidden lg:flex">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
                <GraduationCap className="h-12 w-12 text-[#00d2c4]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FORM ================= */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            {/* Form Header */}
            <div className="border-b border-slate-200 px-6 py-7 sm:px-8 lg:px-10">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00d2c4]/10 text-[#008f87]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#061842] sm:text-2xl">
                    Register Your School
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Fill in the information below to submit your school for
                    approval.
                  </p>
                </div>
              </div>
            </div>

            <RegistrationForm registerSchool={registerSchool} />

            {/* Login */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center text-sm text-slate-500 sm:px-8">
              Already have a school account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#008f87] transition hover:text-[#061842] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}