import { GraduationCap } from "lucide-react";
import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Roles", href: "/#roles" },
  { label: "Pricing", href: "/#packages" },
];

const accountLinks = [
  { label: "Sign In", href: "/auth/login" },
  { label: "Register School", href: "/#packages" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-semibold"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </span>

              <div>
                <p className="text-sm font-bold leading-none tracking-tight">
                  SchoolHub
                </p>

                <p className="mt-1 text-[10px] leading-none text-muted-foreground">
                  School Management
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A multi-school management platform designed to simplify school
              administration, admissions, academics, payments, and daily
              operations.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold">Platform</h3>

            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold">Account</h3>

            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SchoolHub. All rights reserved.</p>

          <p>Multi-School Management System</p>
        </div>
      </div>
    </footer>
  );
}
