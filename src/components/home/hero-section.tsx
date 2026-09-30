import { ArrowRight, Check, Play } from "lucide-react";
import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview/dashboard-preview";


const highlights = [
  "Multi-school management",
  "Role-based access",
  "Secure & scalable",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[30%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute bottom-[-150px] left-[-100px] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-24">
        {/* Left Content */}
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>

            <span className="text-xs font-medium text-primary">
              Modern School Management Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Manage your school{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              smarter.
            </span>
            <br />
            All in one place.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Manage students, teachers, attendance, exams, admissions, fees and
            more from one powerful school management platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#packages"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/#how-it-works"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-6 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Play className="h-4 w-4" />
              How It Works
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right Dashboard Preview */}
        <div className="lg:pl-4">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
