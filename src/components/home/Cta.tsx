"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const trustPoints = [
  "Easy Online Admission",
  "Secure Payments",
  "Application Tracking",
];

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00d2c4]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#061842] px-6 py-12 text-center shadow-2xl sm:px-10 sm:py-16"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00d2c4]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00d2c4] text-[#061842] shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-7 w-7" />
            </div>

            {/* Badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#00d2c4]">
              <Sparkles className="h-4 w-4" />
              Get Started Today
            </div>

            {/* Heading */}
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Make School Admission
              <span className="text-[#00d2c4]"> Easier?</span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Find your school, apply online, and track your admission from
              one simple platform. Schools can also join us and manage their
              operations digitally.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/schools"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#00d2c4] px-7 text-sm font-bold text-[#061842] shadow-lg shadow-cyan-500/20 transition hover:bg-[#00bcaf]"
              >
                Find a School
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register-school"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Register Your School
              </Link>
            </div>

            {/* Trust Points */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
              {trustPoints.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-white/55"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}