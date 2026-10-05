"use client";

import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  {
    label: "Features",
    href: "/#features",
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
  },
  {
    label: "Roles",
    href: "/#roles",
  },
  {
    label: "Pricing",
    href: "/#packages",
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </span>

          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none tracking-tight">
              SchoolHub
            </p>

            <p className="mt-1 text-[10px] leading-none text-muted-foreground">
              School Management
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign In
          </Link>

          <Link
            href="/#packages"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
          >
            Register Your School
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label={
            isOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border/60 bg-background md:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Actions */}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign In
              </Link>

              <Link
                href="/#packages"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Register Your School
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
