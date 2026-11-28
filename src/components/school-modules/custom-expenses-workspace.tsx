"use client";

import {
  Archive,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Pencil,
  Plus,
  Receipt,
  Scale,
  Settings2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { PrintableReportSheet } from "@/components/shared/printable-report-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCustomExpenseEntry,
  useCreateCustomExpenseSheet,
  useCustomExpenseMonthlyChart,
  useCustomExpenseSheets,
  useDeleteCustomExpenseEntry,
  useDeleteCustomExpenseSheet,
  useUpdateCustomExpenseEntry,
  useUpdateCustomExpenseSheetFields,
} from "@/features/custom-expenses/hooks";
import type {
  CustomExpenseChartRow,
  CustomExpenseFieldType,
  CustomExpenseSheet,
} from "@/features/custom-expenses/types";
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

const sanitizeFilenameSlug = (name: string, fallback: string): string => {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
};

const SHEET_NAME_SUGGESTIONS = ["বাজার বিল", "মিল বিল", "কারেন্ট বিল", "খরচ"];

const FIELD_TYPE_LABELS: Record<CustomExpenseFieldType, string> = {
  TEXT: "Text (লেখা)",
  NUMBER: "Number (সংখ্যা)",
  DATE: "Date (তারিখ)",
};

interface BuilderFieldDraft {
  clientId: string;
  id?: number;
  fieldKey?: string;
  label: string;
  fieldType: CustomExpenseFieldType;
  isRequired: boolean;
}

let draftCounter = 0;
const nextClientId = () => {
  draftCounter += 1;
  return `field_${draftCounter}_${Date.now()}`;
};

