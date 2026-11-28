"use client";

import {
  Copy,
  Eye,
  FileDown,
  GraduationCap,
  LockKeyhole,
  Search,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import {
  type GuardianCredentialsData,
  GuardianCredentialsModal,
} from "@/components/school-modules/guardian-credentials-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import type {
  AcademicGroup,
  HefzWing,
  ResidentialType,
} from "@/features/admissions/types";
import {
  type ResetStudentPasswordResponse,
  useActivateStudent,
  useCreateStudent,
  useDeactivateStudent,
  useResetStudentPassword,
  useStudents,
} from "@/features/students/hooks";
import type {
  DiscountMode,
  StudentConcessionType,
} from "@/features/students/types";
import { useTeachers } from "@/features/teachers/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const CONCESSION_SHORT: Record<StudentConcessionType, string> = {
  ORPHAN: "এতিম",
  LILLAH: "লিল্লাহ",
  SIBLING: "ভাই-বোন",
  SCHOLARSHIP: "বৃত্তি",
  CUSTOM: "বিশেষ ছাড়",
};

const isSeniorClass = (name?: string, code?: string) => {
  const text = `${name ?? ""} ${code ?? ""}`.toLowerCase();
  return /\b(9|10|nine|ten|ssc|dakhil)\b/.test(text);
};

