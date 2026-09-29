import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export function CtaSection() {
  return (
    <section className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border bg-background px-6 py-14 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to manage your school in one place?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Register your school and bring admissions, students, teachers,
            academics, payments, and daily operations into one platform.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Register Your School
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
