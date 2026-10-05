"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#061842] text-white"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#00d2c4]/10 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* Decorative Circles */}
      <div className="pointer-events-none absolute left-[8%] top-[22%] h-3 w-3 rounded-full bg-[#00d2c4]" />
      <div className="pointer-events-none absolute left-[18%] top-[65%] h-2 w-2 rounded-full bg-yellow-300" />
      <div className="pointer-events-none absolute right-[12%] top-[20%] h-4 w-4 rounded-full bg-pink-400" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        {/* ================= LEFT CONTENT ================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#5ff5eb]">
            <Sparkles className="h-4 w-4" />
            Admission Open for 2026–2027
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Find the Right
            <span className="block text-[#00d2c4]">School.</span>
            Start Your
            <span className="block text-yellow-300">Journey.</span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
            Discover schools, check admission availability, and apply online.
            Make your child&apos;s school admission simple, fast, and
            stress-free.
          </p>

          {/* CTA Buttons */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admission"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-yellow-300 px-6 text-sm font-bold text-[#061842] transition hover:bg-yellow-200"
            >
              Apply for Admission
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/schools"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <MapPin className="h-4 w-4 text-[#00d2c4]" />
              Explore Schools
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
              Easy Application
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
              Online Admission
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
              Track Application
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT VISUAL ================= */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          {/* Main Glow */}
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d2c4]/10 blur-3xl" />

          {/* Student Image Container */}
          <div className="relative z-10 mx-auto flex min-h-[500px] items-end justify-center">
            <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-gradient-to-t from-[#00d2c4]/20 to-blue-400/5" />

            <img
              src="/student-girl.png"
              alt="Student ready for school admission"
              className="relative z-10 max-h-[560px] w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
            />
          </div>

          {/* Admission Open Card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-0 top-20 z-20 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842]">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs text-white/50">Admission</p>
                <p className="font-bold text-white">Open Now</p>
              </div>
            </div>
          </motion.div>

          {/* Apply Online Card */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-0 top-40 z-20 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl"
          >
            <p className="text-xs text-white/50">Application</p>
            <p className="font-bold text-white">Apply Online</p>
          </motion.div>

          {/* Location Card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-24 right-0 z-20 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#00d2c4]" />

              <div>
                <p className="text-xs text-white/50">Schools</p>
                <p className="font-bold text-white">Near You</p>
              </div>
            </div>
          </motion.div>

          {/* Small Badge */}
          <div className="absolute bottom-8 left-5 z-20 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <p className="text-xs text-white/50">Academic Year</p>
            <p className="font-bold text-yellow-300">2026–2027</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          className="block h-auto w-full"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            d="M0,80 C180,125 320,30 520,55 C730,82 850,120 1050,75 C1210,40 1320,45 1440,65 L1440,120 L0,120 Z"
          />
        </svg>
      </div>
    </section>
  );
}