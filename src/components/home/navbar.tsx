"use client";

import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Admission", href: "#admission" },
  { label: "Schools", href: "#schools" },
  { label: "Packages", href: "#pricing" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061842]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842] shadow-lg shadow-cyan-500/20 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              School<span className="text-[#00d2c4]">Hub</span>
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
              Education Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative py-2 text-sm font-medium text-white/70 transition-colors hover:text-[#00d2c4]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            href="/register-school"
            className="rounded-full bg-[#00d2c4] px-6 py-2.5 text-sm font-bold text-[#061842] shadow-lg shadow-cyan-500/20 transition hover:bg-[#00bcaf]"
          >
            Register School
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 md:hidden"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#061842] md:hidden">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-[#00d2c4]"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                href="/register-school"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-full bg-[#00d2c4] text-sm font-bold text-[#061842] transition hover:bg-[#00bcaf]"
              >
                Register School
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}