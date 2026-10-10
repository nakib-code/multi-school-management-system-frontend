"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Loader2,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Controller,
  type FieldPath,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createAdmission,
  verifyStudentEmail,
} from "@/features/admissions/api";
import { admissionSchema } from "@/features/admissions/schema";
import type { AdmissionFormValues } from "@/features/admissions/schema";
import type { CreateAdmissionInput } from "@/features/admissions/types";
import { usePublicActiveClasses } from "@/features/public/classes/hook";

interface AdmissionFormProps {
  schoolId: number;
}

type PaymentMethod = "CASH" | "ONLINE";

interface SubmittedApplication {
  applicationNo: string;
  studentEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING";
  emailVerificationRequired: boolean;
}

interface PendingAdmission {
  id: number;
  applicationNo: string;
  studentEmail: string;
  paymentMethod: PaymentMethod;
  emailVerified: boolean;
}

const steps = [
  {
    id: 1,
    title: "Student",
    description: "Student information",
    icon: User,
  },
  {
    id: 2,
    title: "Academic",
    description: "Academic information",
    icon: FileText,
  },
  {
    id: 3,
    title: "Guardian",
    description: "Guardian information",
    icon: Users,
  },
  {
    id: 4,
    title: "Review",
    description: "Review & payment",
    icon: CreditCard,
  },
];

