"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  MapPin,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/shared/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AcademicGroup,
  HefzWing,
  ResidentialType,
} from "@/features/admissions/types";
import { useUpdateStudent } from "@/features/students/hooks";
import type {
  DiscountMode,
  StudentConcessionType,
  StudentRecord,
  UpdateStudentInput,
} from "@/features/students/types";

const CONCESSION_LABELS: Record<StudentConcessionType, string> = {
  ORPHAN: "এতিম (Orphan)",
  LILLAH: "লিল্লাহ (Lillah)",
  SIBLING: "ভাই-বোন (Sibling)",
  SCHOLARSHIP: "বৃত্তি (Scholarship)",
  CUSTOM: "বিশেষ ছাড় (Custom)",
};

interface StudentProfileViewProps {
  schoolId: number;
  student: StudentRecord;
  canEdit?: boolean;
  backHref?: string;
}

type ProfileTab =
  | "identity"
  | "parents"
  | "address"
  | "academic"
  | "health"
  | "hefz"
  | "documents";

const toDateInput = (iso?: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

export function StudentProfileView({
  schoolId,
  student,
  canEdit = false,
  backHref,
}: StudentProfileViewProps) {
  const [tab, setTab] = useState<ProfileTab>("identity");
  const updateMut = useUpdateStudent(schoolId);

  const [form, setForm] = useState<UpdateStudentInput>({});

  useEffect(() => {
    setForm({
      firstName: student.firstName,
      lastName: student.lastName ?? "",
      nameBangla: student.nameBangla ?? "",
      dateOfBirth: toDateInput(student.dateOfBirth),
      gender: student.gender ?? "",
      phone: student.phone ?? "",
      residentialType: student.residentialType ?? "NON_RESIDENTIAL",
      shift: student.shift ?? "MORNING",
      quranWing: student.quranWing ?? null,
      birthRegNo: student.birthRegNo ?? "",
      bloodGroup: student.bloodGroup ?? "",
      religion: student.religion ?? "",
      nationality: student.nationality ?? "Bangladeshi",
      studentPhotoUrl: student.studentPhotoUrl ?? "",
      fatherName: student.fatherName ?? "",
      fatherPhone: student.fatherPhone ?? "",
      fatherOccupation: student.fatherOccupation ?? "",
      fatherNid: student.fatherNid ?? "",
      motherName: student.motherName ?? "",
      motherPhone: student.motherPhone ?? "",
      motherOccupation: student.motherOccupation ?? "",
      motherNid: student.motherNid ?? "",
      emergencyContactName: student.emergencyContactName ?? "",
      emergencyContactPhone: student.emergencyContactPhone ?? "",
      presentAddress: student.presentAddress ?? student.address ?? "",
      permanentAddress: student.permanentAddress ?? "",
      authorizedPickupName: student.authorizedPickupName ?? "",
      authorizedPickupRelation: student.authorizedPickupRelation ?? "",
      authorizedPickupPhone: student.authorizedPickupPhone ?? "",
      authorizedPickupNid: student.authorizedPickupNid ?? "",
      pickupPersonPhotoUrl: student.pickupPersonPhotoUrl ?? "",
      academicGroup: student.academicGroup ?? null,
      boardName: student.boardName ?? "",
      boardRollNo: student.boardRollNo ?? "",
      boardRegNo: student.boardRegNo ?? "",
      fourthSubject: student.fourthSubject ?? "",
      previousSchool: student.previousSchool ?? "",
      previousClass: student.previousClass ?? "",
      tcNumber: student.tcNumber ?? "",
      tcDate: toDateInput(student.tcDate),
      allergies: student.allergies ?? "",
      medicalConditions: student.medicalConditions ?? "",
      medications: student.medications ?? "",
      healthNotes: student.healthNotes ?? "",
      birthCertificateUrl: student.birthCertificateUrl ?? "",
      guardianNidUrl: student.guardianNidUrl ?? "",
      previousTcUrl: student.previousTcUrl ?? "",
      marksheetUrl: student.marksheetUrl ?? "",
      concessionType: student.concessionType ?? null,
      concessionMode: student.concessionMode ?? null,
      concessionValue:
        student.concessionValue != null
          ? Number(student.concessionValue)
          : null,
      concessionReason: student.concessionReason ?? "",
    });
  }, [student]);

  const setField = <K extends keyof UpdateStudentInput>(
    key: K,
    value: UpdateStudentInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const payload: UpdateStudentInput = {
      ...form,
      concessionType: form.concessionType || null,
      concessionMode: form.concessionType
        ? (form.concessionMode ?? "PERCENTAGE")
        : null,
      concessionValue:
        form.concessionType &&
        form.concessionValue !== null &&
        form.concessionValue !== undefined &&
        Number.isFinite(Number(form.concessionValue))
          ? Number(form.concessionValue)
          : null,
      concessionReason: form.concessionType
        ? form.concessionReason?.trim() || null
        : null,
    };
    await updateMut.mutateAsync({ id: student.id, payload });
  };

  const activeEnrollment = student.enrollments?.[0];
  const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: "identity", label: "Identity", icon: User },
    { id: "parents", label: "Parents & Pickup", icon: ShieldCheck },
    { id: "address", label: "Address & TC", icon: MapPin },
    { id: "academic", label: "Academic & Board", icon: GraduationCap },
    { id: "health", label: "Health & Care", icon: HeartPulse },
    { id: "hefz", label: "Hefz Progress", icon: BookOpenCheck },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
      )}

      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {student.studentPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.studentPhotoUrl}
              alt={student.firstName}
              className="h-16 w-16 rounded-xl border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {student.firstName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {student.firstName} {student.lastName ?? ""}
            </h1>
            {student.nameBangla && (
              <p className="text-sm text-muted-foreground">
                {student.nameBangla}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5 font-mono font-semibold text-foreground">
                {student.studentId}
              </span>
              {activeEnrollment && (
                <span>
                  {activeEnrollment.class.name}
                  {activeEnrollment.section
                    ? ` • ${activeEnrollment.section.name}`
                    : ""}{" "}
                  ({activeEnrollment.academicYear})
                </span>
              )}
              <span>
                •{" "}
                {(student.residentialType ?? "NON_RESIDENTIAL").replace(
                  "_",
                  " ",
                )}
              </span>
              {student.quranWing && <span>• {student.quranWing}</span>}
              {student.concessionType && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {CONCESSION_LABELS[student.concessionType]}
                  {student.concessionValue != null &&
                  Number(student.concessionValue) > 0
                    ? student.concessionMode === "FIXED"
                      ? ` · ৳${Number(student.concessionValue).toLocaleString("en-BD")}`
                      : ` · ${Number(student.concessionValue)}%`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={updateMut.isPending}
            className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {updateMut.isPending ? "Saving..." : "Save Profile"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border bg-card p-6">
        {tab === "identity" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="First Name">
              <Input
                disabled={!canEdit}
                value={form.firstName ?? ""}
                onChange={(e) => setField("firstName", e.target.value)}
              />
            </Field>
            <Field label="Last Name">
              <Input
                disabled={!canEdit}
                value={form.lastName ?? ""}
                onChange={(e) => setField("lastName", e.target.value)}
              />
            </Field>
            <Field label="Name in Bangla (বাংলা নাম)">
              <Input
                disabled={!canEdit}
                value={form.nameBangla ?? ""}
                onChange={(e) => setField("nameBangla", e.target.value)}
              />
            </Field>
            <Field label="Date of Birth">
              <Input
                type="date"
                disabled={!canEdit}
                value={form.dateOfBirth ?? ""}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
              />
            </Field>
            <Field label="Gender">
              <select
                disabled={!canEdit}
                value={form.gender ?? ""}
                onChange={(e) => setField("gender", e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Blood Group">
              <select
                disabled={!canEdit}
                value={form.bloodGroup ?? ""}
                onChange={(e) => setField("bloodGroup", e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="17-Digit Birth Reg. No.">
              <Input
                disabled={!canEdit}
                value={form.birthRegNo ?? ""}
                onChange={(e) => setField("birthRegNo", e.target.value)}
                placeholder="17-digit number"
              />
            </Field>
            <Field label="Residential / Care Type">
              <select
                disabled={!canEdit}
                value={form.residentialType ?? "NON_RESIDENTIAL"}
                onChange={(e) =>
                  setField("residentialType", e.target.value as ResidentialType)
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
              >
                <option value="NON_RESIDENTIAL">Non-Residential (Day)</option>
                <option value="RESIDENTIAL">Residential (Hostel)</option>
                <option value="DAY_CARE">Day-Care</option>
              </select>
            </Field>
            <Field label="Shift">
              <select
                disabled={!canEdit}
                value={form.shift ?? "MORNING"}
                onChange={(e) => setField("shift", e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
              >
                <option value="MORNING">Morning</option>
                <option value="DAY">Day</option>
                <option value="EVENING">Evening</option>
              </select>
            </Field>
            <Field label="Quran / Hefz Wing">
              <select
                disabled={!canEdit}
                value={form.quranWing ?? ""}
                onChange={(e) =>
                  setField(
                    "quranWing",
                    (e.target.value || null) as HefzWing | null,
                  )
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
              >
                <option value="">General / None</option>
                <option value="NOORANI">Noorani</option>
                <option value="QAIDA">Qaida</option>
                <option value="AMPARA">Ampara</option>
                <option value="NAJERA">Najera</option>
                <option value="HEFZ">Hefz</option>
              </select>
            </Field>
            <Field label="Religion">
              <Input
                disabled={!canEdit}
                value={form.religion ?? ""}
                onChange={(e) => setField("religion", e.target.value)}
                placeholder="Islam"
              />
            </Field>
            <Field label="Nationality">
              <Input
                disabled={!canEdit}
                value={form.nationality ?? ""}
                onChange={(e) => setField("nationality", e.target.value)}
              />
            </Field>

            <div className="mt-2 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:col-span-2 lg:col-span-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-emerald-900">
                  বৃত্তি / এতিম / লিল্লাহ ছাড় (Fee Concession Profile)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Set an automatic fee discount applied whenever new monthly or
                  other fees are generated for this student.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Concession Category (ছাড়ের ধরন)">
                  <select
                    disabled={!canEdit}
                    value={form.concessionType ?? ""}
                    onChange={(e) => {
                      const val = (e.target.value ||
                        null) as StudentConcessionType | null;
                      setForm((prev) => ({
                        ...prev,
                        concessionType: val,
                        concessionMode: val
                          ? (prev.concessionMode ?? "PERCENTAGE")
                          : null,
                        concessionValue: val
                          ? (prev.concessionValue ??
                            (val === "ORPHAN" || val === "LILLAH" ? 100 : 25))
                          : null,
                      }));
                    }}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
                  >
                    <option value="">None (কোনো ছাড় নেই)</option>
                    <option value="ORPHAN">এতিম (Orphan)</option>
                    <option value="LILLAH">লিল্লাহ (Lillah)</option>
                    <option value="SIBLING">ভাই-বোন (Sibling)</option>
                    <option value="SCHOLARSHIP">বৃত্তি (Scholarship)</option>
                    <option value="CUSTOM">বিশেষ ছাড় (Custom)</option>
                  </select>
                </Field>
                <Field label="Discount Mode">
                  <select
                    disabled={!canEdit || !form.concessionType}
                    value={form.concessionMode ?? "PERCENTAGE"}
                    onChange={(e) =>
                      setField("concessionMode", e.target.value as DiscountMode)
                    }
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                  </select>
                </Field>
                <Field
                  label={
                    form.concessionMode === "FIXED"
                      ? "Discount Amount (৳)"
                      : "Discount Percent (%)"
                  }
                >
                  <Input
                    type="number"
                    min={0}
                    max={form.concessionMode === "FIXED" ? 999999 : 100}
                    step="0.01"
                    disabled={!canEdit || !form.concessionType}
                    value={
                      form.concessionValue != null
                        ? String(form.concessionValue)
                        : ""
                    }
                    onChange={(e) =>
                      setField(
                        "concessionValue",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    placeholder={
                      form.concessionMode === "FIXED" ? "e.g. 500" : "e.g. 50"
                    }
                  />
                </Field>
                <Field label="Approval / Reason Note">
                  <Input
                    disabled={!canEdit || !form.concessionType}
                    value={form.concessionReason ?? ""}
                    onChange={(e) =>
                      setField("concessionReason", e.target.value)
                    }
                    placeholder="যেমন: মুহতামিম অনুমোদিত এতিম ছাড়"
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {tab === "parents" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Father&apos;s Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Father Name">
                  <Input
                    disabled={!canEdit}
                    value={form.fatherName ?? ""}
                    onChange={(e) => setField("fatherName", e.target.value)}
                  />
                </Field>
                <Field label="Father Phone">
                  <Input
                    disabled={!canEdit}
                    value={form.fatherPhone ?? ""}
                    onChange={(e) => setField("fatherPhone", e.target.value)}
                  />
                </Field>
                <Field label="Occupation">
                  <Input
                    disabled={!canEdit}
                    value={form.fatherOccupation ?? ""}
                    onChange={(e) =>
                      setField("fatherOccupation", e.target.value)
                    }
                  />
                </Field>
                <Field label="Father NID">
                  <Input
                    disabled={!canEdit}
                    value={form.fatherNid ?? ""}
                    onChange={(e) => setField("fatherNid", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Mother&apos;s Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Mother Name">
                  <Input
                    disabled={!canEdit}
                    value={form.motherName ?? ""}
                    onChange={(e) => setField("motherName", e.target.value)}
                  />
                </Field>
                <Field label="Mother Phone">
                  <Input
                    disabled={!canEdit}
                    value={form.motherPhone ?? ""}
                    onChange={(e) => setField("motherPhone", e.target.value)}
                  />
                </Field>
                <Field label="Occupation">
                  <Input
                    disabled={!canEdit}
                    value={form.motherOccupation ?? ""}
                    onChange={(e) =>
                      setField("motherOccupation", e.target.value)
                    }
                  />
                </Field>
                <Field label="Mother NID">
                  <Input
                    disabled={!canEdit}
                    value={form.motherNid ?? ""}
                    onChange={(e) => setField("motherNid", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">
                Authorized Pickup Person (Kindergarten / Play – Class 5 Safety)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Pickup Person Name">
                  <Input
                    disabled={!canEdit}
                    value={form.authorizedPickupName ?? ""}
                    onChange={(e) =>
                      setField("authorizedPickupName", e.target.value)
                    }
                  />
                </Field>
                <Field label="Relation">
                  <Input
                    disabled={!canEdit}
                    value={form.authorizedPickupRelation ?? ""}
                    onChange={(e) =>
                      setField("authorizedPickupRelation", e.target.value)
                    }
                    placeholder="Uncle / Grandfather / Driver"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    disabled={!canEdit}
                    value={form.authorizedPickupPhone ?? ""}
                    onChange={(e) =>
                      setField("authorizedPickupPhone", e.target.value)
                    }
                  />
                </Field>
                <Field label="NID">
                  <Input
                    disabled={!canEdit}
                    value={form.authorizedPickupNid ?? ""}
                    onChange={(e) =>
                      setField("authorizedPickupNid", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Emergency Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Emergency Contact Name">
                  <Input
                    disabled={!canEdit}
                    value={form.emergencyContactName ?? ""}
                    onChange={(e) =>
                      setField("emergencyContactName", e.target.value)
                    }
                  />
                </Field>
                <Field label="Emergency Contact Phone">
                  <Input
                    disabled={!canEdit}
                    value={form.emergencyContactPhone ?? ""}
                    onChange={(e) =>
                      setField("emergencyContactPhone", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>

            {student.guardians && student.guardians.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-2 font-semibold">Linked Guardian Accounts</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {student.guardians.map((g) => (
                    <div
                      key={g.guardian.id}
                      className="rounded-xl border bg-muted/20 p-3 text-xs"
                    >
                      <p className="font-semibold">
                        {g.guardian.user.name}{" "}
                        {g.isPrimary && (
                          <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {g.guardian.relation ?? "Guardian"} •{" "}
                        {g.guardian.user.phone ?? "—"}
                      </p>
                      {g.guardian.nid && (
                        <p className="text-muted-foreground">
                          NID: {g.guardian.nid}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "address" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Present Address">
                <textarea
                  disabled={!canEdit}
                  rows={3}
                  value={form.presentAddress ?? ""}
                  onChange={(e) => setField("presentAddress", e.target.value)}
                  className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
                />
              </Field>
              <Field label="Permanent Address">
                <textarea
                  disabled={!canEdit}
                  rows={3}
                  value={form.permanentAddress ?? ""}
                  onChange={(e) => setField("permanentAddress", e.target.value)}
                  className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
                />
              </Field>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">
                Previous Institution &amp; Transfer Certificate (TC)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Previous School / Madrasa">
                  <Input
                    disabled={!canEdit}
                    value={form.previousSchool ?? ""}
                    onChange={(e) => setField("previousSchool", e.target.value)}
                  />
                </Field>
                <Field label="Previous Class">
                  <Input
                    disabled={!canEdit}
                    value={form.previousClass ?? ""}
                    onChange={(e) => setField("previousClass", e.target.value)}
                  />
                </Field>
                <Field label="TC Number">
                  <Input
                    disabled={!canEdit}
                    value={form.tcNumber ?? ""}
                    onChange={(e) => setField("tcNumber", e.target.value)}
                  />
                </Field>
                <Field label="TC Date">
                  <Input
                    type="date"
                    disabled={!canEdit}
                    value={form.tcDate ?? ""}
                    onChange={(e) => setField("tcDate", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {tab === "academic" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">
                Class 9–10 / Board Exam Details (Optional)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Academic Group">
                  <select
                    disabled={!canEdit}
                    value={form.academicGroup ?? ""}
                    onChange={(e) =>
                      setField(
                        "academicGroup",
                        (e.target.value || null) as AcademicGroup | null,
                      )
                    }
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-70"
                  >
                    <option value="">None</option>
                    <option value="SCIENCE">Science</option>
                    <option value="ARTS">Arts</option>
                    <option value="COMMERCE">Commerce</option>
                  </select>
                </Field>
                <Field label="Board Name">
                  <Input
                    disabled={!canEdit}
                    value={form.boardName ?? ""}
                    onChange={(e) => setField("boardName", e.target.value)}
                    placeholder="Dhaka / Madrasah Board"
                  />
                </Field>
                <Field label="Board Roll No.">
                  <Input
                    disabled={!canEdit}
                    value={form.boardRollNo ?? ""}
                    onChange={(e) => setField("boardRollNo", e.target.value)}
                  />
                </Field>
                <Field label="Board Reg. No.">
                  <Input
                    disabled={!canEdit}
                    value={form.boardRegNo ?? ""}
                    onChange={(e) => setField("boardRegNo", e.target.value)}
                  />
                </Field>
                <Field label="4th Subject">
                  <Input
                    disabled={!canEdit}
                    value={form.fourthSubject ?? ""}
                    onChange={(e) => setField("fourthSubject", e.target.value)}
                    placeholder="Higher Math / Biology"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Enrollment History</h3>
              {student.enrollments && student.enrollments.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {student.enrollments.map((en) => (
                    <div
                      key={en.id}
                      className="rounded-xl border bg-muted/20 p-3 text-xs"
                    >
                      <p className="font-semibold">
                        {en.class.name}
                        {en.section ? ` — ${en.section.name}` : ""}
                      </p>
                      <p className="text-muted-foreground">
                        Session: {en.academicYear} • Roll:{" "}
                        {en.rollNumber ?? "—"} • {en.status}
                      </p>
                      {(en.academicGroup || en.shift) && (
                        <p className="text-muted-foreground">
                          {en.shift ?? ""}{" "}
                          {en.academicGroup ? `• ${en.academicGroup}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No class enrollments recorded yet.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "health" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Allergies (Food / Medicine)">
              <textarea
                disabled={!canEdit}
                rows={3}
                value={form.allergies ?? ""}
                onChange={(e) => setField("allergies", e.target.value)}
                placeholder="e.g. Peanuts, dust, penicillin..."
                className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
              />
            </Field>
            <Field label="Medical Conditions">
              <textarea
                disabled={!canEdit}
                rows={3}
                value={form.medicalConditions ?? ""}
                onChange={(e) => setField("medicalConditions", e.target.value)}
                placeholder="e.g. Asthma, glasses required..."
                className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
              />
            </Field>
            <Field label="Regular Medications">
              <textarea
                disabled={!canEdit}
                rows={3}
                value={form.medications ?? ""}
                onChange={(e) => setField("medications", e.target.value)}
                className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
              />
            </Field>
            <Field label="General Care / Hostel / Day-Care Notes">
              <textarea
                disabled={!canEdit}
                rows={3}
                value={form.healthNotes ?? ""}
                onChange={(e) => setField("healthNotes", e.target.value)}
                className="w-full rounded-md border bg-background p-2.5 text-sm disabled:opacity-70"
              />
            </Field>
          </div>
        )}

        {tab === "hefz" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Quran / Hefz Enrollments</h3>
              {student.quranWing && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Intake Wing: {student.quranWing}
                </span>
              )}
            </div>

            {student.hefzEnrollments && student.hefzEnrollments.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {student.hefzEnrollments.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-xl border bg-muted/20 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{h.wing} Wing</span>
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {h.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ustad: {h.ustad.firstName} {h.ustad.lastName ?? ""} (
                      {h.ustad.employeeId})
                    </p>
                    <p className="mt-1 text-xs">
                      Current Para: <strong>{h.currentPara ?? "—"}</strong>{" "}
                      {h.currentSurah ? `• Surah ${h.currentSurah}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active Hefz/Najera enrollment yet. Enroll this student in the
                Hefz &amp; Najera module to track daily Sobok and Manzil.
              </p>
            )}
          </div>
        )}

        {tab === "documents" && (
          <div className="grid gap-6 sm:grid-cols-2">
            {canEdit ? (
              <>
                <FileUpload
                  category="STUDENT_PHOTO"
                  label="Student Photo"
                  currentUrl={form.studentPhotoUrl}
                  onUploaded={(file) => setField("studentPhotoUrl", file.url)}
                />
                <FileUpload
                  category="DOCUMENT"
                  label="Birth Certificate"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  currentUrl={form.birthCertificateUrl}
                  onUploaded={(file) =>
                    setField("birthCertificateUrl", file.url)
                  }
                />
                <FileUpload
                  category="DOCUMENT"
                  label="Guardian NID"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  currentUrl={form.guardianNidUrl}
                  onUploaded={(file) => setField("guardianNidUrl", file.url)}
                />
                <FileUpload
                  category="DOCUMENT"
                  label="Previous TC"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  currentUrl={form.previousTcUrl}
                  onUploaded={(file) => setField("previousTcUrl", file.url)}
                />
                <FileUpload
                  category="DOCUMENT"
                  label="Previous Marksheet"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  currentUrl={form.marksheetUrl}
                  onUploaded={(file) => setField("marksheetUrl", file.url)}
                />
                <FileUpload
                  category="GUARDIAN_PHOTO"
                  label="Authorized Pickup Person Photo"
                  currentUrl={form.pickupPersonPhotoUrl}
                  onUploaded={(file) =>
                    setField("pickupPersonPhotoUrl", file.url)
                  }
                />
              </>
            ) : (
              [
                { label: "Student Photo", url: student.studentPhotoUrl },
                {
                  label: "Birth Certificate",
                  url: student.birthCertificateUrl,
                },
                { label: "Guardian NID", url: student.guardianNidUrl },
                { label: "Previous TC", url: student.previousTcUrl },
                { label: "Previous Marksheet", url: student.marksheetUrl },
                {
                  label: "Authorized Pickup Photo",
                  url: student.pickupPersonPhotoUrl,
                },
              ].map((doc) => (
                <div
                  key={doc.label}
                  className="flex items-center justify-between rounded-xl border p-4 text-sm"
                >
                  <span className="font-medium">{doc.label}</span>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not uploaded
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
