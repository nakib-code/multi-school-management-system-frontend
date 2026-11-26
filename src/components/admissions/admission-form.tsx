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
import { useState } from "react";
import { Controller, type FieldPath, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FileUpload } from "@/components/shared/file-upload";
import { createAdmission } from "@/features/admissions/api";
import type { AdmissionFormValues } from "@/features/admissions/schema";
import { admissionSchema } from "@/features/admissions/schema";
import type {
  AdmissionPaymentMethod,
  CreateAdmissionInput,
} from "@/features/admissions/types";
import {
  usePublicActiveClasses,
  usePublicActiveSections,
} from "@/features/public/classes/hook";
import { useAuth } from "@/providers/auth-provider";

interface AdmissionFormProps {
  schoolId: number;
}

interface SubmittedApplication {
  id: number;
  applicationNo: string;
  studentName: string;
  guardianPhone: string | null;
  paymentMethod: AdmissionPaymentMethod | null;
  paymentStatus: string | null;
}

const isSeniorClass = (name?: string, code?: string) => {
  const text = `${name ?? ""} ${code ?? ""}`.toLowerCase();
  return /\b(9|10|nine|ten|ssc|dakhil)\b/.test(text);
};

const steps = [
  { id: 1, title: "Student", description: "Basic details", icon: User },
  { id: 2, title: "Academic", description: "Class & wing", icon: FileText },
  { id: 3, title: "Guardian", description: "Parent & docs", icon: Users },
  { id: 4, title: "Review", description: "Confirm & submit", icon: CreditCard },
];

