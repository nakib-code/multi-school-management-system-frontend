"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
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

      {/* Decorative Dots */}
      <div className="pointer-events-none absolute left-[8%] top-[22%] h-3 w-3 rounded-full bg-[#00d2c4]" />

      <div className="pointer-events-none absolute left-[18%] top-[65%] h-2 w-2 rounded-full bg-yellow-300" />

      <div className="pointer-events-none absolute right-[12%] top-[20%] h-4 w-4 rounded-full bg-pink-400" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        {/* ================= LEFT CONTENT ================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-20 max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#5ff5eb]"
          >
            <Sparkles className="h-4 w-4" />
            Admission Open for 2026–2027
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
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
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/schools"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-yellow-300 px-6 text-sm font-bold text-[#061842] shadow-lg shadow-yellow-300/10 transition hover:bg-yellow-200"
            >
              Apply for Admission

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/schools"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <MapPin className="h-4 w-4 text-[#00d2c4]" />
              Explore Schools
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {[
              "Easy Application",
              "Online Admission",
              "Track Application",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-white/60"
              >
                <CheckCircle2 className="h-4 w-4 text-[#00d2c4]" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ================= RIGHT VISUAL ================= */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          {/* Main Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d2c4]/10 blur-3xl sm:h-[420px] sm:w-[420px]" />

          {/* Student Image */}
          <div className="relative z-10 mx-auto flex min-h-[430px] items-end justify-center sm:min-h-[500px]">
            {/* Image Background */}
            <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-t from-[#00d2c4]/20 to-blue-400/5 sm:h-[380px] sm:w-[380px]" />

            <Image
              src="/student-girl.png"
              alt="Student ready for school admission"
              width={560}
              height={560}
              priority
              className="relative z-10 max-h-[500px] w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:max-h-[560px]"
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
            className="absolute left-0 top-10 z-20 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:top-20 sm:p-4"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842] sm:h-11 sm:w-11">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div>
                <p className="text-[10px] text-white/50 sm:text-xs">
                  Admission
                </p>
                <p className="text-sm font-bold text-white sm:text-base">
                  Open Now
                </p>
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
            className="absolute right-0 top-28 z-20 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:top-40 sm:px-4 sm:py-3"
          >
            <p className="text-[10px] text-white/50 sm:text-xs">
              Application
            </p>

            <p className="text-sm font-bold text-white sm:text-base">
              Apply Online
            </p>
          </motion.div>

          {/* Location Card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 right-0 z-20 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:bottom-24 sm:px-4 sm:py-3"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00d2c4] sm:h-5 sm:w-5" />

              <div>
                <p className="text-[10px] text-white/50 sm:text-xs">
                  Schools
                </p>

                <p className="text-sm font-bold text-white sm:text-base">
                  Near You
                </p>
              </div>
            </div>
          </motion.div>

          {/* Academic Year Badge */}
          <div className="absolute bottom-3 left-2 z-20 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-xl sm:bottom-8 sm:left-5 sm:px-4 sm:py-3">
            <p className="text-[10px] text-white/50 sm:text-xs">
              Academic Year
            </p>

            <p className="text-sm font-bold text-yellow-300 sm:text-base">
              2026–2027
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          className="block h-auto w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
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