export function CustomExpensesWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const [selectedSheetId, setSelectedSheetId] = useState<number>(0);
  const [billingMonth, setBillingMonth] = useState<string>(getCurrentMonth);

  // Sheet Create / Edit Columns Modal
  const [sheetModalMode, setSheetModalMode] = useState<
    "create" | "edit" | null
  >(null);
  const [sheetName, setSheetName] = useState("");
  const [sheetDescription, setSheetDescription] = useState("");
  const [fieldDrafts, setFieldDrafts] = useState<BuilderFieldDraft[]>([]);

  // Delete / Archive Sheet Modal
  const [deleteSheetTarget, setDeleteSheetTarget] =
    useState<CustomExpenseSheet | null>(null);

  // Entry Create / Edit Modal
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] =
    useState<CustomExpenseChartRow | null>(null);
  const [entryDate, setEntryDate] = useState<string>(getTodayLocalDate);
  const [entryAmount, setEntryAmount] = useState<string>("");
  const [entryFieldValues, setEntryFieldValues] = useState<
    Record<string, string>
  >({});

  // Delete Entry Confirmation Modal
  const [deleteEntryTarget, setDeleteEntryTarget] =
    useState<CustomExpenseChartRow | null>(null);

  const sheetsQuery = useCustomExpenseSheets(schoolId);
  const sheets = sheetsQuery.data ?? [];

  // Keep selectedSheetId pointing to a valid active sheet
  useEffect(() => {
    if (sheets.length === 0) {
      if (selectedSheetId !== 0) setSelectedSheetId(0);
      return;
    }
    const stillExists = sheets.some((s) => s.id === selectedSheetId);
    if (!stillExists) {
      setSelectedSheetId(sheets[0].id);
    }
  }, [sheets, selectedSheetId]);

  const activeSheet = useMemo(
    () => sheets.find((s) => s.id === selectedSheetId) ?? null,
    [sheets, selectedSheetId],
  );

  const chartQuery = useCustomExpenseMonthlyChart(
    schoolId,
    activeSheet?.id ?? 0,
    billingMonth,
  );

  const createSheetMut = useCreateCustomExpenseSheet(schoolId);
  const updateFieldsMut = useUpdateCustomExpenseSheetFields(schoolId);
  const deleteSheetMut = useDeleteCustomExpenseSheet(schoolId);
  const createEntryMut = useCreateCustomExpenseEntry(schoolId);
  const updateEntryMut = useUpdateCustomExpenseEntry(schoolId);
  const deleteEntryMut = useDeleteCustomExpenseEntry(schoolId);

  // Sheet Builder Handlers
  const openCreateSheetModal = () => {
    setSheetModalMode("create");
    setSheetName("");
    setSheetDescription("");
    setFieldDrafts([]);
  };

  const openEditFieldsModal = (sheet: CustomExpenseSheet) => {
    setSheetModalMode("edit");
    setSheetName(sheet.name);
    setSheetDescription(sheet.description ?? "");
    setFieldDrafts(
      sheet.fields.map((f) => ({
        clientId: `existing_${f.id}`,
        id: f.id,
        fieldKey: f.fieldKey,
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
      })),
    );
  };

  const closeSheetModal = () => {
    setSheetModalMode(null);
    setSheetName("");
    setSheetDescription("");
    setFieldDrafts([]);
  };

  const addDraftField = (
    presetLabel = "",
    presetType: CustomExpenseFieldType = "TEXT",
  ) => {
    if (fieldDrafts.length >= 25) {
      toast.error("সর্বোচ্চ ২৫টি কলাম যোগ করা যাবে");
      return;
    }
    setFieldDrafts((prev) => [
      ...prev,
      {
        clientId: nextClientId(),
        label: presetLabel,
        fieldType: presetType,
        isRequired: false,
      },
    ]);
  };

  const updateDraftField = (
    clientId: string,
    patch: Partial<BuilderFieldDraft>,
  ) => {
    setFieldDrafts((prev) =>
      prev.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeDraftField = (clientId: string) => {
    setFieldDrafts((prev) => prev.filter((item) => item.clientId !== clientId));
  };

  const moveDraftField = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= fieldDrafts.length) return;
    setFieldDrafts((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = sheetName.trim();
    if (!trimmedName) {
      toast.error("শিটের নাম লিখুন (যেমন: বাজার বিল)");
      return;
    }

    const cleanedFields = fieldDrafts
      .map((f, idx) => ({
        ...(f.id !== undefined ? { id: f.id } : {}),
        ...(f.fieldKey ? { fieldKey: f.fieldKey } : {}),
        label: f.label.trim(),
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        sortOrder: idx,
      }))
      .filter((f) => f.label.length > 0);

    if (fieldDrafts.some((f) => f.label.trim().length === 0)) {
      toast.error("ফাঁকা কলামের নাম পূরণ করুন অথবা মুছে ফেলুন");
      return;
    }

    try {
      if (sheetModalMode === "create") {
        const created = await createSheetMut.mutateAsync({
          name: trimmedName,
          description: sheetDescription.trim() || null,
          fields: cleanedFields,
        });
        setSelectedSheetId(created.id);
        closeSheetModal();
      } else if (sheetModalMode === "edit" && activeSheet) {
        await updateFieldsMut.mutateAsync({
          sheetId: activeSheet.id,
          payload: {
            name: trimmedName,
            description: sheetDescription.trim() || null,
            fields: cleanedFields,
          },
        });
        closeSheetModal();
      }
    } catch {
      // Error toast handled by mutation hook
    }
  };

  const handleConfirmDeleteSheet = async (archive: boolean) => {
    if (!deleteSheetTarget) return;
    try {
      await deleteSheetMut.mutateAsync({
        sheetId: deleteSheetTarget.id,
        archive,
      });
      setDeleteSheetTarget(null);
    } catch {
      // Error toast handled by mutation hook
    }
  };

  // Entry Form Handlers
  const openCreateEntryModal = () => {
    if (!activeSheet) return;
    setEditingEntry(null);
    const today = getTodayLocalDate();
    // Default entryDate to today if viewing current month, otherwise 1st of selected month
    setEntryDate(today.startsWith(billingMonth) ? today : `${billingMonth}-01`);
    setEntryAmount("");
    const initValues: Record<string, string> = {};
    for (const f of activeSheet.fields) {
      initValues[f.fieldKey] = "";
    }
    setEntryFieldValues(initValues);
    setEntryModalOpen(true);
  };

  const openEditEntryModal = (row: CustomExpenseChartRow) => {
    if (!activeSheet) return;
    setEditingEntry(row);
    setEntryDate(row.entryDate);
    setEntryAmount(String(row.amount));
    const initValues: Record<string, string> = {};
    for (const f of activeSheet.fields) {
      const val = row.fieldValues[f.fieldKey];
      initValues[f.fieldKey] =
        val !== null && val !== undefined ? String(val) : "";
    }
    setEntryFieldValues(initValues);
    setEntryModalOpen(true);
  };

  const closeEntryModal = () => {
    setEntryModalOpen(false);
    setEditingEntry(null);
    setEntryAmount("");
    setEntryFieldValues({});
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSheet) return;

    const amountNum = Number(entryAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("সঠিক টাকার পরিমাণ লিখুন (০ এর বেশি)");
      return;
    }

    const fieldValuesPayload: Record<string, string | number | null> = {};
    for (const field of activeSheet.fields) {
      const raw = (entryFieldValues[field.fieldKey] ?? "").trim();
      if (!raw) {
        if (field.isRequired) {
          toast.error(`"${field.label}" অবশ্যই পূরণ করতে হবে`);
          return;
        }
        fieldValuesPayload[field.fieldKey] = null;
      } else if (field.fieldType === "NUMBER") {
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
          toast.error(`"${field.label}" অবশ্যই সঠিক সংখ্যা হতে হবে`);
          return;
        }
        fieldValuesPayload[field.fieldKey] = parsed;
      } else {
        fieldValuesPayload[field.fieldKey] = raw;
      }
    }

    try {
      const savedDate = entryDate.trim() || getTodayLocalDate();
      if (editingEntry) {
        const updated = await updateEntryMut.mutateAsync({
          sheetId: activeSheet.id,
          entryId: editingEntry.id,
          payload: {
            entryDate: savedDate,
            amount: amountNum,
            fieldValues: fieldValuesPayload,
          },
        });
        if (updated.billingMonth !== billingMonth) {
          setBillingMonth(updated.billingMonth);
        }
      } else {
        const created = await createEntryMut.mutateAsync({
          sheetId: activeSheet.id,
          payload: {
            entryDate: savedDate,
            amount: amountNum,
            fieldValues: fieldValuesPayload,
          },
        });
        if (created.billingMonth !== billingMonth) {
          setBillingMonth(created.billingMonth);
        }
      }
      closeEntryModal();
    } catch {
      // Error toast handled by mutation hook
    }
  };

  const handleConfirmDeleteEntry = async () => {
    if (!activeSheet || !deleteEntryTarget) return;
    try {
      await deleteEntryMut.mutateAsync({
        sheetId: activeSheet.id,
        entryId: deleteEntryTarget.id,
      });
      setDeleteEntryTarget(null);
    } catch {
      // Error toast handled by mutation hook
    }
  };

  const chart = chartQuery.data;
  const maxDailySpend = useMemo(() => {
    if (!chart) return 0;
    return chart.dailySeries.reduce(
      (max, item) => (item.totalAmount > max ? item.totalAmount : max),
      0,
    );
  }, [chart]);

  const peakDay = useMemo(() => {
    if (!chart || maxDailySpend <= 0) return null;
    return (
      chart.dailySeries.find((item) => item.totalAmount === maxDailySpend) ??
      null
    );
  }, [chart, maxDailySpend]);

  if (!schoolId) {
    return (
      <div className="rounded-xl border p-6 text-sm text-muted-foreground">
        Your account is not associated with a school.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            কাস্টম বিল / খরচ (Custom Bills &amp; Expenses)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            নিজের মতো বিল/খরচের শিট (বাজার বিল, মিল বিল, কারেন্ট বিল, খরচ) ও কাস্টম
            কলাম তৈরি করুন, মাসিক চার্ট দেখুন এবং এক ক্লিকে PDF/CSV এক্সপোর্ট করুন।
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
          <Button
            type="button"
            onClick={openCreateSheetModal}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            নতুন চার্ট / বিল তৈরি করুন
          </Button>
        </div>
      </div>

      {/* Sheet List Loading / Error / Empty */}
      {sheetsQuery.isLoading ? (
        <LoadingState message="কাস্টম বিল ও খরচের শিট লোড হচ্ছে..." />
      ) : sheetsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            sheetsQuery.error,
            "Failed to load custom expense sheets",
          )}
          onRetry={() => sheetsQuery.refetch()}
        />
      ) : sheets.length === 0 ? (
        <div className="rounded-xl border bg-card p-8">
          <EmptyState
            icon={Receipt}
            title="এখনো কোনো কাস্টম বিল বা খরচের শিট তৈরি করা হয়নি"
            description="আপনার প্রতিষ্ঠানের প্রয়োজন অনুযায়ী বাজার বিল, মিল বিল, কারেন্ট বিল বা যেকোনো খরচের শিট ও কলাম তৈরি করে মাসিক হিসাব রাখুন।"
          />
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={openCreateSheetModal}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              প্রথম শিট তৈরি করুন
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Sheet Selector & Month Picker Bar */}
          <div className="no-print space-y-3 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {sheets.map((sheet) => {
                  const isActive = sheet.id === activeSheet?.id;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>{sheet.name}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {sheet._count?.entries ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Month Picker */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setBillingMonth((prev) => shiftBillingMonth(prev, -1))
                  }
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
                      if (e.target.value) setBillingMonth(e.target.value);
                    }}
                    aria-label="Select billing month"
                    className="h-9 w-44 pl-8 text-sm font-medium"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setBillingMonth((prev) => shiftBillingMonth(prev, 1))
                  }
                  aria-label="Next month"
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {activeSheet && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {activeSheet.name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({activeSheet.fields.length}টি কাস্টম কলাম)
                    </span>
                  </p>
                  {activeSheet.description && (
                    <p className="text-xs text-muted-foreground">
                      {activeSheet.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={openCreateEntryModal}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    এন্ট্রি যোগ করুন
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEditFieldsModal(activeSheet)}
                    className="gap-1.5"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    কলাম যোগ / এডিট
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteSheetTarget(activeSheet)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    শিট মুছুন
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Chart & Printable Report */}
          {activeSheet && (
            <div>
              {chartQuery.isLoading ? (
                <LoadingState message="মাসিক চার্ট ও হিসাব লোড হচ্ছে..." />
              ) : chartQuery.isError || !chart ? (
                <ErrorState
                  message={getApiErrorMessage(
                    chartQuery.error,
                    "Failed to load monthly expense chart",
                  )}
                  onRetry={() => chartQuery.refetch()}
                />
              ) : (
                <PrintableReportSheet
                  school={chart.school}
                  title={`${chart.sheet.name} — মাসিক চার্ট ও হিসাব`}
                  subtitle={chart.sheet.description ?? undefined}
                  filterSummary={[
                    `মাস: ${formatMonthLabel(chart.billingMonth)} (${chart.billingMonth})`,
                    `মোট এন্ট্রি: ${chart.entryCount}`,
                    `মোট পরিমাণ: ${formatBDT(chart.totalAmount)}`,
                  ]}
                  generatedBy={user?.name}
                  toolbarExtra={
                    <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      {formatMonthLabel(chart.billingMonth)} •{" "}
                      <strong className="text-foreground">
                        {formatBDT(chart.totalAmount)}
                      </strong>
                    </span>
                  }
                  csvExport={{
                    filename: `custom-expense-${sanitizeFilenameSlug(chart.sheet.name, `sheet-${chart.sheet.id}`)}-${chart.billingMonth}`,
                    headers: [
                      "Serial",
                      "Date",
                      ...chart.sheet.fields.map((f) => f.label),
                      "Amount (BDT)",
                    ],
                    rows: [
                      ...chart.rows.map((r) => [
                        r.serial,
                        r.entryDate,
                        ...chart.sheet.fields.map(
                          (f) => r.fieldValues[f.fieldKey] ?? "",
                        ),
                        r.amount,
                      ]),
                      [
                        "TOTAL",
                        `${chart.entryCount} entries`,
                        ...chart.sheet.fields.map(() => ""),
                        chart.totalAmount,
                      ],
                    ],
                  }}
                  footerTotals={
                    <div className="grid gap-3 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">
                          মোট এন্ট্রি (Entries)
                        </span>
                        <p className="text-sm font-bold">{chart.entryCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          সক্রিয় দিন (Active Days)
                        </span>
                        <p className="text-sm font-bold">
                          {chart.activeDaysCount}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          সর্বোচ্চ দিনের খরচ (Peak Day)
                        </span>
                        <p className="text-sm font-bold">
                          {peakDay
                            ? `${formatBDT(peakDay.totalAmount)} (${peakDay.date.slice(8)} তারিখ)`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          মাসিক মোট (Monthly Total)
                        </span>
                        <p className="text-base font-bold text-primary">
                          {formatBDT(chart.totalAmount)}
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-5">
                    {/* Visual Daily Spend Bar Chart */}
                    <div className="rounded-xl border bg-muted/10 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            দৈনিক খরচ চার্ট — {formatMonthLabel(billingMonth)}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            প্রতিদিনের মোট খরচ (BDT)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">
                            মোট:{" "}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {formatBDT(chart.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {maxDailySpend <= 0 ? (
                        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                          এই মাসে ({billingMonth}) এখনো কোনো এন্ট্রি নেই।
                        </div>
                      ) : (
                        <div className="overflow-x-auto pb-1">
                          <div className="flex h-36 min-w-[540px] items-end gap-1 border-b border-l px-2 pt-4">
                            {chart.dailySeries.map((point) => {
                              const heightPct =
                                point.totalAmount > 0
                                  ? Math.max(
                                      6,
                                      Math.round(
                                        (point.totalAmount / maxDailySpend) *
                                          100,
                                      ),
                                    )
                                  : 0;
                              return (
                                <div
                                  key={point.date}
                                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                                  title={`${point.date}: ${formatBDT(point.totalAmount)} (${point.count} এন্ট্রি)`}
                                >
                                  {point.totalAmount > 0 && (
                                    <span className="mb-1 hidden text-[9px] font-semibold text-primary group-hover:block">
                                      {Math.round(point.totalAmount)}
                                    </span>
                                  )}
                                  <div
                                    className={`w-full max-w-[18px] rounded-t transition-all ${
                                      point.totalAmount > 0
                                        ? "bg-primary/85 group-hover:bg-primary"
                                        : "bg-muted/40"
                                    }`}
                                    style={{
                                      height:
                                        point.totalAmount > 0
                                          ? `${heightPct}%`
                                          : "2px",
                                    }}
                                  />
                                  <span className="mt-1 text-[9px] text-muted-foreground">
                                    {point.day}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Columns Entries Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">তারিখ (Date)</th>
                            {chart.sheet.fields.map((field) => (
                              <th key={field.id} className="px-3 py-2">
                                {field.label}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-right">টাকা (BDT)</th>
                            <th className="no-print px-3 py-2 text-right">
                              অ্যাকশন
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {chart.rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={chart.sheet.fields.length + 4}
                                className="px-3 py-8 text-center text-muted-foreground"
                              >
                                {formatMonthLabel(billingMonth)} মাসে কোনো এন্ট্রি
                                পাওয়া যায়নি। নতুন এন্ট্রি যোগ করতে উপরের &ldquo;এন্ট্রি
                                যোগ করুন&rdquo; বাটনে ক্লিক করুন।
                              </td>
                            </tr>
                          ) : (
                            chart.rows.map((row) => (
                              <tr key={row.id} className="hover:bg-muted/20">
                                <td className="px-3 py-2 font-mono">
                                  {row.serial}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono">
                                  {row.entryDate}
                                </td>
                                {chart.sheet.fields.map((field) => {
                                  const val = row.fieldValues[field.fieldKey];
                                  return (
                                    <td key={field.id} className="px-3 py-2">
                                      {val !== null &&
                                      val !== undefined &&
                                      val !== ""
                                        ? field.fieldType === "NUMBER"
                                          ? Number(val).toLocaleString("en-BD")
                                          : String(val)
                                        : "—"}
                                    </td>
                                  );
                                })}
                                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                                  {formatBDT(row.amount)}
                                </td>
                                <td className="no-print whitespace-nowrap px-3 py-2 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditEntryModal(row)}
                                      className="h-7 w-7 p-0"
                                      title="Edit entry"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeleteEntryTarget(row)}
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      title="Delete entry"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {chart.rows.length > 0 && (
                          <tfoot className="border-t-2 bg-muted/30 font-semibold">
                            <tr>
                              <td
                                colSpan={chart.sheet.fields.length + 2}
                                className="px-3 py-2.5 text-right uppercase"
                              >
                                মোট ({chart.entryCount}টি এন্ট্রি)
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm font-bold text-primary">
                                {formatBDT(chart.totalAmount)}
                              </td>
                              <td className="no-print px-3 py-2.5" />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </PrintableReportSheet>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Sheet / Manage Dynamic Columns Modal */}
      <Modal
        open={sheetModalMode !== null}
        onClose={closeSheetModal}
        title={
          sheetModalMode === "create"
            ? "নতুন চার্ট / বিল তৈরি করুন"
            : `কলাম ও শিট সেটিংস — ${activeSheet?.name ?? ""}`
        }
        description="শিটের নাম দিন এবং প্রয়োজন অনুযায়ী কাস্টম কলাম (Text / Number / Date) যুক্ত করুন। তারিখ (Date) ও টাকা (BDT) স্বয়ংক্রিয়ভাবে থাকবে।"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveSheet} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="custom-sheet-name">শিটের নাম *</Label>
            <Input
              id="custom-sheet-name"
              required
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="যেমন: বাজার বিল, মিল বিল, কারেন্ট বিল, খরচ..."
            />
            {sheetModalMode === "create" && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground">
                  দ্রুত বাছাই:
                </span>
                {SHEET_NAME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSheetName(suggestion)}
                    className="rounded-full border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-sheet-desc">বিবরণ (ঐচ্ছিক)</Label>
            <Textarea
              id="custom-sheet-desc"
              rows={2}
              value={sheetDescription}
              onChange={(e) => setSheetDescription(e.target.value)}
              placeholder="এই বিল বা খরচের শিট সম্পর্কে সংক্ষিপ্ত নোট..."
            />
          </div>

          {/* Dynamic Columns Builder */}
          <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Columns3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  কাস্টম কলাম ({fieldDrafts.length})
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addDraftField()}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                কলাম যোগ করুন
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground">নমুনা কলাম:</span>
              {[
                { label: "বিবরণ", type: "TEXT" as const },
                { label: "পরিমাণ", type: "NUMBER" as const },
                { label: "দোকান / বিক্রেতা", type: "TEXT" as const },
                { label: "রশিদ / মিটার নং", type: "TEXT" as const },
                { label: "বিলের তারিখ", type: "DATE" as const },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addDraftField(preset.label, preset.type)}
                  className="rounded-md border bg-background px-2 py-0.5 hover:bg-muted"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {fieldDrafts.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-background p-3 text-center text-xs text-muted-foreground">
                কোনো অতিরিক্ত কলাম যোগ করা হয়নি — চাইলে শুধু তারিখ ও টাকা দিয়েও শিট তৈরি
                করতে পারেন, অথবা উপরের &ldquo;কলাম যোগ করুন&rdquo; বাটনে ক্লিক করুন।
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {fieldDrafts.map((field, index) => (
                  <div
                    key={field.clientId}
                    className="grid items-center gap-2 rounded-lg border bg-background p-2.5 sm:grid-cols-[1fr_140px_auto_auto]"
                  >
                    <Input
                      required
                      value={field.label}
                      onChange={(e) =>
                        updateDraftField(field.clientId, {
                          label: e.target.value,
                        })
                      }
                      placeholder="কলামের নাম (যেমন: পণ্যের বিবরণ)"
                      className="h-8 text-xs"
                    />
                    <select
                      value={field.fieldType}
                      onChange={(e) =>
                        updateDraftField(field.clientId, {
                          fieldType: e.target.value as CustomExpenseFieldType,
                        })
                      }
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      aria-label="Field type"
                    >
                      {(
                        ["TEXT", "NUMBER", "DATE"] as CustomExpenseFieldType[]
                      ).map((type) => (
                        <option key={type} value={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) =>
                          updateDraftField(field.clientId, {
                            isRequired: e.target.checked,
                          })
                        }
                        className="h-3.5 w-3.5 rounded border"
                      />
                      <span>আবশ্যিক</span>
                    </label>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => moveDraftField(index, -1)}
                        className="h-7 w-7"
                        title="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={index === fieldDrafts.length - 1}
                        onClick={() => moveDraftField(index, 1)}
                        className="h-7 w-7"
                        title="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeDraftField(field.clientId)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Remove column"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={closeSheetModal}>
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={createSheetMut.isPending || updateFieldsMut.isPending}
            >
              {createSheetMut.isPending || updateFieldsMut.isPending
                ? "সংরক্ষণ হচ্ছে..."
                : sheetModalMode === "create"
                  ? "শিট তৈরি করুন"
                  : "পরিবর্তন সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create / Edit Entry Modal */}
      <Modal
        open={entryModalOpen}
        onClose={closeEntryModal}
        title={
          editingEntry
            ? `এন্ট্রি এডিট — ${activeSheet?.name ?? ""}`
            : `নতুন এন্ট্রি — ${activeSheet?.name ?? ""}`
        }
        description="তারিখ, টাকার পরিমাণ এবং এই শিটের কাস্টম তথ্য পূরণ করুন।"
      >
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="entry-date">তারিখ (Date) *</Label>
              <Input
                id="entry-date"
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entry-amount">টাকার পরিমাণ (৳ BDT) *</Label>
              <Input
                id="entry-amount"
                type="number"
                min="0.01"
                max="99999999.99"
                step="0.01"
                required
                placeholder="0.00"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
              />
            </div>
          </div>

          {activeSheet && activeSheet.fields.length > 0 && (
            <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
              {activeSheet.fields.map((field) => (
                <div
                  key={field.id}
                  className={`space-y-1.5 ${
                    field.fieldType === "TEXT" &&
                    activeSheet.fields.length === 1
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <Label htmlFor={`entry-field-${field.id}`}>
                    {field.label} {field.isRequired ? "*" : ""}
                  </Label>
                  <Input
                    id={`entry-field-${field.id}`}
                    type={
                      field.fieldType === "NUMBER"
                        ? "number"
                        : field.fieldType === "DATE"
                          ? "date"
                          : "text"
                    }
                    step={field.fieldType === "NUMBER" ? "any" : undefined}
                    required={field.isRequired}
                    value={entryFieldValues[field.fieldKey] ?? ""}
                    onChange={(e) =>
                      setEntryFieldValues((prev) => ({
                        ...prev,
                        [field.fieldKey]: e.target.value,
                      }))
                    }
                    placeholder={
                      field.fieldType === "NUMBER"
                        ? "সংখ্যা লিখুন"
                        : field.fieldType === "TEXT"
                          ? `${field.label} লিখুন`
                          : undefined
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={closeEntryModal}>
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={createEntryMut.isPending || updateEntryMut.isPending}
            >
              {createEntryMut.isPending || updateEntryMut.isPending
                ? "সংরক্ষণ হচ্ছে..."
                : editingEntry
                  ? "আপডেট করুন"
                  : "এন্ট্রি সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Sheet Confirmation Modal */}
      <Modal
        open={Boolean(deleteSheetTarget)}
        onClose={() => setDeleteSheetTarget(null)}
        title={`শিট মুছুন / আর্কাইভ — ${deleteSheetTarget?.name ?? ""}`}
        description="আর্কাইভ করলে শিটটি তালিকা থেকে সরে যাবে কিন্তু ডেটা সংরক্ষিত থাকবে। স্থায়ীভাবে মুছলে এই শিটের সব এন্ট্রিও মুছে যাবে।"
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteSheetTarget(null)}
          >
            বাতিল
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={deleteSheetMut.isPending}
            onClick={() => void handleConfirmDeleteSheet(true)}
            className="gap-1.5"
          >
            <Archive className="h-4 w-4" />
            আর্কাইভ করুন
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteSheetMut.isPending}
            onClick={() => void handleConfirmDeleteSheet(false)}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {deleteSheetMut.isPending ? "মুছছে..." : "স্থায়ীভাবে মুছুন"}
          </Button>
        </div>
      </Modal>

      {/* Delete Entry Confirmation Modal */}
      <Modal
        open={Boolean(deleteEntryTarget)}
        onClose={() => setDeleteEntryTarget(null)}
        title="এন্ট্রি মুছে ফেলুন"
        description={`আপনি কি ${deleteEntryTarget?.entryDate ?? ""} তারিখের ${formatBDT(deleteEntryTarget?.amount ?? 0)} এন্ট্রিটি মুছে ফেলতে চান?`}
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteEntryTarget(null)}
          >
            বাতিল
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteEntryMut.isPending}
            onClick={() => void handleConfirmDeleteEntry()}
          >
            {deleteEntryMut.isPending ? "মুছছে..." : "মুছে ফেলুন"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
