import {
  Building2,
  CheckCircle2,
  CreditCard,
  MailCheck,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Building2,
    title: "Register Your Institution",
    description:
      "Submit your Madrasa or School details along with your primary administrator account.",
  },
  {
    step: "02",
    icon: MailCheck,
    title: "Verify Admin Email",
    description:
      "Confirm your 6-digit email verification code sent directly to the institution administrator.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Platform Approval",
    description:
      "Our platform team verifies and activates your institution workspace.",
  },
  {
    step: "04",
    icon: CreditCard,
    title: "Choose a Plan & Go Live",
    description:
      "Select a subscription package, submit bKash/Nagad/Rocket payment, and launch all dashboards.",
  },
];

export default function HowOnboardingWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y bg-muted/30 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Institution Onboarding
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Get Your Institution Online in 4 Simple Steps
          </h2>
          <p className="mt-4 text-muted-foreground">
            Designed exclusively for institution administrators—no technical
            setup required.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border bg-background p-6 shadow-xs"
              >
                <span className="text-xs font-bold tracking-widest text-primary">
                  STEP {item.step}
                </span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
