import {
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  FileText,
  GraduationCap,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

const modules = [
  {
    icon: BookOpenCheck,
    title: "Hefz & Najera Tracking",
    description:
      "Enroll students under Ustads, record daily Sobok, Sobok-e-Am, Manzil, and share live progress with Guardians.",
  },
  {
    icon: GraduationCap,
    title: "Students & Enrollments",
    description:
      "Manage admissions, student profiles, academic year enrollments, roll numbers, and class/section capacities.",
  },
  {
    icon: BookOpen,
    title: "Classes, Sections & Subjects",
    description:
      "Configure classes, sections, full/pass marks for subjects, and teacher-subject assignments per academic year.",
  },
  {
    icon: CalendarCheck,
    title: "Daily & Bulk Attendance",
    description:
      "Mark single or full-class attendance in seconds with Present, Absent, Late, and Excused statuses.",
  },
  {
    icon: Award,
    title: "Exams & Automated GPA Results",
    description:
      "Schedule Class Tests, Half-Yearly, and Annual exams with automatic BD 5.0 GPA grade calculation.",
  },
  {
    icon: CreditCard,
    title: "Student Fees & Mobile Banking",
    description:
      "Issue monthly, exam, and admission fees with manual bKash, Nagad, and Rocket trxId verification.",
  },
  {
    icon: Wallet,
    title: "Teacher Payroll & Salaries",
    description:
      "Generate monthly teacher salary sheets with basic salary, bonuses, deductions, and payment tracking.",
  },
  {
    icon: Users,
    title: "Guardians & Staff Roles",
    description:
      "Dedicated portals for Admins, Managers, Teachers, Guardians, and Students with strict permission isolation.",
  },
  {
    icon: ShieldCheck,
    title: "Package Feature Gating & Audit Logs",
    description:
      "Subscription-controlled modules, student limit enforcement, and school-level operational audit trails.",
  },
];

export default function SystemModules() {
  return (
    <section id="modules" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Complete System Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything Your Madrasa Needs in One Platform
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every module is purpose-built for Islamic and general educational
            institutions, backed by multi-tenant isolation and role-based
            permissions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="rounded-2xl border bg-card p-6 shadow-xs transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{mod.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
