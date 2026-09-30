import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  ReceiptText,
  School,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: UsersRound,
    title: "Student Management",
    description:
      "Manage student profiles, admissions, enrollments and academic information from one place.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    description:
      "Organize teacher profiles, assignments, responsibilities and salary information.",
  },
  {
    icon: ClipboardList,
    title: "Admissions",
    description:
      "Handle student applications, admission review, approval and admission fee payments.",
  },
  {
    icon: School,
    title: "Classes & Sections",
    description:
      "Create classes, sections and subjects while keeping your academic structure organized.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    description:
      "Record and monitor student attendance with clear daily and academic records.",
  },
  {
    icon: BookOpenCheck,
    title: "Exams & Results",
    description:
      "Manage examinations, marks and student results with structured academic records.",
  },
  {
    icon: ReceiptText,
    title: "Fees & Payments",
    description:
      "Track student fees, payments and financial records with less manual work.",
  },
  {
    icon: UserRoundCheck,
    title: "Teacher Salaries",
    description:
      "Manage salary records and payment history for your teaching staff.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-16 border-b border-border/60 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="text-xs font-semibold text-primary">
              Powerful features
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your school needs,
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">in one platform.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            From student admissions to attendance, exams, payments and staff
            management — keep your school operations organized from a single
            platform.
          </p>
        </div>

        {/* Featured Feature */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            {/* Content */}
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <UsersRound className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Core management
              </p>

              <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Keep every student record organized
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                Manage student information, admissions, enrollments and
                academic records without jumping between different systems.
                Your school data stays organized and connected.
              </p>

              <Link
                href="/auth/login"
                className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Explore the platform
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Visual */}
            <div className="relative min-h-[300px] overflow-hidden border-t border-border bg-background p-6 lg:border-l lg:border-t-0 sm:p-8">
              <div className="absolute right-[-80px] top-[-80px] h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative rounded-xl border border-border bg-card shadow-xl">
                {/* Mock toolbar */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold">Students</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      1,248 total students
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-medium text-primary">
                    + Add Student
                  </div>
                </div>

                {/* Mock table */}
                <div className="p-4">
                  <div className="grid grid-cols-[1.5fr_1fr_0.7fr] gap-3 border-b border-border pb-2 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Student</span>
                    <span>Class</span>
                    <span>Status</span>
                  </div>

                  {[
                    ["Rahim Ahmed", "Class 8", "Active"],
                    ["Nusrat Jahan", "Class 7", "Active"],
                    ["Sakib Hasan", "Class 9", "Active"],
                    ["Ayesha Khan", "Class 6", "Pending"],
                  ].map(([name, className, status]) => (
                    <div
                      key={name}
                      className="grid grid-cols-[1.5fr_1fr_0.7fr] items-center gap-3 border-b border-border/70 py-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-[9px] font-semibold text-primary">
                            {name.charAt(0)}
                          </span>
                        </div>

                        <span className="truncate text-[10px] font-medium">
                          {name}
                        </span>
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {className}
                      </span>

                      <span
                        className={`text-[9px] font-medium ${
                          status === "Active"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/70 bg-background p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
