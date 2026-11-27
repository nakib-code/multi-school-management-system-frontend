import { GraduationCap, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Find Institutions", href: "/schools" },
    { label: "Track Admission", href: "/admissions/track" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Packages & Pricing", href: "/#pricing" },
  ],
  School: [
    { label: "Register Institution", href: "/auth/school-register" },
    { label: "Portal Login", href: "/auth/login" },
    { label: "Reset Password", href: "/auth/forgot-password" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#061842] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* ================= BRAND ================= */}
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842] shadow-lg shadow-cyan-500/10 transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">
                  Madrasa<span className="text-[#00d2c4]">OS</span>
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Education Management Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-6 text-white/55">
              Modern multi-tenant management for madrasas and schools —
              attendance, Hefz tracking, admissions, fees, payroll, and guardian
              updates in one place.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:support@madrasaos.com"
                className="flex items-center gap-3 text-sm text-white/60 transition hover:text-[#00d2c4]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#00d2c4]" />
                support@madrasaos.com
              </a>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0 text-[#00d2c4]" />
                Dhaka, Bangladesh
              </div>
            </div>
          </div>

          {/* ================= PLATFORM ================= */}
          <div>
            <h3 className="text-sm font-bold">Platform</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.Platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-[#00d2c4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SCHOOL ================= */}
          <div>
            <h3 className="text-sm font-bold">For Institutions</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.School.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-[#00d2c4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} MadrasaOS. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built for Madrasas &amp; Islamic Schools
          </p>
        </div>
      </div>
    </footer>
  );
}
