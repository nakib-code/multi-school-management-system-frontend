import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

const highlights = [
  "Multi-Role Dashboards (Admin, Manager, Teacher, Guardian, Student)",
  "Dedicated Hefz & Najera Daily Sobok / Manzil Tracking",
  "Manual bKash, Nagad & Rocket Fee & Subscription Verification",
  "Automated Attendance, Exams, GPA Results & Teacher Payroll",
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#061842] pt-32 pb-20 text-white sm:pt-36 sm:pb-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,210,196,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#00d2c4]">
              <Building2 className="h-3.5 w-3.5" />
              Cloud SaaS for Madrasas &amp; Islamic Schools
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Modern Digital Management for{" "}
              <span className="text-[#00d2c4]">Madrasas &amp; Schools</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Manage your entire institution from one unified platform—students,
              teachers, classes, Hefz &amp; Najera daily logs, attendance,
              exams, GPA results, student fees, and payroll with role-based
              security.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/school-register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#00d2c4] px-7 text-sm font-bold text-[#061842] shadow-lg shadow-cyan-500/20 transition hover:bg-[#00bcaf]"
              >
                Register Your Institution
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign In to Dashboard
              </Link>
            </div>

            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-white/80"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00d2c4]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#00d2c4]">
                    All-in-One Control Center
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Built for Multi-Tenant Institutions
                  </h2>
                </div>
                <ShieldCheck className="h-7 w-7 text-[#00d2c4]" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Users className="h-5 w-5 text-[#00d2c4]" />
                  <p className="mt-3 text-2xl font-bold text-white">6 Roles</p>
                  <p className="mt-1 text-xs text-white/65">
                    Super Admin, Admin, Manager, Teacher, Guardian &amp; Student
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <BookOpenCheck className="h-5 w-5 text-[#00d2c4]" />
                  <p className="mt-3 text-2xl font-bold text-white">
                    Hefz &amp; Najera
                  </p>
                  <p className="mt-1 text-xs text-white/65">
                    Daily Sobok, Sobok-e-Am, Manzil &amp; Ustad notes
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#00d2c4]/20 bg-[#00d2c4]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#00d2c4]">
                  Fast Institution Onboarding
                </p>
                <p className="mt-1 text-sm text-white/85">
                  Register your Madrasa or School in minutes, verify your admin
                  email, select a subscription plan, and start managing
                  academics immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
