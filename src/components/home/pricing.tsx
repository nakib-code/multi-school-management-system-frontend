"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
            Choose a package based on your school&apos;s student capacity. All
            plans include complete school management modules.
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
      </div>
    </section>
  );
}
