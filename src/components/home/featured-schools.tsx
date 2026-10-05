"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  School,
  Users,
} from "lucide-react";

const schools = [
  {
    id: 1,
    name: "Sunrise International School",
    location: "Dhaka, Bangladesh",
    students: "1,200+ Students",
    image: "/schools/sunrise-school.jpg",
  },
  {
    id: 2,
    name: "Green Valley School",
    location: "Chattogram, Bangladesh",
    students: "850+ Students",
    image: "/schools/green-valley-school.jpg",
  },
  {
    id: 3,
    name: "Bright Future Academy",
    location: "Dhaka, Bangladesh",
    students: "950+ Students",
    image: "/schools/bright-future-school.jpg",
  },
];

export default function FeaturedSchools() {
  return (
    <section
      id="schools"
      className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#00d2c4]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/20 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#008f87]">
            <School className="h-4 w-4" />
            Find Your School
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#061842] sm:text-4xl lg:text-5xl">
            Discover Schools
            <span className="block text-[#00a99d]">
              Accepting Admissions
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Explore schools, compare your options, and find the right place
            for your child&apos;s education.
          </p>
        </motion.div>

        {/* ================= SCHOOL CARDS ================= */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school, index) => (
            <motion.article
              key={school.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00d2c4]/30 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={school.image}
                  alt={school.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061842]/60 via-transparent to-transparent" />

                {/* Admission Badge */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Admission Open
                </div>

                {/* Academic Year */}
                <div className="absolute bottom-4 left-4 rounded-lg bg-[#061842]/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  2026–2027
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#061842] transition-colors group-hover:text-[#009e94]">
                  {school.name}
                </h3>

                <div className="mt-4 space-y-2.5">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-[#00a99d]" />
                    <span>{school.location}</span>
                  </div>

                  {/* Students */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4 shrink-0 text-[#00a99d]" />
                    <span>{school.students}</span>
                  </div>

                  {/* Academic Year */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#00a99d]" />
                    <span>Academic Year 2026–2027</span>
                  </div>
                </div>

                {/* View Button */}
                <Link
                  href={`/schools/${school.id}`}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#061842] text-sm font-bold text-white transition hover:bg-[#0b285f]"
                >
                  View School
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 overflow-hidden rounded-3xl bg-[#061842] px-6 py-8 sm:px-10"
        >
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-semibold text-[#00d2c4]">
                Can&apos;t find your school?
              </p>

              <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Explore all available schools
              </h3>

              <p className="mt-2 text-sm text-white/50">
                Find schools by location, admission status, and more.
              </p>
            </div>

            <Link
              href="/schools"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#00d2c4] px-6 text-sm font-bold text-[#061842] transition hover:bg-[#20e0d3]"
            >
              Explore All Schools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}