import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage student profiles, admissions, enrollments, guardians, and academic information from one place.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    description:
      "Organize teachers, assignments, salaries, and academic responsibilities with ease.",
  },
  {
    icon: CheckCircle2,
    title: "Attendance",
    description:
      "Track student and teacher attendance with a simple and organized workflow.",
  },
  {
    icon: BookOpen,
    title: "Exams & Results",
    description:
      "Manage exams, subjects, marks, results, and academic performance efficiently.",
  },
  {
    icon: WalletCards,
    title: "Fees & Payments",
    description:
      "Handle student fees, online payments, cash payments, and payment records securely.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Get meaningful insights into students, attendance, results, fees, and school operations.",
  },
];

const roles = [
  {
    title: "School Admin",
    description: "Manage your entire institution, users, academics, finances, and settings.",
  },
  {
    title: "Manager",
    description: "Handle daily school operations and manage assigned academic activities.",
  },
  {
    title: "Teacher",
    description: "Manage classes, attendance, subjects, assignments, and student results.",
  },
  {
    title: "Student",
    description: "Access academic information, results, attendance, fees, and school updates.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              EduManage
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-foreground transition hover:text-primary"
            >
              Home
            </Link>

            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              How It Works
            </a>

            <Link
              href="/admissions"
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              Admissions
            </Link>
          </nav>

          <Link
            href="/auth/login"
            className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Built for modern educational institutions
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Manage your school{" "}
              <span className="text-primary">smarter.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              A complete school management platform for administrators,
              teachers, students, and guardians. Manage academics, attendance,
              admissions, fees, results, and more from one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admissions"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Apply for Admission
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium transition hover:bg-muted"
              >
                School Login
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Multi-school support
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Role-based access
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Secure platform
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-2xl border bg-card p-3 shadow-2xl">
              <div className="overflow-hidden rounded-xl border bg-background">
                <div className="flex h-12 items-center justify-between border-b px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  </div>

                  <div className="h-2.5 w-24 rounded-full bg-muted" />
                </div>

                <div className="grid min-h-[360px] grid-cols-[90px_1fr]">
                  <div className="border-r bg-muted/30 p-3">
                    <div className="mb-5 h-7 rounded-md bg-primary/15" />

                    <div className="space-y-3">
                      <div className="h-2.5 rounded-full bg-muted" />
                      <div className="h-2.5 rounded-full bg-muted" />
                      <div className="h-2.5 rounded-full bg-primary/20" />
                      <div className="h-2.5 rounded-full bg-muted" />
                      <div className="h-2.5 rounded-full bg-muted" />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 w-28 rounded bg-foreground/10" />
                        <div className="mt-2 h-2.5 w-40 rounded bg-muted" />
                      </div>

                      <div className="h-8 w-20 rounded-md bg-primary/10" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {["Students", "Teachers", "Attendance", "Revenue"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className="rounded-lg border p-3"
                          >
                            <div className="text-[10px] text-muted-foreground">
                              {item}
                            </div>
                            <div className="mt-2 text-lg font-semibold">
                              {["1,248", "86", "94%", "৳84K"][index]}
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="h-32 rounded-lg border p-4">
                        <div className="h-2.5 w-20 rounded bg-muted" />

                        <div className="mt-5 flex h-16 items-end gap-2">
                          {[40, 65, 48, 80, 58, 92, 72].map((height) => (
                            <div
                              key={height}
                              style={{ height: `${height}%` }}
                              className="w-full rounded-t bg-primary/30"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="h-32 rounded-lg border p-4">
                        <div className="h-2.5 w-24 rounded bg-muted" />

                        <div className="mt-5 space-y-3">
                          <div className="h-2 rounded-full bg-muted" />
                          <div className="h-2 w-4/5 rounded-full bg-muted" />
                          <div className="h-2 w-3/5 rounded-full bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border bg-background p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-semibold">94% Attendance</p>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["Multi", "School Support"],
            ["6+", "User Roles"],
            ["24/7", "Access"],
            ["100%", "Centralized"],
          ].map(([value, label]) => (
            <div key={label} className="px-4 py-8 text-center sm:py-10">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">FEATURES</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your school needs
            </h2>

            <p className="mt-4 text-muted-foreground">
              Bring your school&apos;s daily operations into one organized,
              easy-to-use platform.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-semibold">{feature.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">HOW IT WORKS</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Get your school started
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Register your school",
                description:
                  "Submit your school information and administrator details through the registration process.",
              },
              {
                number: "02",
                title: "Get approved",
                description:
                  "After verification and approval, your school administrator can access the platform.",
              },
              {
                number: "03",
                title: "Manage everything",
                description:
                  "Invite your team and manage students, teachers, academics, payments, and reports.",
              },
            ].map((step) => (
              <div key={step.number} className="relative">
                <span className="text-5xl font-bold text-primary/15">
                  {step.number}
                </span>

                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-primary">
                ONE PLATFORM
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for everyone in your school
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                Different users get the tools they need while your school
                keeps everything connected in one secure system.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roles.map((role) => (
                <div key={role.title} className="rounded-xl border p-5">
                  <h3 className="font-semibold">{role.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to simplify school management?
            </h2>

            <p className="mt-4 text-sm leading-6 opacity-85 sm:text-base">
              Bring your school&apos;s people, academics, admissions, and
              operations together in one platform.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-background px-5 text-sm font-medium text-foreground transition hover:bg-background/90"
              >
                Get Started
              </Link>

              <Link
                href="/admissions"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-foreground/30 px-5 text-sm font-medium transition hover:bg-primary-foreground/10"
              >
                View Admissions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>

            <span className="font-semibold">EduManage</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EduManage. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
