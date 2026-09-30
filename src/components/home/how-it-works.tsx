import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Choose a Package",
    description:
      "Select the package that matches your school's student capacity and required features.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Register Your School",
    description:
      "Provide your school information and create the administrator account through a simple registration form.",
  },
  {
    number: "03",
    icon: MailCheck,
    title: "Verify Your Email",
    description:
      "Verify the administrator email using the OTP sent to your registered email address.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Get Approved",
    description:
      "Your school registration is reviewed and approved by the platform Super Admin.",
  },
  {
    number: "05",
    icon: Sparkles,
    title: "Start Managing",
    description:
      "Once approved, access your school dashboard and start managing your daily operations.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-b border-border/60 bg-muted/20"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="text-xs font-semibold text-primary">
              Simple onboarding
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Get your school up and running
            <span className="text-primary"> in a few steps.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            From selecting a package to accessing your school dashboard, the
            onboarding process is designed to stay simple and straightforward.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-14">
          {/* Connecting line */}
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-border lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  {/* Step Number */}
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background text-primary shadow-sm">
                    <Icon className="h-5 w-5" />

                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-5 text-center">
                    <h3 className="text-sm font-semibold">{step.title}</h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Mobile / Tablet Arrow */}
                  {index < steps.length - 1 && (
                    <div className="mt-6 flex justify-center lg:hidden">
                      <ArrowRight className="h-4 w-4 rotate-90 text-primary/40 sm:rotate-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust Card */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-primary/15 bg-background p-6 shadow-sm sm:p-7">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Ready to manage your school digitally?
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Choose a package and start your school registration process.
                Your selected package will be linked to your school account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
