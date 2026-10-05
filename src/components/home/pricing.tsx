"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { PublicPackageList } from "./packages/public-package-list";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-24 sm:py-28"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#00d2c4]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#061842]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#00d2c4]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#008f87]">
            <Sparkles className="h-4 w-4" />
            School Packages
          </span>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-[#061842] sm:text-4xl lg:text-5xl">
            Choose the package that fits
            <span className="text-[#00b8ad]"> your school.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Choose a package based on your school&apos;s student capacity and
            required features. You can always explore a custom package if you
            need something more specific.
          </p>
        </motion.div>

        {/* ================= REAL PACKAGES ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12"
        >
          <PublicPackageList />
        </motion.div>

        {/* ================= CUSTOM PACKAGE CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 overflow-hidden rounded-3xl bg-[#061842] shadow-xl"
        >
          <div className="relative flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#00d2c4]/10 blur-3xl" />

            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#00d2c4]">
                Need Something Different?
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Need a custom package for your school?
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                Tell us your student capacity and required features. We can
                create a package that matches your school&apos;s needs.
              </p>
            </div>

            <Link
              href="/register-school"
              className="group relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#00d2c4] px-6 text-sm font-bold text-[#061842] shadow-lg shadow-cyan-500/20 transition hover:bg-[#00bcaf]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}