import Link from "next/link";
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const footerLinks = {
  Platform: [
    { label: "Find Schools", href: "/schools" },
    { label: "Admission", href: "#admission" },
    { label: "Packages", href: "#pricing" },
    { label: "How It Works", href: "#admission" },
  ],
  School: [
    { label: "Register School", href: "/register-school" },
    { label: "Login", href: "/auth/login" },
    { label: "School Packages", href: "#pricing" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedinIn,
  },
  {
    label: "GitHub",
    href: "#",
    icon: FaGithub,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#061842] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* ================= BRAND ================= */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842] shadow-lg shadow-cyan-500/10 transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">
                  School<span className="text-[#00d2c4]">Hub</span>
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Education Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-6 text-white/55">
              A simple platform for students, guardians, and schools to make
              admission and school management easier.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="h-4 w-4 shrink-0 text-[#00d2c4]" />
                support@schoolhub.com
              </div>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-[#00d2c4]" />
                +880 1XXX-XXXXXX
              </div>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0 text-[#00d2c4]" />
                Dhaka, Bangladesh
              </div>
            </div>
          </div>

          {/* ================= PLATFORM ================= */}
          <div>
            <h3 className="text-sm font-bold">Platform</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.Platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-[#00d2c4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SCHOOL ================= */}
          <div>
            <h3 className="text-sm font-bold">For Schools</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.School.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-[#00d2c4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SUPPORT ================= */}
          <div>
            <h3 className="text-sm font-bold">Support</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.Support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-[#00d2c4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} SchoolHub. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:-translate-y-0.5 hover:border-[#00d2c4] hover:text-[#00d2c4]"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}