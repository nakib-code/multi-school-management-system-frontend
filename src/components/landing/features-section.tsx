import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage student profiles, admissions, enrollments, guardians, and academic information from one place.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    description:
      "Organize teachers, assignments, salaries, and academic responsibilities with an efficient workflow.",
  },
  {
    icon: CheckCircle2,
    title: "Attendance Management",
    description:
      "Track attendance records and monitor student participation with a simple, organized system.",
  },
  {
    icon: BookOpen,
    title: "Exams & Results",
    description:
      "Manage exams, subjects, marks, results, and academic performance from a centralized platform.",
  },
  {
    icon: WalletCards,
    title: "Fees & Payments",
    description:
      "Manage student fees, payment records, online payments, and cash payment workflows securely.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Access useful reports and insights across students, attendance, results, fees, and school operations.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Powerful Features
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your school
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A centralized platform designed to simplify academic,
            administrative, and financial operations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
