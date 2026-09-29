import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Users,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
        {/* Content */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Built for modern educational institutions
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Manage your school <span className="text-primary">smarter.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            A complete school management platform for administrators, teachers,
            students, and guardians. Manage academics, attendance, admissions,
            fees, results, and more from one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/admissions">
                Apply for Admission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">School Login</Link>
            </Button>
          </div>

          {/* Highlights */}
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
              {/* Browser header */}
              <div className="flex h-12 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                </div>

                <div className="h-2.5 w-24 rounded-full bg-muted" />
              </div>

              <div className="grid min-h-[360px] grid-cols-[90px_1fr]">
                {/* Sidebar preview */}
                <div className="border-r bg-muted/30 p-3">
                  <div className="mb-5 flex h-7 items-center justify-center rounded-md bg-primary/10">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-2.5 rounded-full bg-primary/20" />
                    <div className="h-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Main dashboard preview */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-28 rounded bg-foreground/10" />
                      <div className="mt-2 h-2.5 w-40 rounded bg-muted" />
                    </div>

                    <div className="h-8 w-20 rounded-md bg-primary/10" />
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "Students",
                        value: "1,248",
                        icon: Users,
                      },
                      {
                        label: "Teachers",
                        value: "86",
                        icon: GraduationCap,
                      },
                      {
                        label: "Attendance",
                        value: "94%",
                        icon: CheckCircle2,
                      },
                      {
                        label: "Revenue",
                        value: "৳84K",
                        icon: WalletCards,
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div key={stat.label} className="rounded-lg border p-3">
                          <Icon className="h-3.5 w-3.5 text-primary" />

                          <div className="mt-2 text-[10px] text-muted-foreground">
                            {stat.label}
                          </div>

                          <div className="mt-1 text-lg font-semibold">
                            {stat.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Charts */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                        <div className="h-2.5 w-20 rounded bg-muted" />
                      </div>

                      <div className="mt-5 flex h-20 items-end gap-2">
                        {[40, 65, 48, 80, 58, 92, 72].map((height) => (
                          <div
                            key={height}
                            style={{ height: `${height}%` }}
                            className="w-full rounded-t bg-primary/30"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="h-2.5 w-24 rounded bg-muted" />

                      <div className="mt-5 space-y-3">
                        <div className="h-2 rounded-full bg-muted" />
                        <div className="h-2 w-4/5 rounded-full bg-muted" />
                        <div className="h-2 w-3/5 rounded-full bg-muted" />

                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-5 w-5 rounded-full bg-primary/15" />
                          <div className="h-2 w-16 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border bg-background p-4 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm font-semibold">94% Attendance</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
