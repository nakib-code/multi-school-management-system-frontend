import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PublicPackageList } from "./packages/public-package-list";


export function PricingSection() {
  return (
    <section
      id="packages"
      className="scroll-mt-16 border-b border-border/60 bg-muted/20"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="text-xs font-semibold text-primary">
              Simple pricing
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose the package that fits
            <span className="text-primary"> your school.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Choose a package based on your school's student capacity and
            required features. You can always explore a custom package if you
            need something more specific.
          </p>
        </div>

        {/* Packages */}
        <div className="mt-12">
          <PublicPackageList />
        </div>

        {/* Custom Package CTA */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-background">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Need something different?
              </p>

              <h3 className="mt-2 text-xl font-bold tracking-tight">
                Need a custom package for your school?
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tell us your student capacity and required features. We can
                create a package that matches your school's needs.
              </p>
            </div>

            <Link
              href="/auth/register-school"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
