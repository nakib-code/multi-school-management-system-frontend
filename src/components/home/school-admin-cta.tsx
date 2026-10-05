"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Settings2,
  Users,
} from "lucide-react";

const features = [
  "Manage students and admissions",
  "Manage teachers and staff",
  "Track school performance",
  "Manage fees and payments",
];

export default function SchoolAdminCta() {
  return (
    <section
      id="school-admin"
      className="relative overflow-hidden bg-[#061842] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#00d2c4]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* Decorative Circles */}
      <div className="pointer-events-none absolute left-[8%] top-20 h-3 w-3 rounded-full bg-[#00d2c4]" />
      <div className="pointer-events-none absolute right-[12%] top-24 h-4 w-4 rounded-full bg-yellow-300" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ================= LEFT ================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#5ff5eb]">
              <GraduationCap className="h-4 w-4" />
              For School Owners &amp; Admins
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Bring Your School
              <span className="block text-[#00d2c4]">
                Online &amp; Grow
              </span>
              With Us
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              Manage your school, students, teachers, admissions, and daily
              operations from one powerful platform.
            </p>

            {/* Features */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-white/75"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00d2c4]" />
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register-school"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00d2c4] px-6 text-sm font-bold text-[#061842] transition hover:bg-[#20e0d3]"
              >
                Register Your School
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Packages
              </Link>
            </div>
          </motion.div>

          {/* ================= RIGHT VISUAL ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs text-white/40">School Dashboard</p>
                  <h3 className="mt-1 text-lg font-bold">
                    Sunrise International School
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842]">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Users className="h-5 w-5 text-[#00d2c4]" />

                  <p className="mt-4 text-2xl font-black">1,248</p>

                  <p className="mt-1 text-xs text-white/40">
                    Total Students
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <BarChart3 className="h-5 w-5 text-yellow-300" />

                  <p className="mt-4 text-2xl font-black">86%</p>

                  <p className="mt-1 text-xs text-white/40">
                    Attendance
                  </p>
                </div>
              </div>

              {/* Admission Card */}
              <div className="mt-4 rounded-2xl border border-[#00d2c4]/20 bg-[#00d2c4]/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40">
                      Admission Applications
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#5ff5eb]">
                      128
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842]">
                    <Settings2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-[#00d2c4]" />
                </div>

                <p className="mt-2 text-xs text-white/40">
                  72% application processing completed
                </p>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-4 top-16 rounded-2xl border border-white/10 bg-white px-4 py-3 text-[#061842] shadow-xl sm:-left-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00d2c4]/15 text-[#008f87]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Platform Status
                  </p>

                  <p className="text-sm font-bold">Everything Online</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Package */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-3 bottom-12 rounded-2xl border border-white/10 bg-white px-4 py-3 text-[#061842] shadow-xl sm:-right-7"
            >
              <p className="text-[10px] text-slate-400">Package</p>
              <p className="text-sm font-bold">Standard 500</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}