export default function AdmissionForm({ schoolId }: AdmissionFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submittedApplication, setSubmittedApplication] =
    useState<SubmittedApplication | null>(null);

  const {
    register,
    control,
    trigger,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof admissionSchema>, unknown, AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      academicYear: String(new Date().getFullYear()),
      residentialType: "NON_RESIDENTIAL",
      shift: "MORNING",
      guardianRelationship: "FATHER",
      paymentMethod: "CASH",
    },
    mode: "onTouched",
  });

  const values = watch();
  const selectedClassId = watch("classId") as number | undefined;

  const {
    data: classes = [],
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = usePublicActiveClasses(schoolId);

  const { data: sections = [], isLoading: isSectionsLoading } =
    usePublicActiveSections(schoolId, selectedClassId);

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const selectedSection = sections.find(
    (sec) => sec.id === Number(values.sectionId),
  );
  const showAcademicGroup = isSeniorClass(
    selectedClass?.name,
    selectedClass?.code,
  );

  const onSubmit = async (data: AdmissionFormValues) => {
    try {
      if (!Number.isInteger(schoolId) || schoolId <= 0) {
        toast.error("Invalid school information.");
        return;
      }

      const input: CreateAdmissionInput = {
        schoolId,
        studentName: data.studentName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        residentialType: data.residentialType,
        academicYear: data.academicYear,
        classId: data.classId,
        ...(data.sectionId ? { sectionId: data.sectionId } : {}),
        shift: data.shift,
        ...(showAcademicGroup && data.academicGroup
          ? { academicGroup: data.academicGroup }
          : {}),
        ...(data.quranWing ? { quranWing: data.quranWing } : {}),
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianRelationship: data.guardianRelationship,
        ...(data.guardianEmail ? { guardianEmail: data.guardianEmail } : {}),
        ...(data.guardianNid ? { guardianNid: data.guardianNid } : {}),
        ...(data.guardianOccupation
          ? { guardianOccupation: data.guardianOccupation }
          : {}),
        ...(data.nameBangla ? { nameBangla: data.nameBangla } : {}),
        ...(data.birthRegNo ? { birthRegNo: data.birthRegNo } : {}),
        ...(data.bloodGroup ? { bloodGroup: data.bloodGroup } : {}),
        ...(data.previousSchool ? { previousSchool: data.previousSchool } : {}),
        ...(data.previousClass ? { previousClass: data.previousClass } : {}),
        ...(data.presentAddress ? { presentAddress: data.presentAddress } : {}),
        ...(data.studentPhotoUrl
          ? { studentPhotoUrl: data.studentPhotoUrl }
          : {}),
        ...(data.birthCertificateUrl
          ? { birthCertificateUrl: data.birthCertificateUrl }
          : {}),
        ...(data.guardianNidUrl ? { guardianNidUrl: data.guardianNidUrl } : {}),
        ...(data.previousTcUrl ? { previousTcUrl: data.previousTcUrl } : {}),
        ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
      };

      const result = await createAdmission(input);

      if (
        result.payment &&
        result.payment.paymentMethod !== "CASH" &&
        result.payment.amount > 0
      ) {
        toast.success("Application submitted! Proceed to mobile banking payment.");
        router.push(
          `/admissions/payment?schoolId=${schoolId}&admissionId=${result.id}`,
        );
        return;
      }

      setSubmittedApplication({
        id: result.id,
        applicationNo: result.applicationNo,
        studentName: result.studentName,
        guardianPhone: result.guardianPhone,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
      });

      toast.success("Admission application submitted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit admission application.",
      );
    }
  };

  const nextStep = async () => {
    let fields: FieldPath<z.input<typeof admissionSchema>>[] = [];

    if (step === 1) {
      fields = ["studentName", "dateOfBirth", "gender", "residentialType"];
    }
    if (step === 2) {
      fields = ["academicYear", "classId"];
    }
    if (step === 3) {
      fields = ["guardianName", "guardianPhone", "guardianEmail"];
    }

    const valid = await trigger(fields);
    if (!valid) return;

    setStep((current) => Math.min(current + 1, 4));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

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
            Keep your Application Number and Guardian Phone to track your
            admission status.
          </p>

          <div className="mt-6 w-full rounded-xl border bg-muted/30 p-5 text-left">
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Application Number"
                value={submittedApplication.applicationNo}
              />
              <ReviewItem
                label="Student Name"
                value={submittedApplication.studentName}
              />
              <ReviewItem
                label="Guardian Phone"
                value={submittedApplication.guardianPhone}
              />
              <ReviewItem
                label="Payment"
                value={
                  submittedApplication.paymentMethod
                    ? `${submittedApplication.paymentMethod} (${submittedApplication.paymentStatus ?? "PENDING"})`
                    : "No upfront fee"
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* MOBILE STEP INDICATOR */}
      <div className="space-y-2 rounded-[11px] border bg-background p-3.5 sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">
            Step {step} of {steps.length}
          </span>
          <span className="font-medium text-foreground">
            {steps[step - 1]?.title} — {steps[step - 1]?.description}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* DESKTOP STEPS */}
      <div className="hidden overflow-x-auto pb-2 sm:block">
        <div className="mx-auto flex max-w-4xl items-start justify-between">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = step === item.id;
            const isCompleted = step > item.id;

            return (
              <div key={item.id} className="flex flex-1 items-start">
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
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
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
                    className={`mt-5 h-px flex-1 ${
                      step > item.id ? "bg-primary" : "bg-border"
                    }`}
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
            <h2 className="text-xl font-semibold">Student Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No student email or password required. Only essential details to
              get started fast.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="studentName"
                className="mb-2 block text-sm font-medium"
              >
                Student Full Name *
              </label>
              <input
                id="studentName"
                {...register("studentName")}
                placeholder="Enter student full name"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.studentName && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.studentName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nameBangla"
                className="mb-2 block text-sm font-medium"
              >
                Name in Bangla (Optional)
              </label>
              <input
                id="nameBangla"
                {...register("nameBangla")}
                placeholder="শিক্ষার্থীর বাংলা নাম"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-sm font-medium"
              >
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.dateOfBirth && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium"
              >
                Gender *
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
              {errors.gender && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="residentialType"
                className="mb-2 block text-sm font-medium"
              >
                Residential / Care Type *
              </label>
              <select
                id="residentialType"
                {...register("residentialType")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="NON_RESIDENTIAL">Non-Residential (Day)</option>
                <option value="RESIDENTIAL">Residential (Hostel)</option>
                <option value="DAY_CARE">Day-Care</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="bloodGroup"
                className="mb-2 block text-sm font-medium"
              >
                Blood Group (Optional)
              </label>
              <select
                id="bloodGroup"
                {...register("bloodGroup")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="birthRegNo"
                className="mb-2 block text-sm font-medium"
              >
                Birth Registration No. (Optional)
              </label>
              <input
                id="birthRegNo"
                {...register("birthRegNo")}
                placeholder="17-digit Birth Reg. No."
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="previousSchool"
                className="mb-2 block text-sm font-medium"
              >
                Previous School (Optional)
              </label>
              <input
                id="previousSchool"
                {...register("previousSchool")}
                placeholder="Previous school / madrasa"
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
            <h2 className="text-xl font-semibold">Academic Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose session, class, optional section, and Hefz/Group if
              applicable.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="academicYear"
                className="mb-2 block text-sm font-medium"
              >
                Academic Year / Session *
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
                    value={field.value ? String(field.value) : ""}
                    disabled={isClassesLoading}
                    onChange={(event) => {
                      const nextId = event.target.value
                        ? Number(event.target.value)
                        : undefined;
                      field.onChange(nextId);
                      setValue("sectionId", undefined);
                    }}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  >
                    <option value="">
                      {isClassesLoading
                        ? "Loading classes..."
                        : isClassesError
                          ? "Failed to load classes"
                          : "Select class"}
                    </option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
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
                htmlFor="sectionId"
                className="mb-2 block text-sm font-medium"
              >
                Section (Optional)
              </label>
              <select
                id="sectionId"
                disabled={!selectedClassId || isSectionsLoading}
                {...register("sectionId")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="">
                  {isSectionsLoading
                    ? "Loading sections..."
                    : "Any / School will assign"}
                </option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shift" className="mb-2 block text-sm font-medium">
                Shift
              </label>
              <select
                id="shift"
                {...register("shift")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="MORNING">Morning</option>
                <option value="DAY">Day</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>

            {showAcademicGroup && (
              <div>
                <label
                  htmlFor="academicGroup"
                  className="mb-2 block text-sm font-medium"
                >
                  Group (Class 9–10)
                </label>
                <select
                  id="academicGroup"
                  {...register("academicGroup")}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select group</option>
                  <option value="SCIENCE">Science</option>
                  <option value="ARTS">Arts</option>
                  <option value="COMMERCE">Commerce</option>
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="quranWing"
                className="mb-2 block text-sm font-medium"
              >
                Quran / Hefz Wing (Optional)
              </label>
              <select
                id="quranWing"
                {...register("quranWing")}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">General / Not applicable</option>
                <option value="NOORANI">Noorani</option>
                <option value="QAIDA">Qaida</option>
                <option value="AMPARA">Ampara</option>
                <option value="NAJERA">Najera</option>
                <option value="HEFZ">Hefz</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3 — GUARDIAN & OPTIONAL DOCUMENTS */}
      {step === 3 && (
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Guardian &amp; Optional Documents
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guardian phone is used for parent portal login and admission
              tracking.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="guardianName"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Name *
              </label>
              <input
                id="guardianName"
                {...register("guardianName")}
                placeholder="Father / Mother / Guardian name"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.guardianName && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.guardianName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="guardianPhone"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Phone *
              </label>
              <input
                id="guardianPhone"
                {...register("guardianPhone")}
                placeholder="01XXXXXXXXX"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              {errors.guardianPhone && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.guardianPhone.message}
                </p>
              )}
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
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="LOCAL_GUARDIAN">Local Guardian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="guardianEmail"
                className="mb-2 block text-sm font-medium"
              >
                Guardian Email (Optional)
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
                htmlFor="guardianNid"
                className="mb-2 block text-sm font-medium"
              >
                Guardian NID (Optional)
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
                Occupation (Optional)
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
                htmlFor="presentAddress"
                className="mb-2 block text-sm font-medium"
              >
                Present Address (Optional)
              </label>
              <textarea
                id="presentAddress"
                {...register("presentAddress")}
                rows={3}
                placeholder="House, Road, Area, District"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Optional Documents */}
            {user ? (
              <div className="grid gap-4 border-t pt-4 md:col-span-2 md:grid-cols-2">
                <FileUpload
                  category="STUDENT_PHOTO"
                  label="Student Photo (Optional)"
                  currentUrl={
                    typeof values.studentPhotoUrl === "string"
                      ? values.studentPhotoUrl
                      : undefined
                  }
                  onUploaded={(file) => setValue("studentPhotoUrl", file.url)}
                />
                <FileUpload
                  category="DOCUMENT"
                  label="Birth Certificate (Optional)"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  currentUrl={
                    typeof values.birthCertificateUrl === "string"
                      ? values.birthCertificateUrl
                      : undefined
                  }
                  onUploaded={(file) =>
                    setValue("birthCertificateUrl", file.url)
                  }
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground md:col-span-2">
                Documents (photo, birth certificate, guardian NID, TC) are
                optional at admission and can be uploaded by the office or
                guardian after admission is approved.
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 4 — REVIEW */}
      {step === 4 && (
        <section className="space-y-6">
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 font-semibold">Summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem label="Student Name" value={values.studentName} />
              <ReviewItem label="Bangla Name" value={values.nameBangla} />
              <ReviewItem label="Date of Birth" value={values.dateOfBirth} />
              <ReviewItem label="Gender" value={values.gender} />
              <ReviewItem
                label="Residential Type"
                value={values.residentialType}
              />
              <ReviewItem label="Session" value={values.academicYear} />
              <ReviewItem
                label="Class"
                value={
                  selectedClass
                    ? `${selectedClass.name} (${selectedClass.code})`
                    : undefined
                }
              />
              <ReviewItem label="Section" value={selectedSection?.name} />
              <ReviewItem label="Shift" value={values.shift} />
              {showAcademicGroup && (
                <ReviewItem
                  label="Group"
                  value={
                    typeof values.academicGroup === "string"
                      ? values.academicGroup
                      : undefined
                  }
                />
              )}
              <ReviewItem
                label="Quran / Hefz Wing"
                value={
                  typeof values.quranWing === "string"
                    ? values.quranWing
                    : undefined
                }
              />
              <ReviewItem label="Guardian Name" value={values.guardianName} />
              <ReviewItem label="Guardian Phone" value={values.guardianPhone} />
              <ReviewItem
                label="Relationship"
                value={values.guardianRelationship}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <h2 className="mb-1 font-semibold">
              Admission Fee Payment Method (If Applicable)
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Only charged if the institution has enabled an upfront admission
              fee.
            </p>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(["CASH", "BKASH", "NAGAD", "ROCKET"] as const).map(
                    (method) => (
                      <label
                        key={method}
                        className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-medium transition ${
                          field.value === method
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="radio"
                          value={method}
                          checked={field.value === method}
                          onChange={() => field.onChange(method)}
                          className="sr-only"
                        />
                        {method === "CASH" ? "Cash at Office" : method}
                      </label>
                    ),
                  )}
                </div>
              )}
            />
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
                <Check className="h-4 w-4" />
                Submit Application
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">
        {value !== undefined && value !== null && String(value).trim() !== ""
          ? value
          : "—"}
      </p>
    </div>
  );
}
