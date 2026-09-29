import Link from "next/link";
import { GraduationCap } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Admission Process", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
];

const accountLinks = [
  { label: "Sign In", href: "/auth/login" },
  { label: "Register School", href: "/auth/register" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>

              <span>SchoolHub</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A multi-school management platform designed to simplify school
              administration, admissions, academics, payments, and daily
              operations.
            </p>
          </div>

          {/* Product */}
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
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SchoolHub. All rights reserved.
          </p>

          <p>
            Multi-School Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
