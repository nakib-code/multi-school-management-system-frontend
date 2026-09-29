import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  MailCheck,
  UserCheck,
} from "lucide-react";

const admissionSteps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Application",
    description:
      "Fill out the admission form with student, guardian, and academic information.",
  },
  {
    number: "02",
    icon: MailCheck,
    title: "Verify Email",
    description:
      "Verify the applicant's email address using the verification code sent to their inbox.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Complete Payment",
    description:
      "Pay the admission fee online through SSLCommerz or choose the available cash payment option.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Payment Confirmation",
    description:
      "The payment is confirmed and the admission application moves forward for review.",
  },
  {
    number: "05",
    icon: UserCheck,
    title: "Admission Approval",
    description:
      "A school Admin or Manager reviews the application and approves the admission.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y bg-muted/20"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Admission Process
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            How student admission works
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A transparent admission workflow from application submission to
            final approval.
          </p>
        </div>

        {/* Admission Steps */}
        <div className="mt-14">
          <div className="grid gap-6 md:grid-cols-5">
            {admissionSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  {/* Connector */}
                  {index < admissionSteps.length - 1 && (
                    <div className="absolute left-[calc(50%+28px)] right-[calc(-50%+28px)] top-7 hidden h-px bg-border md:block" />
                  )}

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <span className="mt-4 text-xs font-semibold tracking-widest text-primary">
                      {step.number}
                    </span>

                    <h3 className="mt-2 text-base font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Summary */}
        <div className="mx-auto mt-14 max-w-3xl rounded-xl border bg-background p-5 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <span className="text-sm font-medium">
              Application
            </span>

            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />

            <span className="text-sm font-medium">
              Verification
            </span>

            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />

            <span className="text-sm font-medium">
              Payment
            </span>

            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />

            <span className="text-sm font-medium">
              Review
            </span>

            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />

            <span className="text-sm font-semibold text-primary">
              Approved
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
