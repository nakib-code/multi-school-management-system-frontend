"use client";

import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileDown,
  Layers,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { triggerSheetPdfPrint } from "@/components/shared/printable-report-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveClasses,
  useActiveSections,
  useClassFeeStructures,
} from "@/features/admin/classes/hooks";
import { useEnrollments } from "@/features/enrollments/hooks";
import { useExams } from "@/features/exams/hooks";
import {
  useBulkCreateStudentFees,
  useCreateStudentFee,
  useDeleteStudentFee,
  useRejectStudentPayment,
  useStudentFees,
  useStudentPayments,
  useSubmitStudentPayment,
  useUpdateStudentFee,
  useVerifyStudentPayment,
} from "@/features/fees/hooks";
import {
  ALL_FEE_TYPES,
  type FeeStatus,
  type FeeType,
  type StudentFeeRecord,
  type StudentPaymentMethod,
  type StudentPaymentRecord,
} from "@/features/fees/types";
import { useSchoolPaymentMethods } from "@/features/school-settings/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  PERSONAL: "Send Money",
  MERCHANT: "Make Payment",
  AGENT: "Cash Out",
};

const getFeeBadgeClass = (status: string) => {
  switch (status) {
    case "PAID":
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PARTIAL":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "OVERDUE":
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    case "WAIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

export function FeesWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";
  const isGuardian = user?.role === "GUARDIAN";
  const isStudent = user?.role === "STUDENT";

  const [tab, setTab] = useState<"fees" | "payments">("fees");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");
  const [studentFilter, setStudentFilter] = useState<string>("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editFee, setEditFee] = useState<StudentFeeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentFeeRecord | null>(
    null,
  );
  const [payFee, setPayFee] = useState<StudentFeeRecord | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [receiptPayment, setReceiptPayment] =
    useState<StudentPaymentRecord | null>(null);

  const [feeForm, setFeeForm] = useState({
    enrollmentId: "",
    feeType: "MONTHLY" as FeeType,
    title: "",
    amount: "",
    dueDate: "",
    billingMonth: "",
    examId: "",
    description: "",
  });

  const [bulkForm, setBulkForm] = useState({
    classId: "",
    sectionId: "",
    academicYear: String(new Date().getFullYear()),
    feeType: "MONTHLY" as FeeType,
    title: "",
    amount: "",
    dueDate: "",
    billingMonth: "",
    examId: "",
    description: "",
  });

  const [editFeeForm, setEditFeeForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    status: "PENDING" as FeeStatus,
    description: "",
  });

  const [payForm, setPayForm] = useState({
    paymentMethod: "BKASH" as StudentPaymentMethod,
    senderNumber: "",
    trxId: "",
    paidAmount: "",
    remarks: "",
  });

  const feesQuery = useStudentFees(schoolId);
  const paymentsQuery = useStudentPayments(schoolId);
  const { data: schoolPaymentMethods } = useSchoolPaymentMethods(
    schoolId > 0 ? schoolId : undefined,
  );
  const { data: enrollments = [] } = useEnrollments(canManage ? schoolId : 0);
  const { data: activeClasses = [] } = useActiveClasses(
    canManage ? schoolId : 0,
  );
  const selectedBulkClassId = Number(bulkForm.classId) || undefined;
  const { data: activeSections = [] } = useActiveSections(
    canManage ? schoolId : 0,
    selectedBulkClassId,
  );
  const { data: filterSections = [] } = useActiveSections(
    canManage ? schoolId : 0,
    classFilter !== "ALL" ? Number(classFilter) : undefined,
  );
  const { data: classFeeStructures } = useClassFeeStructures(
    canManage ? schoolId : 0,
  );
  const { data: exams = [] } = useExams(canManage ? schoolId : 0);

  const resolveClassDefaultFee = useCallback(
    (
      classId: number | undefined,
      ft: FeeType,
      academicYear?: string,
    ): number | null => {
      if (!classId || !classFeeStructures) return null;
      const cls = classFeeStructures.classes.find((c) => c.id === classId);
      if (!cls) return null;
      const year = academicYear?.trim() || null;
      const exact = year
        ? cls.feeStructures.find(
            (s) => s.feeType === ft && s.academicYear === year,
          )
        : undefined;
      const fallback = cls.feeStructures.find(
        (s) => s.feeType === ft && s.academicYear === null,
      );
      const hit = exact ?? fallback;
      if (hit) return hit.amount;
      if (ft === "ADMISSION") return cls.resolvedAdmissionFee;
      return null;
    },
    [classFeeStructures],
  );

  // Auto-fill amount in Bulk modal when class or feeType changes (clear if no default)
  useEffect(() => {
    if (!bulkOpen || !bulkForm.classId) return;
    const resolved = resolveClassDefaultFee(
      Number(bulkForm.classId),
      bulkForm.feeType,
      bulkForm.academicYear,
    );
    setBulkForm((prev) => ({
      ...prev,
      amount: resolved !== null && resolved > 0 ? String(resolved) : "",
    }));
  }, [
    bulkOpen,
    bulkForm.classId,
    bulkForm.feeType,
    bulkForm.academicYear,
    resolveClassDefaultFee,
  ]);

  // Auto-fill amount in Single modal when enrollment or feeType changes (clear if no default)
  useEffect(() => {
    if (!createOpen || !feeForm.enrollmentId) return;
    const en = enrollments.find((e) => e.id === Number(feeForm.enrollmentId));
    if (!en) return;
    const resolved = resolveClassDefaultFee(
      en.classId,
      feeForm.feeType,
      en.academicYear,
    );
    setFeeForm((prev) => ({
      ...prev,
      amount: resolved !== null && resolved > 0 ? String(resolved) : "",
    }));
  }, [
    createOpen,
    feeForm.enrollmentId,
    feeForm.feeType,
    enrollments,
    resolveClassDefaultFee,
  ]);

  const createFeeMut = useCreateStudentFee(schoolId);
  const bulkCreateFeeMut = useBulkCreateStudentFees(schoolId);
  const updateFeeMut = useUpdateStudentFee(schoolId);
  const deleteFeeMut = useDeleteStudentFee(schoolId);
  const submitPayMut = useSubmitStudentPayment(schoolId);
  const verifyPayMut = useVerifyStudentPayment(schoolId);
  const rejectPayMut = useRejectStudentPayment(schoolId);

  const fees = feesQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const nowStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Compute paid, remaining, pending & overdue metadata per fee
  const enrichedFees = useMemo(() => {
    return fees.map((f) => {
      const feeAmount = Number(f.amount);
      const feePayments = f.payments ?? [];
      const verifiedPaid = feePayments
        .filter((p) => p.status === "VERIFIED")
        .reduce((sum, p) => sum + Number(p.paidAmount), 0);
      const effectivePaid =
        f.status === "PAID"
          ? Math.max(feeAmount, verifiedPaid)
          : f.status === "WAIVED"
            ? 0
            : Math.min(feeAmount, verifiedPaid);
      const hasPendingPayment = feePayments.some((p) => p.status === "PENDING");
      const remaining =
        f.status === "WAIVED" || f.status === "PAID"
          ? 0
          : Math.max(0, feeAmount - verifiedPaid);
      const isOverdue =
        f.status !== "PAID" &&
        f.status !== "WAIVED" &&
        remaining > 0 &&
        new Date(f.dueDate).getTime() < nowStart;

      return {
        ...f,
        feeAmount,
        verifiedPaid: effectivePaid,
        remaining,
        hasPendingPayment,
        isOverdue,
        displayStatus: isOverdue ? "OVERDUE" : f.status,
      };
    });
  }, [fees, nowStart]);

  const studentOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const f of fees) {
      if (f.student && !map.has(f.studentId)) {
        map.set(
          f.studentId,
          `${f.student.firstName} ${f.student.lastName ?? ""}`.trim(),
        );
      }
    }
    return [...map.entries()];
  }, [fees]);

  const kpis = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let overdueCount = 0;
    for (const f of enrichedFees) {
      if (f.status !== "WAIVED") {
        totalBilled += f.feeAmount;
        totalPaid += Math.min(f.feeAmount, f.verifiedPaid);
        totalDue += f.remaining;
      }
      if (f.isOverdue) overdueCount += 1;
    }
    const pendingPaymentsCount = payments.filter(
      (p) => p.status === "PENDING",
    ).length;
    return {
      totalBilled,
      totalPaid,
      totalDue,
      overdueCount,
      pendingPaymentsCount,
    };
  }, [enrichedFees, payments]);

  const filteredFees = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return enrichedFees.filter((f) => {
      if (studentFilter !== "ALL" && String(f.studentId) !== studentFilter) {
        return false;
      }
      if (feeTypeFilter !== "ALL" && f.feeType !== feeTypeFilter) {
        return false;
      }
      if (
        classFilter !== "ALL" &&
        String(f.enrollment?.classId ?? f.enrollment?.class?.id ?? "") !==
          classFilter
      ) {
        return false;
      }
      if (
        sectionFilter !== "ALL" &&
        String(f.enrollment?.sectionId ?? f.enrollment?.section?.id ?? "") !==
          sectionFilter
      ) {
        return false;
      }
      if (statusFilter === "OVERDUE" && !f.isOverdue) return false;
      if (
        statusFilter !== "ALL" &&
        statusFilter !== "OVERDUE" &&
        f.status !== statusFilter
      ) {
        return false;
      }
      if (!q) return true;
      const studentName = f.student
        ? `${f.student.firstName} ${f.student.lastName ?? ""} ${f.student.studentId}`.toLowerCase()
        : "";
      return (
        f.title.toLowerCase().includes(q) ||
        f.feeType.toLowerCase().includes(q) ||
        studentName.includes(q)
      );
    });
  }, [
    enrichedFees,
    searchText,
    statusFilter,
    feeTypeFilter,
    classFilter,
    sectionFilter,
    studentFilter,
  ]);

  const filteredPayments = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return payments.filter((p) => {
      if (studentFilter !== "ALL" && String(p.studentId) !== studentFilter) {
        return false;
      }
      if (!q) return true;
      const studentName = p.student
        ? `${p.student.firstName} ${p.student.lastName ?? ""}`.toLowerCase()
        : "";
      return (
        p.trxId.toLowerCase().includes(q) ||
        p.senderNumber.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        (p.fee?.title ?? "").toLowerCase().includes(q) ||
        studentName.includes(q)
      );
    });
  }, [payments, searchText, studentFilter]);

  const mfsProviders = useMemo(
    () => [
      {
        method: "BKASH" as const,
        label: "bKash",
        number: schoolPaymentMethods?.bkashNumber ?? null,
        type: schoolPaymentMethods?.bkashType ?? "PERSONAL",
      },
      {
        method: "NAGAD" as const,
        label: "Nagad",
        number: schoolPaymentMethods?.nagadNumber ?? null,
        type: schoolPaymentMethods?.nagadType ?? "PERSONAL",
      },
      {
        method: "ROCKET" as const,
        label: "Rocket",
        number: schoolPaymentMethods?.rocketNumber ?? null,
        type: schoolPaymentMethods?.rocketType ?? "PERSONAL",
      },
    ],
    [schoolPaymentMethods],
  );

  if (feesQuery.isLoading)
    return <LoadingState message="Loading fees & payments..." />;
  if (feesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(feesQuery.error, "Failed to load fees")}
        onRetry={() => feesQuery.refetch()}
      />
    );
  }

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const openPayModal = (
    fee: StudentFeeRecord,
    remainingBalance: number,
    defaultMethod?: StudentPaymentMethod,
  ) => {
    const firstConfigured =
      mfsProviders.find((p) => Boolean(p.number))?.method ??
      (canManage ? "CASH" : "BKASH");
    setPayFee(fee);
    setPayForm({
      paymentMethod: defaultMethod ?? firstConfigured,
      senderNumber: "",
      trxId: "",
      paidAmount: String(
        remainingBalance > 0 ? remainingBalance : Number(fee.amount),
      ),
      remarks: "",
    });
  };

  const hasConfiguredMfs = mfsProviders.some((p) => Boolean(p.number));

  const resetFeeForm = () => {
    setFeeForm({
      enrollmentId: "",
      feeType: "MONTHLY",
      title: "",
      amount: "",
      dueDate: "",
      billingMonth: "",
      examId: "",
      description: "",
    });
  };

  const resetBulkForm = () => {
    setBulkForm({
      classId: "",
      sectionId: "",
      academicYear: String(new Date().getFullYear()),
      feeType: "MONTHLY",
      title: "",
      amount: "",
      dueDate: "",
      billingMonth: "",
      examId: "",
      description: "",
    });
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    resetFeeForm();
  };

  const closeBulkModal = () => {
    setBulkOpen(false);
    resetBulkForm();
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const en = enrollments.find(
      (item) => item.id === Number(feeForm.enrollmentId),
    );
    if (!en) return;
    try {
      await createFeeMut.mutateAsync({
        studentId: en.studentId,
        enrollmentId: en.id,
        feeType: feeForm.feeType,
        title: feeForm.title.trim(),
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        ...(feeForm.feeType === "MONTHLY" && feeForm.billingMonth
          ? { billingMonth: feeForm.billingMonth }
          : {}),
        ...(feeForm.feeType === "EXAM" && feeForm.examId
          ? { examId: Number(feeForm.examId) }
          : {}),
        ...(feeForm.description.trim()
          ? { description: feeForm.description.trim() }
          : {}),
      });
      closeCreateModal();
    } catch {
      // Handled by mutation toast
    }
  };

  const handleBulkCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkForm.classId) return;
    try {
      await bulkCreateFeeMut.mutateAsync({
        classId: Number(bulkForm.classId),
        ...(bulkForm.sectionId
          ? { sectionId: Number(bulkForm.sectionId) }
          : {}),
        ...(bulkForm.academicYear.trim()
          ? { academicYear: bulkForm.academicYear.trim() }
          : {}),
        feeType: bulkForm.feeType,
        title: bulkForm.title.trim(),
        amount: Number(bulkForm.amount),
        dueDate: bulkForm.dueDate,
        ...(bulkForm.feeType === "MONTHLY" && bulkForm.billingMonth
          ? { billingMonth: bulkForm.billingMonth }
          : {}),
        ...(bulkForm.feeType === "EXAM" && bulkForm.examId
          ? { examId: Number(bulkForm.examId) }
          : {}),
        ...(bulkForm.description.trim()
          ? { description: bulkForm.description.trim() }
          : {}),
      });
      closeBulkModal();
    } catch {
      // Handled by mutation toast
    }
  };

  const openEditFee = (fee: StudentFeeRecord) => {
    setEditFee(fee);
    setEditFeeForm({
      title: fee.title,
      amount: String(fee.amount),
      dueDate: fee.dueDate
        ? new Date(fee.dueDate).toISOString().slice(0, 10)
        : "",
      status: fee.status,
      description: fee.description ?? "",
    });
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFee) return;
    try {
      await updateFeeMut.mutateAsync({
        id: editFee.id,
        payload: {
          title: editFeeForm.title.trim(),
          amount: Number(editFeeForm.amount),
          dueDate: editFeeForm.dueDate,
          status: editFeeForm.status,
          description: editFeeForm.description.trim() || null,
        },
      });
      setEditFee(null);
    } catch {
      // Handled by mutation toast
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeeMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Handled by mutation toast
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFee) return;
    const isCash = payForm.paymentMethod === "CASH";
    try {
      await submitPayMut.mutateAsync({
        studentId: payFee.studentId,
        feeId: payFee.id,
        paymentMethod: payForm.paymentMethod,
        ...(!isCash
          ? {
              senderNumber: payForm.senderNumber.trim(),
              trxId: payForm.trxId.trim().toUpperCase(),
            }
          : {}),
        paidAmount: Number(payForm.paidAmount || payFee.amount),
        ...(payForm.remarks.trim() ? { remarks: payForm.remarks.trim() } : {}),
      });
      setPayFee(null);
    } catch {
      // Handled by mutation toast
    }
  };

  const handleReject = async () => {
    if (!rejectId || rejectReason.trim().length < 3) return;
    try {
      await rejectPayMut.mutateAsync({
        id: rejectId,
        rejectionReason: rejectReason.trim(),
      });
      setRejectId(null);
      setRejectReason("");
    } catch {
      // Handled by mutation toast
    }
  };

  const heading = isGuardian
    ? "My Children's Fees & Payments"
    : isStudent
      ? "My Fees & Payments"
      : "Student Fees & Collections";
  const subheading = isGuardian
    ? "View tuition invoices, submit bKash/Nagad/Rocket payments, and print verified receipts."
    : isStudent
      ? "Track your fee invoices, remaining balance, and payment verification status."
      : "Issue individual or class-wide invoices, record counter cash, and verify mobile banking payments.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`${user?.role === "MANAGER" ? "/dashboard/manager/reports" : "/dashboard/admin/reports"}?tab=fees`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
            >
              <FileDown className="h-4 w-4 text-primary" />
              Class Chart / PDF
            </Link>
            <Button
              variant="outline"
              onClick={() => setBulkOpen(true)}
              className="gap-1.5"
            >
              <Layers className="h-4 w-4" />
              Bulk Generate Class Fees
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Fee Invoice
            </Button>
          </div>
        )}
      </div>

      {/* KPI Summary Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Total Billed
          </p>
          <p className="mt-1 text-2xl font-bold">
            ৳{kpis.totalBilled.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Total Paid
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            ৳{kpis.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Remaining Due
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            ৳{kpis.totalDue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {canManage ? "Pending Reviews / Overdue" : "Overdue / Pending"}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {canManage ? (
              <>
                <span
                  className={
                    kpis.pendingPaymentsCount > 0 ? "text-amber-600" : ""
                  }
                >
                  {kpis.pendingPaymentsCount}
                </span>
                <span className="mx-1.5 text-sm font-normal text-muted-foreground">
                  /
                </span>
                <span className={kpis.overdueCount > 0 ? "text-red-600" : ""}>
                  {kpis.overdueCount}
                </span>
              </>
            ) : (
              <>
                <span className={kpis.overdueCount > 0 ? "text-red-600" : ""}>
                  {kpis.overdueCount}
                </span>
                <span className="mx-1.5 text-sm font-normal text-muted-foreground">
                  /
                </span>
                <span
                  className={
                    kpis.pendingPaymentsCount > 0 ? "text-amber-600" : ""
                  }
                >
                  {kpis.pendingPaymentsCount}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Tabs + Search & Filters */}
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("fees")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "fees"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Fee Invoices ({filteredFees.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Payment Submissions ({filteredPayments.length})
            {kpis.pendingPaymentsCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                {kpis.pendingPaymentsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={
                tab === "fees"
                  ? "Search student or fee..."
                  : "Search TrxID, student..."
              }
              className="h-9 w-52 pl-8 text-sm"
            />
          </div>
          {studentOptions.length > 1 && (
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="ALL">All Students</option>
              {studentOptions.map(([id, name]) => (
                <option key={id} value={String(id)}>
                  {name}
                </option>
              ))}
            </select>
          )}
          {tab === "fees" && (
            <>
              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-2.5 text-sm"
              >
                <option value="ALL">All Fee Types</option>
                {ALL_FEE_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
              {canManage && activeClasses.length > 0 && (
                <>
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setSectionFilter("ALL");
                    }}
                    className="h-9 rounded-md border bg-background px-2.5 text-sm"
                  >
                    <option value="ALL">All Classes</option>
                    {activeClasses.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {classFilter !== "ALL" && filterSections.length > 0 && (
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="h-9 rounded-md border bg-background px-2.5 text-sm"
                    >
                      <option value="ALL">All Sections</option>
                      {filterSections.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-2.5 text-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PAID">Paid</option>
                <option value="WAIVED">Waived</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "fees" ? (
        filteredFees.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No matching fee invoices"
            description="Issued student tuition, exam, and other fees will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Fee Title</th>
                  <th className="px-4 py-3">Billed / Paid</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFees.map((f) => (
                  <tr
                    key={f.id}
                    className={f.isOverdue ? "bg-red-50/30" : undefined}
                  >
                    <td className="px-4 py-3 font-medium">
                      {f.student
                        ? `${f.student.firstName} ${f.student.lastName ?? ""}`
                        : `Student #${f.studentId}`}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{f.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.feeType}
                        {f.description ? ` • ${f.description}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        ৳{f.feeAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Paid: ৳{f.verifiedPaid.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {f.remaining > 0 ? (
                        <span className="text-amber-700">
                          ৳{f.remaining.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-700">৳0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={
                          f.isOverdue
                            ? "font-semibold text-red-600"
                            : "text-muted-foreground"
                        }
                      >
                        {new Date(f.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getFeeBadgeClass(f.displayStatus)}`}
                        >
                          {f.displayStatus}
                        </span>
                        {f.hasPendingPayment && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                            <Clock className="h-3 w-3" />
                            Review Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {f.status !== "PAID" && f.status !== "WAIVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPayModal(f, f.remaining)}
                            className="gap-1"
                          >
                            {canManage ? (
                              <Banknote className="h-3.5 w-3.5" />
                            ) : (
                              <Smartphone className="h-3.5 w-3.5" />
                            )}
                            {canManage ? "Record / Pay" : "Pay Now"}
                          </Button>
                        )}
                        {canManage && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditFee(f)}
                            title="Edit / Waive fee"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(f)}
                            className="text-destructive"
                            title="Delete fee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : paymentsQuery.isLoading ? (
        <LoadingState message="Loading payment submissions..." />
      ) : paymentsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            paymentsQuery.error,
            "Failed to load payment submissions",
          )}
          onRetry={() => paymentsQuery.refetch()}
        />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No payment submissions yet"
          description="Submitted bKash, Nagad, Rocket, and Cash payments will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student &amp; Fee</th>
                <th className="px-4 py-3">Method &amp; TrxID</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPayments.map((p) => {
                const parentFee = enrichedFees.find((f) => f.id === p.feeId);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">
                      {p.student
                        ? `${p.student.firstName} ${p.student.lastName ?? ""}`
                        : `Student #${p.studentId}`}
                      <p className="text-xs text-muted-foreground">
                        {p.fee?.title ?? ""}
                      </p>
                      {p.status === "REJECTED" && p.rejectionReason && (
                        <div className="mt-1.5 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>Rejected: {p.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{p.paymentMethod}</span>
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.trxId}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.senderNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ৳{Number(p.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getFeeBadgeClass(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {canManage && p.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => verifyPayMut.mutate(p.id)}
                              disabled={verifyPayMut.isPending}
                              className="gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectId(p.id)}
                              className="gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                        {p.status === "VERIFIED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReceiptPayment(p)}
                            className="h-8 gap-1 px-2.5 text-xs"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Receipt
                          </Button>
                        )}
                        {p.status === "REJECTED" &&
                          parentFee &&
                          parentFee.status !== "PAID" &&
                          parentFee.status !== "WAIVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openPayModal(
                                  parentFee,
                                  parentFee.remaining,
                                  p.paymentMethod === "CASH" && !canManage
                                    ? "BKASH"
                                    : p.paymentMethod,
                                )
                              }
                              className="h-8 gap-1 px-2.5 text-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Resubmit
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Single Fee Create Modal */}
      <Modal
        open={createOpen}
        onClose={closeCreateModal}
        title="Create Student Fee Invoice"
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div className="space-y-1">
            <Label>Enrolled Student</Label>
            <select
              required
              value={feeForm.enrollmentId}
              onChange={(e) =>
                setFeeForm({ ...feeForm, enrollmentId: e.target.value })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select enrollment...</option>
              {enrollments.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.student
                    ? `${en.student.firstName} ${en.student.lastName ?? ""} (${en.class?.name ?? ""})`
                    : `Enrollment #${en.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Fee Type</Label>
              <select
                value={feeForm.feeType}
                onChange={(e) => {
                  const nextType = e.target.value as FeeType;
                  setFeeForm({
                    ...feeForm,
                    feeType: nextType,
                    billingMonth:
                      nextType === "MONTHLY" ? feeForm.billingMonth : "",
                    examId: nextType === "EXAM" ? feeForm.examId : "",
                  });
                }}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {ALL_FEE_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Amount (BDT)</Label>
              <Input
                type="number"
                min={1}
                step="0.01"
                required
                value={feeForm.amount}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, amount: e.target.value })
                }
              />
            </div>
          </div>
          {(feeForm.feeType === "MONTHLY" || feeForm.feeType === "EXAM") && (
            <div className="grid gap-3 sm:grid-cols-2">
              {feeForm.feeType === "MONTHLY" && (
                <div className="space-y-1">
                  <Label>Billing Month (Optional)</Label>
                  <Input
                    type="month"
                    value={feeForm.billingMonth}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, billingMonth: e.target.value })
                    }
                  />
                </div>
              )}
              {feeForm.feeType === "EXAM" && (
                <div className="space-y-1">
                  <Label>Linked Exam (Optional)</Label>
                  <select
                    value={feeForm.examId}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, examId: e.target.value })
                    }
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select exam...</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                required
                placeholder="November Tuition Fee"
                value={feeForm.title}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                required
                value={feeForm.dueDate}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description (Optional)</Label>
            <Textarea
              rows={2}
              value={feeForm.description}
              onChange={(e) =>
                setFeeForm({ ...feeForm, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFeeMut.isPending}>
              {createFeeMut.isPending ? "Creating..." : "Create Fee"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Generate Class Fees Modal */}
      <Modal
        open={bulkOpen}
        onClose={closeBulkModal}
        title="Bulk Generate Class Fees"
        description="Automatically issue invoices to all active enrolled students in a class (existing duplicates are skipped)."
      >
        <form onSubmit={handleBulkCreateFee} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Class</Label>
              <select
                required
                value={bulkForm.classId}
                onChange={(e) =>
                  setBulkForm({
                    ...bulkForm,
                    classId: e.target.value,
                    sectionId: "",
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select class...</option>
                {activeClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Section (Optional)</Label>
              <select
                value={bulkForm.sectionId}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, sectionId: e.target.value })
                }
                disabled={!bulkForm.classId}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
              >
                <option value="">All sections</option>
                {activeSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                value={bulkForm.academicYear}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, academicYear: e.target.value })
                }
                placeholder="2026"
              />
            </div>
            <div className="space-y-1">
              <Label>Fee Type</Label>
              <select
                value={bulkForm.feeType}
                onChange={(e) => {
                  const nextType = e.target.value as FeeType;
                  setBulkForm({
                    ...bulkForm,
                    feeType: nextType,
                    billingMonth:
                      nextType === "MONTHLY" ? bulkForm.billingMonth : "",
                    examId: nextType === "EXAM" ? bulkForm.examId : "",
                  });
                }}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {ALL_FEE_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Amount (BDT)</Label>
              <Input
                type="number"
                min={1}
                step="0.01"
                required
                value={bulkForm.amount}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, amount: e.target.value })
                }
              />
            </div>
          </div>
          {(bulkForm.feeType === "MONTHLY" || bulkForm.feeType === "EXAM") && (
            <div className="grid gap-3 sm:grid-cols-2">
              {bulkForm.feeType === "MONTHLY" && (
                <div className="space-y-1">
                  <Label>Billing Month (Optional)</Label>
                  <Input
                    type="month"
                    value={bulkForm.billingMonth}
                    onChange={(e) =>
                      setBulkForm({
                        ...bulkForm,
                        billingMonth: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {bulkForm.feeType === "EXAM" && (
                <div className="space-y-1">
                  <Label>Linked Exam (Optional)</Label>
                  <select
                    value={bulkForm.examId}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, examId: e.target.value })
                    }
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select exam...</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Invoice Title</Label>
              <Input
                required
                placeholder="December 2026 Monthly Fee"
                value={bulkForm.title}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                required
                value={bulkForm.dueDate}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeBulkModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={bulkCreateFeeMut.isPending}>
              {bulkCreateFeeMut.isPending
                ? "Generating..."
                : "Generate Invoices"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Payment / Record Cash Modal */}
      <Modal
        open={Boolean(payFee)}
        onClose={() => setPayFee(null)}
        title={canManage ? "Record / Submit Fee Payment" : "Submit Fee Payment"}
        description={
          payFee
            ? `${payFee.title} — Invoice ৳${Number(payFee.amount).toLocaleString()}`
            : ""
        }
      >
        <form onSubmit={handlePaySubmit} className="space-y-4">
          {payForm.paymentMethod !== "CASH" && schoolPaymentMethods && (
            <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground">
                School Mobile Banking Receiver Numbers
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {mfsProviders.map((item) => (
                  <div
                    key={item.method}
                    className={`rounded-lg border bg-background p-2.5 text-left transition ${
                      !item.number
                        ? "opacity-50"
                        : payForm.paymentMethod === item.method
                          ? "border-primary ring-1 ring-primary"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!item.number}
                      onClick={() =>
                        item.number &&
                        setPayForm({ ...payForm, paymentMethod: item.method })
                      }
                      className="flex w-full items-center justify-between gap-1 text-left disabled:cursor-not-allowed"
                    >
                      <span className="text-xs font-semibold">
                        {item.label}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                        {ACCOUNT_TYPE_LABEL[item.type] ?? item.type}
                      </span>
                    </button>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <p className="font-mono text-[11px] text-foreground">
                        {item.number ?? "Not configured"}
                      </p>
                      {item.number && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopy(
                              item.number as string,
                              `${item.label} number`,
                            )
                          }
                          className="rounded border p-0.5 text-muted-foreground hover:bg-muted"
                          title={`Copy ${item.label}`}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {schoolPaymentMethods.feePaymentInstruction && (
                <p className="text-[11px] leading-4 text-muted-foreground">
                  {schoolPaymentMethods.feePaymentInstruction}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label>Payment Method</Label>
            <select
              value={payForm.paymentMethod}
              onChange={(e) =>
                setPayForm({
                  ...payForm,
                  paymentMethod: e.target.value as StudentPaymentMethod,
                })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {canManage && (
                <option value="CASH">
                  Cash (Office Counter — Instant Verified)
                </option>
              )}
              {mfsProviders.map((item) => (
                <option
                  key={item.method}
                  value={item.method}
                  disabled={!item.number && !canManage}
                >
                  {item.label}
                  {!item.number ? " (Not configured)" : ""}
                </option>
              ))}
            </select>
          </div>

          {payForm.paymentMethod !== "CASH" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Sender Number</Label>
                <Input
                  required
                  placeholder="01XXXXXXXXX"
                  value={payForm.senderNumber}
                  onChange={(e) =>
                    setPayForm({ ...payForm, senderNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Transaction ID (TrxID)</Label>
                <Input
                  required
                  placeholder="e.g. 9K2L8M4N"
                  className="font-mono uppercase"
                  value={payForm.trxId}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      trxId: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Paid Amount (BDT)</Label>
            <Input
              type="number"
              min={1}
              step="0.01"
              required
              value={payForm.paidAmount}
              onChange={(e) =>
                setPayForm({ ...payForm, paidAmount: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Remarks (Optional)</Label>
            <Textarea
              rows={2}
              placeholder={
                payForm.paymentMethod === "CASH"
                  ? "e.g. Received at accounts desk"
                  : "Optional note"
              }
              value={payForm.remarks}
              onChange={(e) =>
                setPayForm({ ...payForm, remarks: e.target.value })
              }
            />
          </div>

          {!canManage && !hasConfiguredMfs && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              No school mobile banking account is configured yet. Please contact
              the school office before submitting an online payment.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPayFee(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitPayMut.isPending || (!canManage && !hasConfiguredMfs)
              }
            >
              {submitPayMut.isPending
                ? "Processing..."
                : payForm.paymentMethod === "CASH"
                  ? "Record Cash Payment"
                  : "Submit Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Payment Modal */}
      <Modal
        open={Boolean(rejectId)}
        onClose={() => {
          setRejectId(null);
          setRejectReason("");
        }}
        title="Reject Student Payment"
      >
        <div className="space-y-4">
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejecting this TrxID (min 3 characters)..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleReject()}
              disabled={
                rejectReason.trim().length < 3 || rejectPayMut.isPending
              }
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Waive Fee Modal */}
      <Modal
        open={Boolean(editFee)}
        onClose={() => setEditFee(null)}
        title="Edit / Waive Student Fee"
      >
        <form onSubmit={handleUpdateFee} className="space-y-4">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              required
              value={editFeeForm.title}
              onChange={(e) =>
                setEditFeeForm({ ...editFeeForm, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Amount (BDT)</Label>
              <Input
                type="number"
                min={1}
                step="0.01"
                required
                value={editFeeForm.amount}
                onChange={(e) =>
                  setEditFeeForm({ ...editFeeForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={editFeeForm.status}
                onChange={(e) =>
                  setEditFeeForm({
                    ...editFeeForm,
                    status: e.target.value as FeeStatus,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PAID">Paid</option>
                <option value="WAIVED">Waived (Fee Forgiven)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Due Date</Label>
            <Input
              type="date"
              required
              value={editFeeForm.dueDate}
              onChange={(e) =>
                setEditFeeForm({ ...editFeeForm, dueDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Description / Notes (Optional)</Label>
            <Textarea
              rows={2}
              placeholder="Optional notes or waiver reason..."
              value={editFeeForm.description}
              onChange={(e) =>
                setEditFeeForm({ ...editFeeForm, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditFee(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateFeeMut.isPending}>
              {updateFeeMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Fee Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Fee Invoice"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? ""}" (৳${Number(deleteTarget?.amount ?? 0).toLocaleString()})?`}
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteFeeMut.isPending}
            onClick={() => void handleConfirmDelete()}
          >
            {deleteFeeMut.isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </Modal>

      {/* Printable Fee Receipt Modal */}
      <Modal
        open={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
        title="Fee Payment Receipt"
        description={`Official receipt #FEE-${receiptPayment?.id ?? ""}`}
      >
        {receiptPayment && (
          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <div className="border-b pb-2 text-center">
                <p className="text-base font-bold">
                  Official Fee Payment Receipt
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Receipt #FEE-{receiptPayment.id}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt No</span>
                <span className="font-mono font-semibold">
                  FEE-{receiptPayment.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">
                  {receiptPayment.student
                    ? `${receiptPayment.student.firstName} ${receiptPayment.student.lastName ?? ""} (${receiptPayment.student.studentId})`
                    : `Student #${receiptPayment.studentId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Invoice</span>
                <span className="font-medium">
                  {receiptPayment.fee?.title ?? `Fee #${receiptPayment.feeId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">
                  {receiptPayment.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TrxID / Ref</span>
                <span className="font-mono font-semibold">
                  {receiptPayment.trxId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>
                  {new Date(
                    receiptPayment.verifiedAt ?? receiptPayment.paidAt,
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Amount Paid</span>
                <span>
                  ৳{Number(receiptPayment.paidAmount).toLocaleString()} BDT
                </span>
              </div>
            </div>
            <div className="no-print flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReceiptPayment(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={triggerSheetPdfPrint}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dedicated Modal-Free Print Target for Fee Receipt (prevents fixed-modal clipping) */}
      {receiptPayment && (
        <div
          id="printable-sheet"
          className="print-only space-y-3 rounded-xl border p-6 text-sm"
        >
          <div className="border-b pb-3 text-center">
            <p className="text-lg font-bold">Official Fee Payment Receipt</p>
            <p className="font-mono text-xs text-muted-foreground">
              Receipt #FEE-{receiptPayment.id}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Student</span>
              <span className="font-medium">
                {receiptPayment.student
                  ? `${receiptPayment.student.firstName} ${receiptPayment.student.lastName ?? ""} (${receiptPayment.student.studentId})`
                  : `Student #${receiptPayment.studentId}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fee Invoice</span>
              <span className="font-medium">
                {receiptPayment.fee?.title ?? `Fee #${receiptPayment.feeId}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-medium">
                {receiptPayment.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span>TrxID / Reference</span>
              <span className="font-mono font-semibold">
                {receiptPayment.trxId}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>
                {new Date(
                  receiptPayment.verifiedAt ?? receiptPayment.paidAt,
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Amount Paid</span>
              <span>
                ৳{Number(receiptPayment.paidAmount).toLocaleString()} BDT
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
            <div className="mx-auto w-44 border-t border-slate-400 pt-1">
              Guardian / Payer
            </div>
            <div className="mx-auto w-44 border-t border-slate-400 pt-1">
              Authorized Receiver
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