export default function AdmissionForm({
  schoolId,
}: AdmissionFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submittedApplication, setSubmittedApplication] =
    useState<SubmittedApplication | null>(null);
  const [pendingAdmission, setPendingAdmission] =
    useState<PendingAdmission | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    control,
    trigger,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof admissionSchema>,
    unknown,
    AdmissionFormValues
  >({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      academicYear: "2026-2027",
      paymentMethod: "ONLINE",
    },
    mode: "onTouched",
  });

  const values = watch();

  // PUBLIC CLASSES
  const {
    data: classes = [],
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = usePublicActiveClasses(schoolId);

  const selectedClassId = watch("classId") as
    | number
    | undefined;

  const selectedClass = classes.find(
    (item) => item.id === selectedClassId,
  );

  // NAVIGATE TO THE SEPARATE PAYMENT PAGE
  const startOnlinePayment = (admissionId: number) => {
    if (
      !Number.isInteger(schoolId) ||
      schoolId <= 0 ||
      !Number.isInteger(admissionId) ||
      admissionId <= 0
    ) {
      toast.error("Invalid school or admission information.");
      return;
    }

    router.push(
      `/admissions/payment?schoolId=${schoolId}&admissionId=${admissionId}`,
    );
  };

  // SUBMIT ADMISSION
  const onSubmit = async (data: AdmissionFormValues) => {
    try {
      if (!Number.isInteger(schoolId) || schoolId <= 0) {
        toast.error("Invalid school information.");
        return;
      }

      const input: CreateAdmissionInput = {
        schoolId,
        ...data,
      };

      const result = await createAdmission(input);

      // Show OTP verification before continuing when required.
      if (result.emailVerificationRequired) {
        setPendingAdmission({
          id: result.id,
          applicationNo: result.applicationNo,
          studentEmail: result.studentEmail,
          paymentMethod: result.paymentMethod,
          emailVerified: false,
        });

        setVerificationCode("");

        toast.success(
          "Application created. Check your email for the OTP.",
        );

        return;
      }

      // If verification is not required by the API, continue
      // to the separate payment page for online applications.
      if (result.paymentMethod === "ONLINE") {
        startOnlinePayment(result.id);
        return;
      }

      // Preserve the existing cash-payment flow.
      setSubmittedApplication({
        applicationNo: result.applicationNo,
        studentEmail: result.studentEmail,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        emailVerificationRequired: false,
      });

      toast.success("Admission application submitted!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit admission application.",
      );
    }
  };

  // VERIFY EMAIL OTP
  const handleVerifyEmail = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!pendingAdmission || pendingAdmission.emailVerified) {
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyStudentEmail(
        pendingAdmission.studentEmail,
        verificationCode,
      );

      if (
        !result.emailVerified ||
        result.admissionId !== pendingAdmission.id
      ) {
        throw new Error("Email verification failed.");
      }

      const verifiedAdmission: PendingAdmission = {
        ...pendingAdmission,
        emailVerified: true,
      };

      setPendingAdmission(verifiedAdmission);
      setVerificationCode("");

      toast.success("Email verified successfully!");

      // Online payment: navigate only.
      // The payment page will initiate the payment gateway request.
      if (verifiedAdmission.paymentMethod === "ONLINE") {
        startOnlinePayment(verifiedAdmission.id);
        return;
      }

      // Cash payment: show confirmation after OTP verification.
      setSubmittedApplication({
        applicationNo: verifiedAdmission.applicationNo,
        studentEmail: verifiedAdmission.studentEmail,
        paymentMethod: "CASH",
        paymentStatus: "PENDING",
        emailVerificationRequired: false,
      });

      setPendingAdmission(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify email.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // NEXT STEP
  const nextStep = async () => {
    let fields: FieldPath<
      z.input<typeof admissionSchema>
    >[] = [];

    if (step === 1) {
      fields = [
        "studentName",
        "studentEmail",
        "password",
      ];
    }

    if (step === 2) {
      fields = ["academicYear", "classId"];
    }

    if (step === 3) {
      fields = [
        "guardianName",
        "guardianEmail",
        "guardianPhone",
        "guardianRelationship",
        "guardianNid",
        "guardianOccupation",
        "address",
      ];
    }

    const valid = await trigger(fields);

    if (!valid) return;

    setStep((current) => Math.min(current + 1, 4));
  };

  // PREVIOUS STEP
  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  // EMAIL VERIFICATION SCREEN
  if (pendingAdmission) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          {pendingAdmission.emailVerified
            ? "Continue Your Application"
            : "Verify Your Email"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {pendingAdmission.emailVerified
            ? "Your application is ready. Continue to the next step."
            : "We sent a 6-digit verification code to "}

          {!pendingAdmission.emailVerified && (
            <span className="font-medium text-foreground">
              {pendingAdmission.studentEmail}
            </span>
          )}

          {!pendingAdmission.emailVerified &&
            ". Enter the code to continue."}
        </p>

        <div className="mt-5 rounded-xl border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Application Number
          </p>
          <p className="mt-1 font-semibold">
            {pendingAdmission.applicationNo}
          </p>
        </div>

        {pendingAdmission.emailVerified ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-green-600">
              {pendingAdmission.paymentMethod === "ONLINE"
                ? "Your email is verified. Continue to online payment."
                : "Your email has been verified."}
            </p>

            {pendingAdmission.paymentMethod === "ONLINE" ? (
              <button
                type="button"
                onClick={() =>
                  startOnlinePayment(pendingAdmission.id)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                <CreditCard className="h-4 w-4" />
                Continue to Payment
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSubmittedApplication({
                    applicationNo:
                      pendingAdmission.applicationNo,
                    studentEmail:
                      pendingAdmission.studentEmail,
                    paymentMethod: "CASH",
                    paymentStatus: "PENDING",
                    emailVerificationRequired: false,
                  });

                  setPendingAdmission(null);
                }}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                Continue
              </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleVerifyEmail}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="verificationCode"
                className="mb-2 block text-sm font-medium"
              >
                Verification Code
              </label>

              <input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  )
                }
                placeholder="Enter 6-digit OTP"
                className="h-12 w-full rounded-lg border bg-background px-3 text-center text-lg tracking-[0.4em] outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={
                isVerifying || verificationCode.length !== 6
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Check your inbox and spam folder for the code.
            </p>
          </form>
        )}
      </div>
    );
  }

  // SUCCESS SCREEN
  if (submittedApplication) {
    return (
      <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            Application Submitted
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your admission application has been submitted successfully.
          </p>

          <div className="mt-6 w-full rounded-xl border bg-muted/30 p-5 text-left">
            <div className="space-y-4">
              <ReviewItem
                label="Application Number"
                value={submittedApplication.applicationNo}
              />

              <ReviewItem
                label="Student Email"
                value={submittedApplication.studentEmail}
              />

              <ReviewItem
                label="Payment Method"
                value={
                  submittedApplication.paymentMethod === "ONLINE"
                    ? "Online Payment"
                    : "Cash Payment"
                }
              />

              <ReviewItem
                label="Payment Status"
                value={submittedApplication.paymentStatus}
              />
            </div>
          </div>

          {submittedApplication.emailVerificationRequired && (
            <div className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm font-medium">
                Email verification required
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please check your email and verify your address.
              </p>
            </div>
          )}

          {submittedApplication.paymentMethod === "CASH" && (
            <div className="mt-5 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-left dark:border-yellow-900 dark:bg-yellow-950/30">
              <p className="text-sm font-medium">
                Cash payment
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please contact the school and complete your
                admission payment in cash.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ADMISSION FORM
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* STEPS */}
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-[650px] max-w-4xl items-start justify-between">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = step === item.id;
            const isCompleted = step > item.id;

            return (
              <div
                key={item.id}
                className="flex flex-1 items-start"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 text-muted-foreground",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <p
                      className={[
                        "text-sm font-medium",
                        isActive || isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={[
                      "mt-5 h-px flex-1",
                      step > item.id
                        ? "bg-primary"
                        : "bg-border",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1 — STUDENT */}
      {step === 1 && (
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Student Information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the student's basic information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="studentName"
                className="mb-2 block text-sm font-medium"
              >
                Student Name *
              </label>
              <input
                id="studentName"
                {...register("studentName")}
                placeholder="Enter student name"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {errors.studentName && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.studentName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="studentEmail"
                className="mb-2 block text-sm font-medium"
              >
                Student Email *
              </label>
              <input
                id="studentEmail"
                type="email"
                {...register("studentEmail")}
                placeholder="student@example.com"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.studentEmail && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.studentEmail.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password *
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Minimum 8 characters"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-sm font-medium"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium"
              >
                Gender
              </label>
              <select
                id="gender"
                {...register("gender")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="bloodGroup"
                className="mb-2 block text-sm font-medium"
              >
                Blood Group
              </label>
              <select
                id="bloodGroup"
                {...register("bloodGroup")}
                className="h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="previousSchool"
                className="mb-2 block text-sm font-medium"
              >
                Previous School
              </label>
              <input
                id="previousSchool"
                {...register("previousSchool")}
                placeholder="Previous school name"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="previousClass"
                className="mb-2 block text-sm font-medium"
              >
                Previous Class
              </label>
              <input
                id="previousClass"
                {...register("previousClass")}
                placeholder="Previous class"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>
      )}

      {/* STEP 2 — ACADEMIC */}
      {step === 2 && (
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Academic Information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select the academic year and class.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="academicYear"
                className="mb-2 block text-sm font-medium"
              >
                Academic Year *
              </label>
              <input
                id="academicYear"
                {...register("academicYear")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.academicYear && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.academicYear.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="classId"
                className="mb-2 block text-sm font-medium"
              >
                Class *
              </label>

              <Controller
                name="classId"
                control={control}
                render={({ field }) => (
                  <select
                    id="classId"
                    value={
                      field.value ? String(field.value) : ""
                    }
                    disabled={isClassesLoading}
                    onChange={(event) => {
                      const classId = event.target.value
                        ? Number(event.target.value)
                        : undefined;

                      field.onChange(classId);
                    }}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {isClassesLoading
                        ? "Loading classes..."
                        : isClassesError
                          ? "Failed to load classes"
                          : classes.length === 0
                            ? "No classes available"
                            : "Select class"}
                    </option>

                    {classes.map((schoolClass) => (
                      <option
                        key={schoolClass.id}
                        value={schoolClass.id}
                      >
                        {schoolClass.name} ({schoolClass.code})
                      </option>
                    ))}
                  </select>
                )}
              />

              {errors.classId && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.classId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shift"
                className="mb-2 block text-sm font-medium"
              >
                Shift
              </label>
              <select
                id="shift"
                {...register("shift")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select shift</option>
                <option value="MORNING">Morning</option>
                <option value="DAY">Day</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="group"
                className="mb-2 block text-sm font-medium"
              >
                Group
              </label>
              <select
                id="group"
                {...register("group")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select group</option>
                <option value="SCIENCE">Science</option>
                <option value="COMMERCE">Commerce</option>
                <option value="ARTS">Arts</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3 — GUARDIAN */}
      {step === 3 && (
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Guardian Information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the student's guardian information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="guardianName"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Name
              </label>
              <input
                id="guardianName"
                {...register("guardianName")}
                placeholder="Guardian name"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="guardianEmail"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Email
              </label>
              <input
                id="guardianEmail"
                type="email"
                {...register("guardianEmail")}
                placeholder="guardian@example.com"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.guardianEmail && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.guardianEmail.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="guardianPhone"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Phone
              </label>
              <input
                id="guardianPhone"
                {...register("guardianPhone")}
                placeholder="01XXXXXXXXX"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="guardianRelationship"
                className="mb-2 block text-sm font-medium"
              >
                Relationship
              </label>
              <select
                id="guardianRelationship"
                {...register("guardianRelationship")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select relationship</option>
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="BROTHER">Brother</option>
                <option value="SISTER">Sister</option>
                <option value="GUARDIAN">Guardian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="guardianNid"
                className="mb-2 block text-sm font-medium"
              >
                Guardian NID
              </label>
              <input
                id="guardianNid"
                {...register("guardianNid")}
                placeholder="National ID number"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="guardianOccupation"
                className="mb-2 block text-sm font-medium"
              >
                Occupation
              </label>
              <input
                id="guardianOccupation"
                {...register("guardianOccupation")}
                placeholder="Guardian occupation"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium"
              >
                Address
              </label>
              <textarea
                id="address"
                {...register("address")}
                placeholder="Enter full address"
                rows={4}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {errors.address && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* STEP 4 — REVIEW */}
      {step === 4 && (
        <section className="space-y-6">
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Student Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review student details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Student Name"
                value={values.studentName}
              />
              <ReviewItem
                label="Student Email"
                value={values.studentEmail}
              />
              <ReviewItem
                label="Date of Birth"
                value={values.dateOfBirth}
              />
              <ReviewItem
                label="Gender"
                value={values.gender}
              />
              <ReviewItem
                label="Blood Group"
                value={values.bloodGroup}
              />
              <ReviewItem
                label="Previous School"
                value={values.previousSchool}
              />
              <ReviewItem
                label="Previous Class"
                value={values.previousClass}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Academic Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review academic details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Academic Year"
                value={values.academicYear}
              />
              <ReviewItem
                label="Class"
                value={
                  selectedClass
                    ? `${selectedClass.name} (${selectedClass.code})`
                    : undefined
                }
              />
              <ReviewItem
                label="Shift"
                value={values.shift}
              />
              <ReviewItem
                label="Group"
                value={values.group}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Guardian Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review guardian details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Guardian Name"
                value={values.guardianName}
              />
              <ReviewItem
                label="Guardian Email"
                value={values.guardianEmail}
              />
              <ReviewItem
                label="Guardian Phone"
                value={values.guardianPhone}
              />
              <ReviewItem
                label="Relationship"
                value={values.guardianRelationship}
              />
              <ReviewItem
                label="Guardian NID"
                value={values.guardianNid}
              />
              <ReviewItem
                label="Occupation"
                value={values.guardianOccupation}
              />
              <ReviewItem
                label="Address"
                value={values.address}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Payment Method
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose how you want to pay.
                </p>
              </div>
            </div>

            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label
                    className={[
                      "cursor-pointer rounded-xl border p-4 transition",
                      field.value === "ONLINE"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      value="ONLINE"
                      checked={field.value === "ONLINE"}
                      onChange={() => field.onChange("ONLINE")}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Online Payment
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Verify your email first, then pay through
                          the secure payment gateway.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={[
                      "cursor-pointer rounded-xl border p-4 transition",
                      field.value === "CASH"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      value="CASH"
                      checked={field.value === "CASH"}
                      onChange={() => field.onChange("CASH")}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Cash Payment
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pay the admission fee directly at the school.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            />

            {errors.paymentMethod && (
              <p className="mt-2 text-xs text-destructive">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>
        </section>
      )}

      {/* NAVIGATION */}
      <div className="flex items-center justify-between border-t pt-6">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 1 || isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {values.paymentMethod === "ONLINE" ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                Submit Application
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

// REVIEW ITEM
interface ReviewItemProps {
  label: string;
  value?: string | number | null;
}

function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">
        {value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
          ? value
          : "—"}
      </p>
    </div>
  );
}
