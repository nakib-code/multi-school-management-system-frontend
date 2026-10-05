import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const benefits = [
  "Choose a package that fits your school",
  "Manage your school from one platform",
  "Role-based access for your team",
];

export function CtaSection() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.04] px-6 py-12 sm:px-10 lg:px-16 lg:py-14">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            {/* Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/70 px-3 py-1.5">
                <span className="text-xs font-semibold text-primary">
                  Get started today
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to simplify your
                <span className="text-primary"> school management?</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Bring admissions, students, teachers, academics, attendance,
                payments, and everyday school operations together in one
                platform.
              </p>

              {/* Benefits */}
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
              <Link
                href="/#packages"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
              >
                Explore Packages
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/#packages"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Register Your School
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