export function StudentsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";
  const canAdmit = user?.role === "ADMIN" || user?.role === "MANAGER";
  const profileBasePath =
    user?.role === "TEACHER"
      ? "/dashboard/teacher/students"
      : user?.role === "MANAGER"
        ? "/dashboard/manager/students"
        : "/dashboard/admin/students";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [quickAdmitOpen, setQuickAdmitOpen] = useState(false);
  const [guardianCredentials, setGuardianCredentials] =
    useState<GuardianCredentialsData | null>(null);
  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
    studentId: string;
  } | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetResult, setResetResult] =
    useState<ResetStudentPasswordResponse | null>(null);
  const [admitForm, setAdmitForm] = useState({
    academicYear: String(new Date().getFullYear()),
    classId: "",
    sectionId: "",
    shift: "MORNING" as "MORNING" | "DAY" | "EVENING",
    residentialType: "NON_RESIDENTIAL" as ResidentialType,
    studentName: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "FATHER",
    guardianEmail: "",
    academicGroup: "" as "" | AcademicGroup,
    quranWing: "" as "" | HefzWing,
    ustadId: "",
    rollNumber: "",
    concessionType: "" as "" | StudentConcessionType,
    concessionMode: "PERCENTAGE" as DiscountMode,
    concessionValue: "",
    concessionReason: "",
  });

  const { data, isLoading, isError, error, refetch } = useStudents(schoolId, {
    page,
    limit: 15,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const { data: classes = [] } = useClasses(canAdmit ? schoolId : 0);
  const { data: sections = [] } = useSections(canAdmit ? schoolId : 0);
  const { data: teachers = [] } = useTeachers(canAdmit ? schoolId : 0);

  const createMutation = useCreateStudent(schoolId);
  const deactivateMutation = useDeactivateStudent(schoolId);
  const activateMutation = useActivateStudent(schoolId);
  const resetPasswordMutation = useResetStudentPassword(schoolId);

  const selectedClass = classes.find((c) => c.id === Number(admitForm.classId));
  const filteredSections = sections.filter(
    (sec) => admitForm.classId && sec.classId === Number(admitForm.classId),
  );
  const showAcademicGroup = isSeniorClass(
    selectedClass?.name,
    selectedClass?.code,
  );

  const handleQuickAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createMutation.mutateAsync({
        academicYear: admitForm.academicYear.trim(),
        classId: Number(admitForm.classId),
        ...(admitForm.sectionId
          ? { sectionId: Number(admitForm.sectionId) }
          : {}),
        shift: admitForm.shift,
        residentialType: admitForm.residentialType,
        studentName: admitForm.studentName.trim(),
        dateOfBirth: admitForm.dateOfBirth,
        gender: admitForm.gender,
        guardianName: admitForm.guardianName.trim(),
        guardianPhone: admitForm.guardianPhone.trim(),
        guardianRelation: admitForm.guardianRelation,
        ...(admitForm.guardianEmail.trim()
          ? { guardianEmail: admitForm.guardianEmail.trim() }
          : {}),
        ...(showAcademicGroup && admitForm.academicGroup
          ? { academicGroup: admitForm.academicGroup }
          : {}),
        ...(admitForm.quranWing ? { quranWing: admitForm.quranWing } : {}),
        ...(admitForm.quranWing && admitForm.ustadId
          ? { ustadId: Number(admitForm.ustadId) }
          : {}),
        ...(admitForm.rollNumber
          ? { rollNumber: Number(admitForm.rollNumber) }
          : {}),
        ...(admitForm.concessionType
          ? {
              concessionType: admitForm.concessionType,
              concessionMode: admitForm.concessionMode,
              ...(admitForm.concessionValue.trim() !== ""
                ? { concessionValue: Number(admitForm.concessionValue) }
                : {}),
              ...(admitForm.concessionReason.trim()
                ? { concessionReason: admitForm.concessionReason.trim() }
                : {}),
            }
          : {}),
      });

      if (res.guardian?.isExistingGuardian) {
        toast.info(
          `Linked to existing guardian ${res.guardian.name} (${res.guardian.phone})`,
        );
      } else if (
        res.guardian &&
        (res.guardian.temporaryPassword || res.guardian.defaultPassword)
      ) {
        setGuardianCredentials({
          name: res.guardian.name,
          phone: res.guardian.phone,
          temporaryPassword:
            res.guardian.temporaryPassword ?? res.guardian.defaultPassword!,
          studentName: admitForm.studentName.trim(),
        });
      }

      setQuickAdmitOpen(false);
      setAdmitForm((prev) => ({
        ...prev,
        studentName: "",
        dateOfBirth: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
        academicGroup: "",
        quranWing: "",
        ustadId: "",
        rollNumber: "",
        concessionType: "",
        concessionMode: "PERCENTAGE",
        concessionValue: "",
        concessionReason: "",
      }));
    } catch {
      // Handled via mutation toast
    }
  };

  const handleResetStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    try {
      const res = await resetPasswordMutation.mutateAsync({
        studentId: resetTarget.id,
        ...(resetPasswordVal.trim()
          ? { newPassword: resetPasswordVal.trim() }
          : {}),
      });
      setResetTarget(null);
      setResetPasswordVal("");
      setResetResult(res);
    } catch {
      // Handled via mutation toast
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  if (isLoading) return <LoadingState message="Loading students..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load students")}
        onRetry={() => refetch()}
      />
    );
  }

  const students = data?.students ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Active students enrolled in your institution (
            {pagination?.total ?? students.length} total).
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, ID, phone..."
              className="h-10 rounded-[11px] pl-9 sm:h-9"
            />
          </div>

          {canAdmit && (
            <>
              <Link
                href={`${user?.role === "MANAGER" ? "/dashboard/manager/reports" : "/dashboard/admin/reports"}?tab=roster`}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[11px] border bg-background px-3.5 text-sm font-medium hover:bg-muted sm:min-h-0 sm:h-9"
              >
                <FileDown className="h-4 w-4 text-primary" />
                Roster / PDF
              </Link>
              <Button
                onClick={() => setQuickAdmitOpen(true)}
                className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Quick Admit Student
              </Button>
            </>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Use Quick Admit Student for instant walk-in onboarding, or approve online admissions."
        />
      ) : (
        <>
          {/* Mobile Student Cards */}
          <div className="space-y-2.5 md:hidden">
            {students.map((s) => {
              const activeEnroll = s.enrollments?.[0];
              const primaryGuardian =
                s.guardians?.find((g) => g.isPrimary)?.guardian ??
                s.guardians?.[0]?.guardian;

              return (
                <div key={s.id} className="mobile-card space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`${profileBasePath}/${s.id}`}
                        className="block truncate text-sm font-semibold text-primary hover:underline"
                      >
                        {s.firstName} {s.lastName ?? ""}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {s.studentId}
                      </p>
                      {s.concessionType && (
                        <span className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {CONCESSION_SHORT[s.concessionType]}
                          {s.concessionValue != null &&
                          Number(s.concessionValue) > 0
                            ? s.concessionMode === "FIXED"
                              ? ` · ৳${Number(s.concessionValue)}`
                              : ` · ${Number(s.concessionValue)}%`
                            : ""}
                        </span>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        s.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase">Class</span>
                      <span className="font-medium text-foreground">
                        {activeEnroll?.class?.name ?? "Unassigned"}
                        {activeEnroll?.section
                          ? ` • ${activeEnroll.section.name}`
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase">
                        Guardian
                      </span>
                      <span className="font-medium text-foreground">
                        {primaryGuardian?.user.phone ??
                          s.phone ??
                          s.user?.phone ??
                          "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t pt-2.5">
                    <Link
                      href={`${profileBasePath}/${s.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-[40px] w-full gap-1 rounded-[11px]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Open Profile
                      </Button>
                    </Link>
                    {isAdmin && s.user && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setResetTarget({
                            id: s.id,
                            name: `${s.firstName} ${s.lastName ?? ""}`.trim(),
                            studentId: s.studentId,
                          })
                        }
                        className="min-h-[40px] gap-1 rounded-[11px]"
                        title="Reset Password"
                      >
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Reset Password
                      </Button>
                    )}
                    {isAdmin &&
                      (s.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deactivateMutation.mutate(s.id)}
                          disabled={deactivateMutation.isPending}
                          className="min-h-[40px] gap-1 rounded-[11px] text-destructive hover:text-destructive"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activateMutation.mutate(s.id)}
                          disabled={activateMutation.isPending}
                          className="min-h-[40px] gap-1 rounded-[11px]"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Students Table */}
          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class &amp; Type</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => {
                  const activeEnroll = s.enrollments?.[0];
                  const primaryGuardian =
                    s.guardians?.find((g) => g.isPrimary)?.guardian ??
                    s.guardians?.[0]?.guardian;

                  return (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {s.studentId}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`${profileBasePath}/${s.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {s.firstName} {s.lastName ?? ""}
                        </Link>
                        {s.nameBangla && (
                          <p className="text-xs text-muted-foreground">
                            {s.nameBangla}
                          </p>
                        )}
                        {s.concessionType && (
                          <span className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            {CONCESSION_SHORT[s.concessionType]}
                            {s.concessionValue != null &&
                            Number(s.concessionValue) > 0
                              ? s.concessionMode === "FIXED"
                                ? ` · ৳${Number(s.concessionValue)}`
                                : ` · ${Number(s.concessionValue)}%`
                              : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium">
                          {activeEnroll?.class?.name ?? "Unassigned"}
                          {activeEnroll?.section
                            ? ` • ${activeEnroll.section.name}`
                            : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {(s.residentialType ?? "NON_RESIDENTIAL").replace(
                            "_",
                            " ",
                          )}
                          {s.quranWing ? ` • ${s.quranWing}` : ""}
                          {s.academicGroup ? ` • ${s.academicGroup}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {primaryGuardian?.user.name ?? "—"}
                        </p>
                        <p>
                          {primaryGuardian?.user.phone ??
                            s.phone ??
                            s.user?.phone ??
                            "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            s.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link href={`${profileBasePath}/${s.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Profile
                            </Button>
                          </Link>
                          {isAdmin && s.user && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setResetTarget({
                                  id: s.id,
                                  name: `${s.firstName} ${s.lastName ?? ""}`.trim(),
                                  studentId: s.studentId,
                                })
                              }
                              className="gap-1"
                            >
                              <LockKeyhole className="h-3.5 w-3.5" />
                              Reset Password
                            </Button>
                          )}
                          {isAdmin &&
                            (s.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deactivateMutation.mutate(s.id)}
                                disabled={deactivateMutation.isPending}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => activateMutation.mutate(s.id)}
                                disabled={activateMutation.isPending}
                                className="gap-1"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Activate
                              </Button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Stage 1 — Quick Admission Modal */}
      <Modal
        open={quickAdmitOpen}
        onClose={() => setQuickAdmitOpen(false)}
        title="Quick Admit Student (Stage 1)"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleQuickAdmit} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Fast walk-in admission: creates Student, Class Enrollment, and links
            or creates the Guardian account by phone. Full profile details can
            be completed anytime later.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Session / Year *</Label>
              <Input
                required
                value={admitForm.academicYear}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, academicYear: e.target.value })
                }
                placeholder="2026"
              />
            </div>
            <div className="space-y-1">
              <Label>Class *</Label>
              <select
                required
                value={admitForm.classId}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    classId: e.target.value,
                    sectionId: "",
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Section (Optional)</Label>
              <select
                value={admitForm.sectionId}
                disabled={!admitForm.classId}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, sectionId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60"
              >
                <option value="">None</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Student Full Name *</Label>
              <Input
                required
                value={admitForm.studentName}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, studentName: e.target.value })
                }
                placeholder="e.g. Abdullah Al Mamun"
              />
            </div>
            <div className="space-y-1">
              <Label>Gender *</Label>
              <select
                required
                value={admitForm.gender}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    gender: e.target.value as "MALE" | "FEMALE" | "OTHER",
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Date of Birth *</Label>
              <Input
                required
                type="date"
                value={admitForm.dateOfBirth}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Residential Type *</Label>
              <select
                required
                value={admitForm.residentialType}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    residentialType: e.target.value as ResidentialType,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="NON_RESIDENTIAL">Non-Residential (Day)</option>
                <option value="RESIDENTIAL">Residential (Hostel)</option>
                <option value="DAY_CARE">Day-Care</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Shift</Label>
              <select
                value={admitForm.shift}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    shift: e.target.value as "MORNING" | "DAY" | "EVENING",
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="MORNING">Morning</option>
                <option value="DAY">Day</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 border-t pt-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Guardian Name *</Label>
              <Input
                required
                value={admitForm.guardianName}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, guardianName: e.target.value })
                }
                placeholder="Father / Mother / Guardian"
              />
            </div>
            <div className="space-y-1">
              <Label>Guardian Phone *</Label>
              <Input
                required
                value={admitForm.guardianPhone}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, guardianPhone: e.target.value })
                }
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label>Relation</Label>
              <select
                value={admitForm.guardianRelation}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    guardianRelation: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="LOCAL_GUARDIAN">Local Guardian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 border-t pt-3 sm:grid-cols-3">
            {showAcademicGroup && (
              <div className="space-y-1">
                <Label>Group (Class 9–10)</Label>
                <select
                  value={admitForm.academicGroup}
                  onChange={(e) =>
                    setAdmitForm({
                      ...admitForm,
                      academicGroup: e.target.value as "" | AcademicGroup,
                    })
                  }
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select group...</option>
                  <option value="SCIENCE">Science</option>
                  <option value="ARTS">Arts</option>
                  <option value="COMMERCE">Commerce</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label>Quran / Hefz Wing (Optional)</Label>
              <select
                value={admitForm.quranWing}
                onChange={(e) =>
                  setAdmitForm({
                    ...admitForm,
                    quranWing: e.target.value as "" | HefzWing,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">None / General</option>
                <option value="NOORANI">Noorani</option>
                <option value="QAIDA">Qaida</option>
                <option value="AMPARA">Ampara</option>
                <option value="NAJERA">Najera</option>
                <option value="HEFZ">Hefz</option>
              </select>
            </div>

            {admitForm.quranWing && (
              <div className="space-y-1">
                <Label>Assign Ustad (Optional)</Label>
                <select
                  value={admitForm.ustadId}
                  onChange={(e) =>
                    setAdmitForm({ ...admitForm, ustadId: e.target.value })
                  }
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Assign later...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName ?? ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label>Roll No. (Optional)</Label>
              <Input
                type="number"
                min={1}
                value={admitForm.rollNumber}
                onChange={(e) =>
                  setAdmitForm({ ...admitForm, rollNumber: e.target.value })
                }
                placeholder="Auto / later"
              />
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3">
            <p className="mb-2 text-xs font-semibold text-emerald-900">
              বৃত্তি / এতিম / লিল্লাহ ছাড় (Optional Fee Concession)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Concession Type</Label>
                <select
                  value={admitForm.concessionType}
                  onChange={(e) => {
                    const val = e.target.value as "" | StudentConcessionType;
                    setAdmitForm((prev) => ({
                      ...prev,
                      concessionType: val,
                      concessionValue:
                        val && !prev.concessionValue
                          ? val === "ORPHAN" || val === "LILLAH"
                            ? "100"
                            : "25"
                          : prev.concessionValue,
                    }));
                  }}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">None (কোনো ছাড় নেই)</option>
                  <option value="ORPHAN">এতিম (Orphan)</option>
                  <option value="LILLAH">লিল্লাহ (Lillah)</option>
                  <option value="SIBLING">ভাই-বোন (Sibling)</option>
                  <option value="SCHOLARSHIP">বৃত্তি (Scholarship)</option>
                  <option value="CUSTOM">বিশেষ ছাড় (Custom)</option>
                </select>
              </div>
              {admitForm.concessionType && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Mode</Label>
                    <select
                      value={admitForm.concessionMode}
                      onChange={(e) =>
                        setAdmitForm({
                          ...admitForm,
                          concessionMode: e.target.value as DiscountMode,
                        })
                      }
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed (৳)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {admitForm.concessionMode === "FIXED"
                        ? "Amount (৳)"
                        : "Percent (%)"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={admitForm.concessionMode === "FIXED" ? 999999 : 100}
                      step="0.01"
                      value={admitForm.concessionValue}
                      onChange={(e) =>
                        setAdmitForm({
                          ...admitForm,
                          concessionValue: e.target.value,
                        })
                      }
                      placeholder={
                        admitForm.concessionMode === "FIXED" ? "500" : "100"
                      }
                    />
                  </div>
                </>
              )}
            </div>
            {admitForm.concessionType && (
              <div className="mt-2 space-y-1">
                <Label className="text-xs">Concession Note (Optional)</Label>
                <Input
                  value={admitForm.concessionReason}
                  onChange={(e) =>
                    setAdmitForm({
                      ...admitForm,
                      concessionReason: e.target.value,
                    })
                  }
                  placeholder="যেমন: এতিম শিক্ষার্থী — সম্পূর্ণ ফ্রি"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickAdmitOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? "Admitting..."
                : "Complete Quick Admission"}
            </Button>
          </div>
        </form>
      </Modal>

      <GuardianCredentialsModal
        credentials={guardianCredentials}
        onClose={() => setGuardianCredentials(null)}
      />

      {/* Reset Student Password Modal */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setResetPasswordVal("");
        }}
        title={
          resetTarget
            ? `Reset Password — ${resetTarget.name}`
            : "Reset Student Password"
        }
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleResetStudentPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              New Password (Optional — leave blank to auto-generate)
            </Label>
            <Input
              type="password"
              minLength={6}
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                setResetPasswordVal("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Temporary Password Confirmation Modal */}
      <Modal
        open={!!resetResult}
        onClose={() => setResetResult(null)}
        title="Student Password Reset — Save Temporary Password"
        maxWidthClass="max-w-md"
      >
        {resetResult && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Share these credentials securely with{" "}
              <strong className="text-foreground">{resetResult.name}</strong>.
              This temporary password is shown only once.
            </p>

            <div className="space-y-2.5 rounded-[11px] border bg-muted/30 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-mono font-semibold">
                  {resetResult.studentCode}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{resetResult.email}</span>
              </div>
              {resetResult.phone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{resetResult.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t pt-2">
                <span className="text-muted-foreground">Temp Password</span>
                <div className="flex items-center gap-1.5">
                  <code className="rounded bg-background px-2 py-0.5 font-mono text-sm font-bold text-primary">
                    {resetResult.temporaryPassword}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyText(
                        resetResult.temporaryPassword,
                        "Temporary password",
                      )
                    }
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setResetResult(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
