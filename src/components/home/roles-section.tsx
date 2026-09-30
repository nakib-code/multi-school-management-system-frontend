import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Users,
  UserRound,
  Building2,
} from "lucide-react";

const roles = [
  {
    icon: ShieldCheck,
    title: "Super Admin",
    description:
      "Manage the entire platform, review school registrations, and control school approval and lifecycle operations.",
  },
  {
    icon: Building2,
    title: "Admin",
    description:
      "Manage your school, students, teachers, settings, admissions, payments, and daily administration.",
  },
  {
    icon: Users,
    title: "Manager",
    description:
      "Handle school operations such as admissions, students, teachers, fees, and other assigned management tasks.",
  },
  {
    icon: UserCheck,
    title: "Teacher",
    description:
      "Access teaching-related features, assignments, attendance, academic activities, and student information.",
  },
  {
    icon: GraduationCap,
    title: "Student",
    description:
      "Access your profile, academic information, enrollment, fees, payments, results, and other student services.",
  },
  {
    icon: UserRound,
    title: "Guardian",
    description:
      "Stay connected with student information and guardian-related services through the school platform.",
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Built for Every Role
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            One platform, different responsibilities
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Everyone gets access to the tools and information they need based
            on their role within the school.
          </p>
        </div>

        {/* Roles */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <div
                key={role.title}
                className="group rounded-2xl border bg-background p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50 transition-colors group-hover:bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {role.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
