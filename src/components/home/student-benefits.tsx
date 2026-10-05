"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  FileCheck2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Find the Right School",
    description:
      "Explore schools, locations, admission status, and available opportunities in one place.",
  },
  {
    icon: FileCheck2,
    title: "Easy Online Application",
    description:
      "Complete admission forms online without unnecessary paperwork or repeated visits.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your application and personal information are handled through a secure platform.",
  },
  {
    icon: BellRing,
    title: "Stay Updated",
    description:
      "Get important admission updates and follow your application status easily.",
  },
];

export default function StudentBenefits() {
  return (
    <section
      id="benefits"
      className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#00d2c4]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ================= LEFT CONTENT ================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/20 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#008f87]">
              <Sparkles className="h-4 w-4" />
              Built for Students &amp; Guardians
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[#061842] sm:text-4xl lg:text-5xl">
              Everything You Need
              <span className="block text-[#00a99d]">
                for a Better Admission
              </span>
              Experience
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              We bring the important parts of school admission together so
              students and guardians can make better decisions with less
              stress.
            </p>

            {/* Highlight */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#061842] text-[#00d2c4]">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-[#061842]">
                  One platform, one simple journey
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Search, apply, pay, and track your admission from one
                  convenient place.
                </p>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/schools"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[#061842] px-6 text-sm font-bold text-white transition hover:bg-[#0b285f]"
            >
              Explore Schools
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* ================= RIGHT BENEFITS ================= */}
          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00d2c4]/30 hover:shadow-xl"
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#061842] text-[#00d2c4] transition-all duration-300 group-hover:bg-[#00d2c4] group-hover:text-[#061842]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#061842]">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= STATS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid overflow-hidden rounded-3xl bg-[#061842] sm:grid-cols-3"
        >
          <div className="border-b border-white/10 px-6 py-8 text-center sm:border-b-0 sm:border-r">
            <p className="text-3xl font-black text-[#00d2c4]">100%</p>
            <p className="mt-1 text-sm text-white/50">
              Online Application
            </p>
          </div>

          <div className="border-b border-white/10 px-6 py-8 text-center sm:border-b-0 sm:border-r">
            <p className="text-3xl font-black text-yellow-300">24/7</p>
            <p className="mt-1 text-sm text-white/50">
              Application Tracking
            </p>
          </div>

          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-black text-white">1</p>
            <p className="mt-1 text-sm text-white/50">
              Simple Admission Platform
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}