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
import { useState } from "react";
import {
  Controller,
  type FieldPath,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createAdmission,
  initiateAdmissionPayment,
} from "@/features/admissions/api";
import { admissionSchema } from "@/features/admissions/schema";
import type { AdmissionFormValues } from "@/features/admissions/schema";
import type { CreateAdmissionInput } from "@/features/admissions/types";

interface AdmissionFormProps {
  schoolId: number;
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
  const [step, setStep] = useState(1);

  const [submittedApplication, setSubmittedApplication] =
    useState<{
      applicationNo: string;
      studentEmail: string;
      paymentMethod: "CASH" | "ONLINE";
      paymentStatus: "PENDING";
      emailVerificationRequired: boolean;
    } | null>(null);

  const {
    register,
    control,
    trigger,
    watch,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
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

  // ============================================================
  // NEXT STEP
  // ============================================================

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
      fields = [
        "academicYear",
        "classId",
        "sectionId",
      ];
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

    if (!valid) {
      return;
    }

    setStep((current) =>
      Math.min(current + 1, 4),
    );
  };

  // ============================================================
  // PREVIOUS STEP
  // ============================================================

  const previousStep = () => {
    setStep((current) =>
      Math.max(current - 1, 1),
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (
    data: AdmissionFormValues,
  ) => {
    try {
      const input: CreateAdmissionInput = {
        schoolId,
        ...data,
      };

      // --------------------------------------------------------
      // 1. Create admission application
      // --------------------------------------------------------

      const result = await createAdmission(input);

      // --------------------------------------------------------
      // 2. Online payment
      // --------------------------------------------------------

      if (result.paymentMethod === "ONLINE") {
        const loadingToast = toast.loading(
          "Redirecting to payment gateway...",
        );

        try {
          const payment =
            await initiateAdmissionPayment(
              schoolId,
              result.id,
            );

          toast.dismiss(loadingToast);

          // Redirect to SSLCommerz
          window.location.href =
            payment.paymentUrl;

          return;
        } catch (paymentError) {
          toast.dismiss(loadingToast);

          throw paymentError;
        }
      }

      // --------------------------------------------------------
      // 3. Cash payment
      // --------------------------------------------------------

      setSubmittedApplication({
        applicationNo: result.applicationNo,
        studentEmail: result.studentEmail,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        emailVerificationRequired:
          result.emailVerificationRequired,
      });

      toast.success(
        "Admission application submitted successfully!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit admission application",
      );
    }
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (submittedApplication) {
    return (
      <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold tracking-tight">
            Application Submitted
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your admission application has been
            submitted successfully.
          </p>

          {/* Application Details */}
          <div className="mt-6 w-full rounded-xl border bg-muted/30 p-5 text-left">
            <div className="space-y-4">
              {/* Application Number */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Application Number
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {
                    submittedApplication.applicationNo
                  }
                </p>
              </div>

              {/* Student Email */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Student Email
                </p>

                <p className="mt-1 text-sm font-medium">
                  {
                    submittedApplication.studentEmail
                  }
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-medium">
                  {submittedApplication.paymentMethod ===
                  "ONLINE"
                    ? "Online Payment"
                    : "Cash Payment"}
                </p>
              </div>

              {/* Payment Status */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Status
                </p>

                <span className="mt-1 inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-700">
                  {submittedApplication.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Email Verification */}
          {submittedApplication.emailVerificationRequired && (
            <div className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm font-medium">
                Email verification required
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Please check your student email and
                verify your email address.
              </p>
            </div>
          )}

          {/* Cash Payment */}
          {submittedApplication.paymentMethod ===
            "CASH" && (
            <div className="mt-5 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-left dark:border-yellow-900 dark:bg-yellow-950/30">
              <p className="text-sm font-medium">
                Cash payment
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Please contact the school and complete
                your admission payment in cash.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* ======================================================
          STEPS
      ======================================================= */}

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-[650px] max-w-4xl items-start justify-between">
          {steps.map((item, index) => {
            const Icon = item.icon;

            const isActive =
              step === item.id;

            const isCompleted =
              step > item.id;

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

      {/* ======================================================
          STEP 1 - STUDENT
      ======================================================= */}

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
            {/* Student Name */}
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

            {/* Student Email */}
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
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              {errors.studentEmail && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.studentEmail.message}
                </p>
              )}
            </div>

            {/* Password */}
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
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
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

            {/* Gender */}
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
                <option value="">
                  Select gender
                </option>
                <option value="MALE">
                  Male
                </option>
                <option value="FEMALE">
                  Female
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* Blood Group */}
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
                <option value="">
                  Select blood group
                </option>
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

            {/* Previous School */}
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

            {/* Previous Class */}
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

      {/* ======================================================
          STEP 2 - ACADEMIC
      ======================================================= */}

      {step === 2 && (
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Academic Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select the academic year, class and section.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Academic Year */}
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

            {/* Class */}
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
                      field.value
                        ? String(field.value)
                        : ""
                    }
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          ? Number(
                              event.target.value,
                            )
                          : undefined,
                      )
                    }
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">
                      Select class
                    </option>
                    <option value="1">
                      Class 1
                    </option>
                    <option value="2">
                      Class 2
                    </option>
                    <option value="3">
                      Class 3
                    </option>
                    <option value="4">
                      Class 4
                    </option>
                    <option value="5">
                      Class 5
                    </option>
                    <option value="6">
                      Class 6
                    </option>
                    <option value="7">
                      Class 7
                    </option>
                    <option value="8">
                      Class 8
                    </option>
                    <option value="9">
                      Class 9
                    </option>
                    <option value="10">
                      Class 10
                    </option>
                  </select>
                )}
              />

              {errors.classId && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.classId.message}
                </p>
              )}
            </div>

            {/* Section */}
            <div>
              <label
                htmlFor="sectionId"
                className="mb-2 block text-sm font-medium"
              >
                Section *
              </label>

              <Controller
                name="sectionId"
                control={control}
                render={({ field }) => (
                  <select
                    id="sectionId"
                    value={
                      field.value
                        ? String(field.value)
                        : ""
                    }
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          ? Number(
                              event.target.value,
                            )
                          : undefined,
                      )
                    }
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">
                      Select section
                    </option>
                    <option value="1">
                      Section A
                    </option>
                    <option value="2">
                      Section B
                    </option>
                    <option value="3">
                      Section C
                    </option>
                  </select>
                )}
              />

              {errors.sectionId && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.sectionId.message}
                </p>
              )}
            </div>

            {/* Shift */}
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
                <option value="">
                  Select shift
                </option>
                <option value="MORNING">
                  Morning
                </option>
                <option value="DAY">
                  Day
                </option>
              </select>
            </div>

            {/* Group */}
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
                <option value="">
                  Select group
                </option>
                <option value="SCIENCE">
                  Science
                </option>
                <option value="COMMERCE">
                  Commerce
                </option>
                <option value="ARTS">
                  Arts
                </option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          STEP 3 - GUARDIAN
      ======================================================= */}

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
            {/* Guardian Name */}
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

            {/* Guardian Email */}
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

            {/* Guardian Phone */}
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

            {/* Relationship */}
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
                <option value="">
                  Select relationship
                </option>
                <option value="FATHER">
                  Father
                </option>
                <option value="MOTHER">
                  Mother
                </option>
                <option value="BROTHER">
                  Brother
                </option>
                <option value="SISTER">
                  Sister
                </option>
                <option value="GUARDIAN">
                  Guardian
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* NID */}
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

            {/* Occupation */}
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

            {/* Address */}
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

      {/* ======================================================
          STEP 4 - REVIEW
      ======================================================= */}

      {step === 4 && (
        <section className="space-y-6">
          {/* Student Review */}
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

          {/* Academic Review */}
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
                label="Class ID"
                value={
                  values.classId
                    ? String(values.classId)
                    : undefined
                }
              />

              <ReviewItem
                label="Section ID"
                value={
                  values.sectionId
                    ? String(values.sectionId)
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

          {/* Guardian Review */}
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

          {/* Payment */}
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
                  {/* Online */}
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
                      checked={
                        field.value === "ONLINE"
                      }
                      onChange={() =>
                        field.onChange("ONLINE")
                      }
                      className="sr-only"
                    />

                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-primary" />

                      <div>
                        <p className="text-sm font-medium">
                          Online Payment
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Pay online through the payment
                          gateway.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Cash */}
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
                      checked={
                        field.value === "CASH"
                      }
                      onChange={() =>
                        field.onChange("CASH")
                      }
                      className="sr-only"
                    />

                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-primary" />

                      <div>
                        <p className="text-sm font-medium">
                          Cash Payment
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Pay the admission fee directly
                          at the school.
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

      {/* ======================================================
          NAVIGATION
      ======================================================= */}

      <div className="flex items-center justify-between border-t pt-6">
        {/* Previous */}
        <button
          type="button"
          onClick={previousStep}
          disabled={
            step === 1 || isSubmitting
          }
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Continue */}
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
          /* Submit */
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {values.paymentMethod ===
                "ONLINE"
                  ? "Redirecting..."
                  : "Submitting..."}
              </>
            ) : (
              <>
                {values.paymentMethod ===
                "ONLINE" ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                {values.paymentMethod ===
                "ONLINE"
                  ? "Proceed to Payment"
                  : "Submit Application"}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

// ============================================================
// REVIEW ITEM
// ============================================================

interface ReviewItemProps {
  label: string;
  value?: string | number | null;
}

function ReviewItem({
  label,
  value,
}: ReviewItemProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

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