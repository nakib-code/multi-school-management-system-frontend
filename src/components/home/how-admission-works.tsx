"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your School",
    description:
      "Search and explore schools based on location, admission status, and your preferences.",
    icon: Search,
  },
  {
    number: "02",
    title: "Check Admission",
    description:
      "View available classes, admission requirements, fees, and application deadlines.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Apply Online",
    description:
      "Complete the admission form and submit your child's information securely online.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Track Your Application",
    description:
      "Follow your application status and receive updates throughout the admission process.",
    icon: CheckCircle2,
  },
];

export default function HowAdmissionWorks() {
  return (
    <section
      id="admission"
      className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#00d2c4]/5 blur-3xl" />

      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/20 bg-[#00d2c4]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#008f87]">
            <Sparkles className="h-4 w-4" />
            Simple Admission Process
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#061842] sm:text-4xl lg:text-5xl">
            Admission Made
            <span className="block text-[#00a99d]">Simple &amp; Easy</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            From finding the right school to tracking your application, we
            make the entire admission journey simple and stress-free.
          </p>
        </motion.div>

        {/* ================= STEPS ================= */}
        <div className="relative mt-14 sm:mt-16">
          {/* Desktop Connecting Line */}
          <div className="absolute left-[12%] right-[12%] top-14 hidden h-px bg-gradient-to-r from-transparent via-[#00d2c4]/40 to-transparent lg:block" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  className="group relative text-center"
                >
                  {/* Step Icon */}
                  <div className="relative z-10 mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-slate-50 bg-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#061842] text-[#00d2c4] transition-colors duration-300 group-hover:bg-[#00d2c4] group-hover:text-[#061842]">
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Number */}
                    <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-xs font-black text-[#061842] shadow-md">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mx-auto mt-6 max-w-xs">
                    <h3 className="text-lg font-bold text-[#061842]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>

                  {/* Desktop Arrow */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute -right-5 top-12 hidden h-5 w-5 text-[#00d2c4]/50 lg:block" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 overflow-hidden rounded-3xl bg-[#061842] shadow-xl"
        >
          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#00d2c4]/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#00d2c4]">
                  <CreditCard className="h-4 w-4" />
                  Secure Online Admission
                </div>

                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Ready to start your admission journey?
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                  Find a school, submit your application, and take the next
                  step toward your child&apos;s future.
                </p>
              </div>

              <Link
                href="/schools"
                className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#00d2c4] px-6 text-sm font-bold text-[#061842] transition hover:bg-[#20e0d3]"
              >
                Find a School

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}