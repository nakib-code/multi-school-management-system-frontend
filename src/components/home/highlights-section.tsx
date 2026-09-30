import {
  ArrowUpRight,
  Building2,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";

const highlights = [
  {
    title: "Multi-School",
    description:
      "Manage multiple schools from one centralized platform with clear school-level data separation.",
    icon: Building2,
    stat: "01",
  },
  {
    title: "Role-Based Access",
    description:
      "Give Super Admins, Admins, Teachers, Students, and Managers the right access.",
    icon: ShieldCheck,
    stat: "02",
  },
  {
    title: "Student & Staff",
    description:
      "Organize students, teachers, guardians, classes, sections, and academic records.",
    icon: Users,
    stat: "03",
  },
  {
    title: "Payments & Fees",
    description:
      "Handle admission fees, student payments, salary payments, and financial records.",
    icon: CreditCard,
    stat: "04",
  },
];

export function HighlightsSection() {
  return (
    <section
      id="highlights"
      className="border-y bg-muted/30 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Built for modern education
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your school needs,
            <span className="text-primary"> in one place.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            SchoolHub brings administration, academics, admissions,
            people, and payments together into one simple platform.
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                {/* Background decoration */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

                {/* Top */}
                <div className="relative flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    {item.stat}
                  </span>
                </div>

                {/* Content */}
                <div className="relative mt-6">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Bottom */}
                <div className="relative mt-6 flex items-center text-sm font-medium text-primary">
                  <span>Explore platform</span>

                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}