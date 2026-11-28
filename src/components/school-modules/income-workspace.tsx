"use client";

import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Scale,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { PrintableReportSheet } from "@/components/shared/printable-report-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StudentPaymentMethod } from "@/features/fees/types";
import {
  useCreateOtherIncome,
  useDeleteOtherIncome,
  useIncomeMonthlyChart,
  useIncomeSummary,
  useUpdateOtherIncome,
} from "@/features/income/hooks";
import type {
  IncomeCategoryFilter,
  UnifiedIncomeCategory,
  UnifiedIncomeRow,
} from "@/features/income/types";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const formatBDT = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getTodayLocalDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getCurrentMonth = (): string => getTodayLocalDate().slice(0, 7);

const shiftBillingMonth = (billingMonth: string, delta: number): string => {
  const [yStr, mStr] = billingMonth.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const formatMonthLabel = (billingMonth: string): string => {
  const [yStr, mStr] = billingMonth.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1, 1);
  if (Number.isNaN(date.getTime())) return billingMonth;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const CATEGORY_TABS: Array<{
  id: IncomeCategoryFilter;
  label: string;
}> = [
  { id: "ALL", label: "সব আয় (All)" },
  { id: "MONTHLY_FEE", label: "ছাত্রদের মাসিক ফি" },
  { id: "ADMISSION_FEE", label: "ছাত্রদের অ্যাডমিশন ফি" },
  { id: "OTHER_STUDENT_FEE", label: "অন্যান্য ছাত্র ফি" },
  { id: "OTHER_INCOME", label: "অন্যান্য আয় / আউট ইনকাম" },
];

const SOURCE_LABEL_SUGGESTIONS = [
  "দান / অনুদান",
  "বই/কাগজ বিক্রি",
  "ফরম বিক্রি",
  "ভাড়া / হলরুম",
  "অন্যান্য আয়",
];

const CATEGORY_BADGE_CLASS: Record<UnifiedIncomeCategory, string> = {
  MONTHLY_FEE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ADMISSION_FEE: "border-blue-200 bg-blue-50 text-blue-700",
  OTHER_STUDENT_FEE: "border-violet-200 bg-violet-50 text-violet-700",
  OTHER_INCOME: "border-amber-200 bg-amber-50 text-amber-800",
};

const CATEGORY_BAR_CLASS: Record<UnifiedIncomeCategory, string> = {
  MONTHLY_FEE: "bg-emerald-500",
  ADMISSION_FEE: "bg-blue-500",
  OTHER_STUDENT_FEE: "bg-violet-500",
  OTHER_INCOME: "bg-amber-500",
};

const PAYMENT_METHODS: StudentPaymentMethod[] = [
  "CASH",
  "BKASH",
  "NAGAD",
  "ROCKET",
];

export function IncomeWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const [billingMonth, setBillingMonth] = useState<string>(getCurrentMonth);
  const [category, setCategory] = useState<IncomeCategoryFilter>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput.trim(), 300);

  // Add / Edit Out-Income Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<UnifiedIncomeRow | null>(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState<string>(getTodayLocalDate);
  const [paymentMethod, setPaymentMethod] =
    useState<StudentPaymentMethod>("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<UnifiedIncomeRow | null>(
    null,
  );

  const hasSubFilters = Boolean(startDate || endDate || debouncedSearch);

  const chartQuery = useIncomeMonthlyChart(schoolId, billingMonth, category);
  const summaryQuery = useIncomeSummary(
    schoolId,
    {
      billingMonth,
      category,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    hasSubFilters,
  );

  const createMut = useCreateOtherIncome(schoolId);
  const updateMut = useUpdateOtherIncome(schoolId);
  const deleteMut = useDeleteOtherIncome(schoolId);

  const chart = chartQuery.data;
  const activeSummary = hasSubFilters ? summaryQuery.data : chart;

  const rows = useMemo(() => activeSummary?.rows ?? [], [activeSummary]);
  const displayedTotal = useMemo(() => {
    if (!activeSummary) return 0;
    return "filteredTotal" in activeSummary
      ? activeSummary.filteredTotal
      : activeSummary.displayedTotal;
  }, [activeSummary]);

  const dailySeries = useMemo(() => {
    if (!chart) return [];
    if (!hasSubFilters) return chart.dailySeries;
    // Re-aggregate daily series from filtered summary rows so chart reflects date/search filters
    const byDate = new Map<string, { totalAmount: number; count: number }>();
    for (const row of rows) {
      const prev = byDate.get(row.date) ?? { totalAmount: 0, count: 0 };
      prev.totalAmount =
        Math.round((prev.totalAmount + row.amount + Number.EPSILON) * 100) /
        100;
      prev.count += 1;
      byDate.set(row.date, prev);
    }
    return chart.dailySeries.map((pt) => {
      const hit = byDate.get(pt.date);
      return {
        ...pt,
        totalAmount: hit?.totalAmount ?? 0,
        count: hit?.count ?? 0,
      };
    });
  }, [chart, hasSubFilters, rows]);

  const maxDailyIncome = useMemo(
    () =>
      dailySeries.reduce(
        (max, pt) => (pt.totalAmount > max ? pt.totalAmount : max),
        0,
      ),
    [dailySeries],
  );

  const activeCategoryLabel =
    CATEGORY_TABS.find((t) => t.id === category)?.label ?? "সব আয় (All)";

  const resetModalForm = () => {
    setEditingRow(null);
    setSourceLabel("");
    setTitle("");
    setAmount("");
    const today = getTodayLocalDate();
    setIncomeDate(
      today.startsWith(billingMonth) ? today : `${billingMonth}-01`,
    );
    setPaymentMethod("CASH");
    setReferenceNo("");
    setNotes("");
  };

  const openCreateModal = () => {
    resetModalForm();
    setModalOpen(true);
  };

  const openEditModal = (row: UnifiedIncomeRow) => {
    setEditingRow(row);
    setSourceLabel(row.sourceLabel ?? row.sourceOrStudent);
    setTitle(row.title);
    setAmount(String(row.amount));
    setIncomeDate(row.date);
    setPaymentMethod(
      PAYMENT_METHODS.includes(row.paymentMethod as StudentPaymentMethod)
        ? (row.paymentMethod as StudentPaymentMethod)
        : "CASH",
    );
    setReferenceNo(row.referenceNo ?? "");
    setNotes(row.notes ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetModalForm();
  };

  const handleSubmitOtherIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSource = sourceLabel.trim();
    const trimmedTitle = title.trim();
    const amountNum = Number(amount);

    if (!trimmedSource) {
      toast.error("আয়ের উৎস লিখুন (যেমন: দান / অনুদান)");
      return;
    }
    if (!trimmedTitle) {
      toast.error("আয়ের বিবরণ / শিরোনাম লিখুন");
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    try {
      const payload = {
        sourceLabel: trimmedSource,
        title: trimmedTitle,
        amount: amountNum,
        incomeDate: incomeDate.trim() || getTodayLocalDate(),
        paymentMethod,
        referenceNo: referenceNo.trim() || null,
        notes: notes.trim() || null,
      };

      if (editingRow) {
        const res = await updateMut.mutateAsync({
          id: editingRow.entryId,
          payload,
        });
        if (res.billingMonth !== billingMonth) {
          setBillingMonth(res.billingMonth);
        }
      } else {
        const res = await createMut.mutateAsync(payload);
        if (res.billingMonth !== billingMonth) {
          setBillingMonth(res.billingMonth);
        }
      }
      closeModal();
    } catch {
      // Handled via mutation toast
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.entryId);
      setDeleteTarget(null);
    } catch {
      // Handled via mutation toast
    }
  };

  if (!schoolId) {
    return (
      <div className="rounded-xl border p-6 text-sm text-muted-foreground">
        Your account is not associated with a school.
      </div>
    );
  }

  const isLoading =
    chartQuery.isLoading || (hasSubFilters && summaryQuery.isLoading);
  const isError = chartQuery.isError || (hasSubFilters && summaryQuery.isError);
  const errorObj = chartQuery.error ?? summaryQuery.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            আয়ের হিসাব (Income &amp; Collection Hub)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ছাত্রদের মাসিক ফি, অ্যাডমিশন ফি, অন্যান্য ফি এবং আউট ইনকাম (দান / অনুদান /
            বিক্রি) — এক জায়গায় মাসিক চার্ট ও এক ক্লিকে PDF/CSV এক্সপোর্ট।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            href={`${user?.role === "MANAGER" ? "/dashboard/manager/reports" : "/dashboard/admin/reports"}?tab=monthly-net`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <Scale className="h-4 w-4 text-primary" />
            আয় বনাম খরচ (নিট)
          </Link>
          <Button type="button" onClick={openCreateModal} className="gap-1.5">
            <Plus className="h-4 w-4" />
            অন্যান্য আয় যুক্ত করুন
          </Button>
        </div>
      </div>

      {/* Category Tabs + Month & Date/Search Controls */}
      <div className="no-print space-y-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setBillingMonth((prev) => shiftBillingMonth(prev, -1));
              }}
              aria-label="Previous month"
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="month"
                value={billingMonth}
                onChange={(e) => {
                  if (e.target.value) {
                    setStartDate("");
                    setEndDate("");
                    setBillingMonth(e.target.value);
                  }
                }}
                aria-label="Select billing month"
                className="h-9 w-44 pl-8 text-sm font-medium"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setBillingMonth((prev) => shiftBillingMonth(prev, 1));
              }}
              aria-label="Next month"
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Date Range & Search Row */}
        <div className="grid gap-2.5 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ছাত্রের নাম, উৎস, TrxID বা বিবরণ খুঁজুন..."
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Filter start date"
            title="শুরুর তারিখ (ঐচ্ছিক)"
            className="h-9 text-xs"
          />
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Filter end date"
              title="শেষ তারিখ (ঐচ্ছিক)"
              className="h-9 text-xs"
            />
            {hasSubFilters && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchInput("");
                }}
                title="ফিল্টার রিসেট করুন"
                className="h-9 w-9 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <LoadingState message="আয়ের হিসাব ও মাসিক চার্ট লোড হচ্ছে..." />
      ) : isError || !chart || !activeSummary ? (
        <ErrorState
          message={getApiErrorMessage(
            errorObj,
            "Failed to load unified income data",
          )}
          onRetry={() => {
            void chartQuery.refetch();
            if (hasSubFilters) void summaryQuery.refetch();
          }}
        />
      ) : (
        <>
          {/* 5 KPI Summary Cards */}
          <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
                <span>মোট আয় (Total Income)</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-emerald-900">
                {formatBDT(activeSummary.grandTotal)}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700">
                {formatMonthLabel(billingMonth)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                ছাত্রদের মাসিক ফি
              </p>
              <p className="mt-1.5 text-xl font-bold">
                {formatBDT(activeSummary.monthlyFeeTotal)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                ছাত্রদের অ্যাডমিশন ফি
              </p>
              <p className="mt-1.5 text-xl font-bold text-blue-700">
                {formatBDT(activeSummary.admissionFeeTotal)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                অন্যান্য ছাত্র ফি
              </p>
              <p className="mt-1.5 text-xl font-bold text-violet-700">
                {formatBDT(activeSummary.otherStudentFeeTotal)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                অন্যান্য আয় (Out Income)
              </p>
              <p className="mt-1.5 text-xl font-bold text-amber-700">
                {formatBDT(activeSummary.otherIncomeTotal)}
              </p>
            </div>
          </div>

          {/* Printable Monthly Income Report & Ledger */}
          <PrintableReportSheet
            school={chart.school}
            title={`মাসিক আয়ের চার্ট ও হিসাব — ${activeCategoryLabel}`}
            subtitle="ভেরিফায়েড ছাত্র ফি, অ্যাডমিশন ফি এবং অন্যান্য আয়ের সমন্বিত প্রতিবেদন"
            filterSummary={[
              `মাস: ${formatMonthLabel(billingMonth)} (${billingMonth})`,
              `ক্যাটাগরি: ${activeCategoryLabel}`,
              ...(startDate || endDate
                ? [`তারিখ: ${startDate || "..."} থেকে ${endDate || "..."}`]
                : []),
              `মোট এন্ট্রি: ${rows.length}`,
            ]}
            generatedBy={user?.name}
            toolbarExtra={
              <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                প্রদর্শিত মোট:{" "}
                <strong className="text-foreground">
                  {formatBDT(displayedTotal)}
                </strong>
              </span>
            }
            csvExport={{
              filename: `income-report-${category.toLowerCase()}-${billingMonth}`,
              headers: [
                "Serial",
                "Date",
                "Category",
                "Source / Student",
                "Title",
                "Payment Method",
                "Reference / TrxID",
                "Amount (BDT)",
              ],
              rows: [
                ...rows.map((r) => [
                  r.serial,
                  r.date,
                  r.categoryLabel,
                  r.sourceOrStudent,
                  r.title,
                  r.paymentMethod,
                  r.referenceNo ?? "",
                  r.amount,
                ]),
                [
                  "TOTAL",
                  `${rows.length} entries`,
                  activeCategoryLabel,
                  "",
                  "",
                  "",
                  "",
                  displayedTotal,
                ],
              ],
            }}
            footerTotals={
              <div className="grid gap-3 text-xs sm:grid-cols-5">
                <div>
                  <span className="text-muted-foreground">মাসিক ফি</span>
                  <p className="text-sm font-bold">
                    {formatBDT(activeSummary.monthlyFeeTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">অ্যাডমিশন ফি</span>
                  <p className="text-sm font-bold text-blue-700">
                    {formatBDT(activeSummary.admissionFeeTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">অন্যান্য ছাত্র ফি</span>
                  <p className="text-sm font-bold text-violet-700">
                    {formatBDT(activeSummary.otherStudentFeeTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">অন্যান্য আয়</span>
                  <p className="text-sm font-bold text-amber-700">
                    {formatBDT(activeSummary.otherIncomeTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {category === "ALL" && !hasSubFilters
                      ? "সর্বমোট আয় (Grand Total)"
                      : "ফিল্টারকৃত মোট"}
                  </span>
                  <p className="text-base font-bold text-emerald-700">
                    {formatBDT(displayedTotal)}
                  </p>
                </div>
              </div>
            }
          >
            <div className="space-y-5">
              {/* Visual Daily Income Bar Chart + Category Breakdown */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Daily Bar Chart */}
                <div className="rounded-xl border bg-muted/10 p-4 lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        দৈনিক আয়ের চার্ট — {formatMonthLabel(billingMonth)}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        প্রতিদিনের মোট আয় ({activeCategoryLabel})
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatBDT(displayedTotal)}
                    </span>
                  </div>

                  {maxDailyIncome <= 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                      এই সময়কালে কোনো আয় পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto pb-1">
                      <div className="flex h-36 min-w-[480px] items-end gap-1 border-b border-l px-2 pt-4">
                        {dailySeries.map((pt) => {
                          const heightPct =
                            pt.totalAmount > 0
                              ? Math.max(
                                  6,
                                  Math.round(
                                    (pt.totalAmount / maxDailyIncome) * 100,
                                  ),
                                )
                              : 0;
                          return (
                            <div
                              key={pt.date}
                              className="group relative flex h-full flex-1 flex-col items-center justify-end"
                              title={`${pt.date}: ${formatBDT(pt.totalAmount)} (${pt.count} এন্ট্রি)`}
                            >
                              {pt.totalAmount > 0 && (
                                <span className="mb-1 hidden text-[9px] font-semibold text-emerald-700 group-hover:block">
                                  {Math.round(pt.totalAmount)}
                                </span>
                              )}
                              <div
                                className={`w-full max-w-[16px] rounded-t transition-all ${
                                  pt.totalAmount > 0
                                    ? "bg-emerald-500/85 group-hover:bg-emerald-600"
                                    : "bg-muted/40"
                                }`}
                                style={{
                                  height:
                                    pt.totalAmount > 0
                                      ? `${heightPct}%`
                                      : "2px",
                                }}
                              />
                              <span className="mt-1 text-[9px] text-muted-foreground">
                                {pt.day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Breakdown Bars */}
                <div className="rounded-xl border bg-muted/10 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ক্যাটাগরি অনুযায়ী আয় (%)
                  </h4>
                  <div className="space-y-3">
                    {activeSummary.byCategory.map((item) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-semibold">
                            {formatBDT(item.amount)}{" "}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              ({item.percentage}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${CATEGORY_BAR_CLASS[item.category]}`}
                            style={{
                              width: `${Math.min(100, item.percentage)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unified Income Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">তারিখ</th>
                      <th className="px-3 py-2">ক্যাটাগরি</th>
                      <th className="px-3 py-2">ছাত্র / উৎস</th>
                      <th className="px-3 py-2">বিবরণ ও রেফারেন্স</th>
                      <th className="px-3 py-2">মাধ্যম</th>
                      <th className="px-3 py-2 text-right">টাকা (BDT)</th>
                      <th className="no-print px-3 py-2 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          এই ফিল্টারে কোনো আয়ের রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-mono">{row.serial}</td>
                          <td className="whitespace-nowrap px-3 py-2 font-mono">
                            {row.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_BADGE_CLASS[row.category]}`}
                            >
                              {row.categoryLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.sourceOrStudent}
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{row.title}</div>
                            {(row.referenceNo || row.notes) && (
                              <div className="text-[10px] text-muted-foreground">
                                {row.referenceNo
                                  ? `Ref: ${row.referenceNo}`
                                  : ""}
                                {row.referenceNo && row.notes ? " • " : ""}
                                {row.notes ?? ""}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 font-medium">
                            {row.paymentMethod}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-emerald-700">
                            {formatBDT(row.amount)}
                          </td>
                          <td className="no-print whitespace-nowrap px-3 py-2 text-right">
                            {row.sourceType === "MANUAL_INCOME" ? (
                              <div className="inline-flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditModal(row)}
                                  className="h-7 w-7 p-0"
                                  title="Edit manual income"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteTarget(row)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  title="Delete manual income"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                অটো সিঙ্ক
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {rows.length > 0 && (
                    <tfoot className="border-t-2 bg-muted/30 font-semibold">
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-2.5 text-right uppercase"
                        >
                          মোট ({rows.length}টি রেকর্ড)
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm font-bold text-emerald-700">
                          {formatBDT(displayedTotal)}
                        </td>
                        <td className="no-print px-3 py-2.5" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </PrintableReportSheet>
        </>
      )}

      {/* Add / Edit Out-Income Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingRow ? "অন্যান্য আয় এডিট করুন" : "অন্যান্য আয় যুক্ত করুন (Add Out Income)"
        }
        description="দান/অনুদান, বই বা ফরম বিক্রি, অথবা অন্যান্য বাহ্যিক আয় লিপিবদ্ধ করুন।"
      >
        <form onSubmit={handleSubmitOtherIncome} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="income-source">আয়ের উৎস (Source) *</Label>
            <Input
              id="income-source"
              required
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="যেমন: দান / অনুদান, বই/কাগজ বিক্রি..."
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SOURCE_LABEL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSourceLabel(s)}
                  className="rounded-full border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-title">বিবরণ / শিরোনাম (Title) *</Label>
            <Input
              id="income-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: মসজিদ ফান্ডে অনুদান / বার্ষিক বই বিক্রি"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="income-amount">পরিমাণ (৳ BDT) *</Label>
              <Input
                id="income-amount"
                type="number"
                min="0.01"
                max="99999999.99"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="income-date">তারিখ *</Label>
              <Input
                id="income-date"
                type="date"
                required
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="income-method">মাধ্যম *</Label>
              <select
                id="income-method"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as StudentPaymentMethod)
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="CASH">Cash (নগদ)</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="ROCKET">Rocket</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-ref">রশিদ / TrxID (ঐচ্ছিক)</Label>
            <Input
              id="income-ref"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="যেমন: RCPT-104 বা 9K2L8M4N"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-notes">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
            <Textarea
              id="income-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="প্রয়োজনীয় মন্তব্য..."
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? "সংরক্ষণ হচ্ছে..."
                : editingRow
                  ? "আপডেট করুন"
                  : "আয় সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Out-Income Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="আয়ের এন্ট্রি মুছে ফেলুন"
        description={`আপনি কি "${deleteTarget?.title ?? ""}" (${formatBDT(deleteTarget?.amount ?? 0)}) এন্ট্রিটি মুছে ফেলতে চান?`}
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
          >
            বাতিল
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMut.isPending}
            onClick={() => void handleConfirmDelete()}
          >
            {deleteMut.isPending ? "মুছছে..." : "মুছে ফেলুন"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
