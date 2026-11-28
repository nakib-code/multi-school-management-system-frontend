"use client";

import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ExternalLink,
  ImagePlus,
  Paperclip,
  Pencil,
  Plus,
  Receipt,
  Scale,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  useRestoreCustomExpenseSheet,
  useUpdateCustomExpenseEntry,
  useUpdateCustomExpenseSheetFields,
} from "@/features/custom-expenses/hooks";
import type {
  CustomExpenseChartRow,
  CustomExpenseFieldType,
  CustomExpenseSheet,
} from "@/features/custom-expenses/types";
import type { StudentPaymentMethod } from "@/features/fees/types";
import { useUploadFile } from "@/features/uploads/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatBDT,
  formatMonthLong,
  getCurrentDhakaMonth,
  getTodayDhakaDate,
  sanitizeFilenamePreservingUnicode,
  shiftBillingMonth,
} from "@/lib/dhaka-date";
import { useAuth } from "@/providers/auth-provider";

const FIELD_TYPE_LABELS: Record<CustomExpenseFieldType, string> = {
  TEXT: "Text (লেখা)",
  NUMBER: "Number (সংখ্যা)",
  DATE: "Date (তারিখ)",
};

const PAYMENT_METHODS: StudentPaymentMethod[] = [
  "CASH",
  "BKASH",
  "NAGAD",
  "ROCKET",
  "BANK_TRANSFER",
  "CHEQUE",
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash (নগদ)",
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
};

interface StarterTemplate {
  name: string;
  description: string;
  fields: Array<{
    label: string;
    fieldType: CustomExpenseFieldType;
    isRequired: boolean;
  }>;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: "বাজার বিল",
    description: "দৈনিক বাজার ও রান্নার সদাই খরচ",
    fields: [
      { label: "বাজার/দোকান", fieldType: "TEXT", isRequired: false },
      { label: "আইটেম", fieldType: "TEXT", isRequired: true },
      { label: "পরিমাণ", fieldType: "NUMBER", isRequired: false },
      { label: "ভাউচার/নোট", fieldType: "TEXT", isRequired: false },
    ],
  },
  {
    name: "মিল বিল",
    description: "বোর্ডিং / ছাত্রাবাস দৈনিক খাবার ও মিল হিসাব",
    fields: [
      { label: "খাবার/মিল বিবরণ", fieldType: "TEXT", isRequired: true },
      { label: "মিল সংখ্যা", fieldType: "NUMBER", isRequired: false },
      { label: "রেট/নোট", fieldType: "TEXT", isRequired: false },
    ],
  },
  {
    name: "কারেন্ট বিল",
    description: "বিদ্যুৎ, গ্যাস ও ইউটিলিটি বিল হিসাব",
    fields: [
      { label: "মিটার নং", fieldType: "TEXT", isRequired: false },
      { label: "বিল মাস", fieldType: "TEXT", isRequired: false },
      { label: "ইউনিট/নোট", fieldType: "TEXT", isRequired: false },
    ],
  },
  {
    name: "সাধারণ খরচ",
    description: "প্রতিষ্ঠানের দৈনন্দিন ও বিবিধ খরচ",
    fields: [
      { label: "খাতের বিবরণ", fieldType: "TEXT", isRequired: true },
      { label: "ভাউচার/নোট", fieldType: "TEXT", isRequired: false },
    ],
  },
];

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

const formatDynamicCellValue = (
  val: string | number | null | undefined,
  fieldType: CustomExpenseFieldType,
): string => {
  if (val === null || val === undefined || val === "") return "—";
  if (fieldType === "NUMBER") {
    const num = typeof val === "number" ? val : Number(String(val).trim());
    if (Number.isFinite(num)) {
      return num.toLocaleString("en-BD", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    // Safe fallback for legacy non-numeric text values instead of rendering NaN
    return String(val);
  }
  return String(val);
};

function CustomExpensesWorkspaceInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";

  const initialSheetId = Number(searchParams.get("sheetId")) || 0;
  const initialMonth = searchParams.get("month");
  const validInitialMonth =
    initialMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(initialMonth)
      ? initialMonth
      : getCurrentDhakaMonth();

  const [selectedSheetId, setSelectedSheetId] =
    useState<number>(initialSheetId);
  const [billingMonth, setBillingMonth] = useState<string>(validInitialMonth);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput.trim(), 300);

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
  const [entryDate, setEntryDate] = useState<string>(getTodayDhakaDate);
  const [entryAmount, setEntryAmount] = useState<string>("");
  const [entryPaymentMethod, setEntryPaymentMethod] =
    useState<StudentPaymentMethod>("CASH");
  const [entryAttachmentUrl, setEntryAttachmentUrl] = useState<string>("");
  const [entryFieldValues, setEntryFieldValues] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Attachment preview modal
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    voucherNo?: string | null;
    entryDate: string;
    amount: number;
  } | null>(null);

  // Delete Entry Confirmation Modal
  const [deleteEntryTarget, setDeleteEntryTarget] =
    useState<CustomExpenseChartRow | null>(null);

  const sheetsQuery = useCustomExpenseSheets(schoolId, {
    includeInactive: showArchived,
    billingMonth,
  });
  const sheets = sheetsQuery.data ?? [];

  // Keep selectedSheetId pointing to a valid sheet
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

  const hasSubFilters = Boolean(startDate || endDate || debouncedSearch);

  const chartQuery = useCustomExpenseMonthlyChart(
    schoolId,
    activeSheet?.id ?? 0,
    billingMonth,
    {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  );

  const createSheetMut = useCreateCustomExpenseSheet(schoolId);
  const updateFieldsMut = useUpdateCustomExpenseSheetFields(schoolId);
  const deleteSheetMut = useDeleteCustomExpenseSheet(schoolId);
  const restoreSheetMut = useRestoreCustomExpenseSheet(schoolId);
  const createEntryMut = useCreateCustomExpenseEntry(schoolId);
  const updateEntryMut = useUpdateCustomExpenseEntry(schoolId);
  const deleteEntryMut = useDeleteCustomExpenseEntry(schoolId);
  const uploadFileMut = useUploadFile();

  // Sheet Builder Handlers
  const openCreateSheetModal = () => {
    setSheetModalMode("create");
    setSheetName("");
    setSheetDescription("");
    setFieldDrafts([]);
  };

  const applyStarterTemplate = (tpl: StarterTemplate) => {
    setSheetName(tpl.name);
    setSheetDescription(tpl.description);
    setFieldDrafts(
      tpl.fields.map((f) => ({
        clientId: nextClientId(),
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
      })),
    );
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

  const removedExistingColumns = useMemo(() => {
    if (sheetModalMode !== "edit" || !activeSheet) return [];
    const keptIds = new Set(
      fieldDrafts.map((f) => f.id).filter((id): id is number => Boolean(id)),
    );
    return activeSheet.fields.filter((f) => !keptIds.has(f.id));
  }, [sheetModalMode, activeSheet, fieldDrafts]);

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = sheetName.trim();
    if (!trimmedName) {
      toast.error("শিটের নাম লিখুন (যেমন: বাজার বিল)");
      return;
    }

    if (fieldDrafts.some((f) => f.label.trim().length === 0)) {
      toast.error("ফাঁকা কলামের নাম পূরণ করুন অথবা মুছে ফেলুন");
      return;
    }

    const seenLabels = new Set<string>();
    for (const f of fieldDrafts) {
      const key = f.label.trim().toLowerCase();
      if (seenLabels.has(key)) {
        toast.error(`একই নামে দুটি কলাম ("${f.label.trim()}") দেওয়া যাবে না`);
        return;
      }
      seenLabels.add(key);
    }

    const cleanedFields = fieldDrafts.map((f, idx) => ({
      ...(f.id !== undefined ? { id: f.id } : {}),
      ...(f.fieldKey ? { fieldKey: f.fieldKey } : {}),
      label: f.label.trim(),
      fieldType: f.fieldType,
      isRequired: f.isRequired,
      sortOrder: idx,
    }));

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
  const buildBlankFieldValues = (sheet: CustomExpenseSheet) => {
    const initValues: Record<string, string> = {};
    for (const f of sheet.fields) {
      initValues[f.fieldKey] = "";
    }
    return initValues;
  };

  const openCreateEntryModal = () => {
    if (!activeSheet) return;
    setEditingEntry(null);
    const today = getTodayDhakaDate();
    setEntryDate(today.startsWith(billingMonth) ? today : `${billingMonth}-01`);
    setEntryAmount("");
    setEntryPaymentMethod("CASH");
    setEntryAttachmentUrl("");
    setEntryFieldValues(buildBlankFieldValues(activeSheet));
    setEntryModalOpen(true);
  };

  const openEditEntryModal = (row: CustomExpenseChartRow) => {
    if (!activeSheet) return;
    setEditingEntry(row);
    setEntryDate(row.entryDate);
    setEntryAmount(String(row.amount));
    setEntryPaymentMethod(
      row.paymentMethod && PAYMENT_METHODS.includes(row.paymentMethod)
        ? row.paymentMethod
        : "CASH",
    );
    setEntryAttachmentUrl(row.attachmentUrl ?? "");
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
    setEntryAttachmentUrl("");
    setEntryFieldValues({});
  };

  const handleBillFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ফাইলের সাইজ সর্বোচ্চ 5MB হতে পারবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      try {
        const uploaded = await uploadFileMut.mutateAsync({
          dataUrl,
          category: "DOCUMENT",
          fileName: file.name,
        });
        setEntryAttachmentUrl(uploaded.url);
      } catch {
        // Error toast handled by upload hook
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const submitEntry = async (keepOpenForNext: boolean) => {
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
      const savedDate = entryDate.trim() || getTodayDhakaDate();
      const payload = {
        entryDate: savedDate,
        amount: amountNum,
        paymentMethod: entryPaymentMethod,
        attachmentUrl: entryAttachmentUrl.trim() || null,
        fieldValues: fieldValuesPayload,
      };

      if (editingEntry) {
        const updated = await updateEntryMut.mutateAsync({
          sheetId: activeSheet.id,
          entryId: editingEntry.id,
          payload,
        });
        if (updated.billingMonth !== billingMonth) {
          setBillingMonth(updated.billingMonth);
        }
        closeEntryModal();
      } else {
        const created = await createEntryMut.mutateAsync({
          sheetId: activeSheet.id,
          payload,
        });
        if (created.billingMonth !== billingMonth) {
          setBillingMonth(created.billingMonth);
        }
        if (keepOpenForNext) {
          // Keep selected date & payment method for rapid consecutive bazaar entries
          setEntryAmount("");
          setEntryAttachmentUrl("");
          setEntryFieldValues(buildBlankFieldValues(activeSheet));
        } else {
          closeEntryModal();
        }
      }
    } catch {
      // Error toast handled by mutation hook
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEntry(false);
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

  const isMultiMonthRange = Boolean(
    chart?.effectiveStartDate &&
      chart?.effectiveEndDate &&
      chart.effectiveStartDate.slice(0, 7) !==
        chart.effectiveEndDate.slice(0, 7),
  );

  const periodRangeLabel =
    startDate || endDate
      ? `${chart?.effectiveStartDate ?? startDate} থেকে ${chart?.effectiveEndDate ?? endDate}`
      : formatMonthLong(billingMonth);

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
            কলাম তৈরি করুন, ভাউচার নং ও বিলের ছবি যুক্ত করুন এবং PDF/CSV এক্সপোর্ট করুন।
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
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={openCreateSheetModal}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              প্রথম শিট তৈরি করুন
            </Button>
            {!showArchived && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowArchived(true)}
                className="gap-1.5"
              >
                <Archive className="h-4 w-4" />
                আর্কাইভ শিট দেখুন
              </Button>
            )}
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
                  const monthCount = sheet.monthEntryCount ?? 0;
                  const monthTotal = sheet.monthTotalAmount ?? 0;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : !sheet.isActive
                            ? "border-dashed bg-muted/40 text-muted-foreground hover:bg-muted"
                            : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>{sheet.name}</span>
                      {!sheet.isActive && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          Archived
                        </span>
                      )}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title={`এই মাসে ${monthCount}টি এন্ট্রি (${formatBDT(monthTotal)})`}
                      >
                        {monthCount}
                        {monthTotal > 0 ? ` • ${formatBDT(monthTotal)}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Month Picker + Archived Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border"
                  />
                  <span>আর্কাইভ শিট</span>
                </label>

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
            </div>

            {activeSheet && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span>{activeSheet.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({activeSheet.fields.length}টি কাস্টম কলাম)
                      </span>
                      {!activeSheet.isActive && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          আর্কাইভ করা (Read-Only)
                        </span>
                      )}
                    </p>
                    {activeSheet.description && (
                      <p className="text-xs text-muted-foreground">
                        {activeSheet.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeSheet.isActive ? (
                      <>
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
                        {isAdmin && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteSheetTarget(activeSheet)}
                            className="gap-1.5 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            শিট আর্কাইভ / মুছুন
                          </Button>
                        )}
                      </>
                    ) : (
                      isAdmin && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => restoreSheetMut.mutate(activeSheet.id)}
                          disabled={restoreSheetMut.isPending}
                          className="gap-1.5"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                          {restoreSheetMut.isPending
                            ? "পুনরুদ্ধার হচ্ছে..."
                            : "শিট পুনরুদ্ধার করুন"}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Search & Date-Range Filter Row */}
                <div className="grid gap-2.5 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative lg:col-span-2">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="ভাউচার নং, বিবরণ, দোকান, টাকা বা যেকোনো কলাম খুঁজুন..."
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
              </>
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
                  defaultOrientation={
                    chart.sheet.fields.length > 4 ? "landscape" : "portrait"
                  }
                  filterSummary={[
                    `সময়কাল: ${periodRangeLabel}`,
                    ...(debouncedSearch ? [`খোঁজ: ${debouncedSearch}`] : []),
                    `মোট এন্ট্রি: ${chart.entryCount}`,
                    `মোট পরিমাণ: ${formatBDT(chart.totalAmount)}`,
                  ]}
                  generatedBy={user?.name}
                  toolbarExtra={
                    <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      {periodRangeLabel} •{" "}
                      <strong className="text-foreground">
                        {formatBDT(chart.totalAmount)}
                      </strong>
                      {chart.hasActiveFilters &&
                        chart.unfilteredTotalAmount !== undefined && (
                          <span className="text-[11px]">
                            (সময়কাল মোট: {formatBDT(chart.unfilteredTotalAmount)}
                            )
                          </span>
                        )}
                    </span>
                  }
                  csvExport={{
                    filename: `খরচ-${sanitizeFilenamePreservingUnicode(chart.sheet.name, `sheet-${chart.sheet.id}`)}-${startDate || chart.billingMonth}`,
                    headers: [
                      "Serial",
                      "Date",
                      "Voucher No",
                      "Payment Method",
                      ...chart.sheet.fields.map((f) => f.label),
                      "Amount (BDT)",
                      "Recorded By",
                      "Bill Attachment URL",
                    ],
                    rows: [
                      ...chart.rows.map((r) => [
                        r.serial,
                        r.entryDate,
                        r.voucherNo ?? "",
                        r.paymentMethod ?? "CASH",
                        ...chart.sheet.fields.map(
                          (f) => r.fieldValues[f.fieldKey] ?? "",
                        ),
                        r.amount,
                        r.recordedBy?.name ?? "",
                        r.attachmentUrl ?? "",
                      ]),
                      [
                        "TOTAL",
                        `${chart.entryCount} entries`,
                        "",
                        "",
                        ...chart.sheet.fields.map((f) =>
                          f.fieldType === "NUMBER"
                            ? (chart.numericColumnTotals?.[f.fieldKey] ?? 0)
                            : "",
                        ),
                        chart.totalAmount,
                        "",
                        "",
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
                            ? `${formatBDT(peakDay.totalAmount)} (${peakDay.date})`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {chart.hasActiveFilters
                            ? "ফিল্টারকৃত মোট"
                            : "মাসিক মোট (Monthly Total)"}
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
                            দৈনিক খরচ চার্ট — {periodRangeLabel}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            প্রতিদিনের মোট খরচ (BDT) • সর্বোচ্চ:{" "}
                            {formatBDT(maxDailySpend)}
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
                          এই সময়কালে কোনো এন্ট্রি পাওয়া যায়নি।
                        </div>
                      ) : (
                        <div className="overflow-x-auto pb-1">
                          <div className="flex h-36 min-w-[540px] items-end gap-1 border-b border-l px-2 pt-5">
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
                                    <span className="print-show-value mb-1 hidden text-[8px] font-semibold text-primary group-hover:block">
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
                                  <span className="mt-1 text-[8px] text-muted-foreground">
                                    {isMultiMonthRange
                                      ? point.date.slice(5)
                                      : point.day}
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
                            <th className="px-3 py-2">তারিখ ও ভাউচার</th>
                            {chart.sheet.fields.map((field) => (
                              <th key={field.id} className="px-3 py-2">
                                {field.label}
                              </th>
                            ))}
                            <th className="px-3 py-2">মাধ্যম</th>
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
                                colSpan={chart.sheet.fields.length + 5}
                                className="px-3 py-8 text-center text-muted-foreground"
                              >
                                এই সময়কালে কোনো এন্ট্রি পাওয়া যায়নি। নতুন এন্ট্রি যোগ
                                করতে উপরের &ldquo;এন্ট্রি যোগ করুন&rdquo; বাটনে ক্লিক
                                করুন।
                              </td>
                            </tr>
                          ) : (
                            chart.rows.map((row) => (
                              <tr key={row.id} className="hover:bg-muted/20">
                                <td className="px-3 py-2 font-mono">
                                  {row.serial}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono">
                                  <div>{row.entryDate}</div>
                                  {row.voucherNo && (
                                    <div className="text-[10px] font-semibold text-primary">
                                      {row.voucherNo}
                                    </div>
                                  )}
                                </td>
                                {chart.sheet.fields.map((field) => (
                                  <td key={field.id} className="px-3 py-2">
                                    {formatDynamicCellValue(
                                      row.fieldValues[field.fieldKey],
                                      field.fieldType,
                                    )}
                                  </td>
                                ))}
                                <td className="whitespace-nowrap px-3 py-2 text-[11px]">
                                  {PAYMENT_METHOD_LABELS[
                                    row.paymentMethod ?? "CASH"
                                  ] ?? row.paymentMethod}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                                  {formatBDT(row.amount)}
                                </td>
                                <td className="no-print whitespace-nowrap px-3 py-2 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    {row.attachmentUrl && (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setPreviewAttachment({
                                            url: row.attachmentUrl as string,
                                            voucherNo: row.voucherNo,
                                            entryDate: row.entryDate,
                                            amount: row.amount,
                                          })
                                        }
                                        className="h-7 w-7 p-0 text-blue-600"
                                        title="বিল / মেমোর ছবি দেখুন"
                                      >
                                        <Paperclip className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    {activeSheet.isActive && (
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
                                    )}
                                    {isAdmin && activeSheet.isActive && (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setDeleteEntryTarget(row)
                                        }
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        title="Delete entry (Admin only)"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {chart.rows.length > 0 && (
                          <tfoot className="border-t-2 bg-muted/30 font-semibold">
                            <tr>
                              <td colSpan={2} className="px-3 py-2.5 uppercase">
                                মোট ({chart.entryCount}টি)
                              </td>
                              {chart.sheet.fields.map((field) => (
                                <td
                                  key={field.id}
                                  className="px-3 py-2.5 font-mono text-xs text-primary"
                                >
                                  {field.fieldType === "NUMBER"
                                    ? (
                                        chart.numericColumnTotals?.[
                                          field.fieldKey
                                        ] ?? 0
                                      ).toLocaleString("en-BD", {
                                        maximumFractionDigits: 2,
                                      })
                                    : ""}
                                </td>
                              ))}
                              <td className="px-3 py-2.5" />
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
        description="শিটের নাম দিন এবং প্রয়োজন অনুযায়ী স্টার্টার টেমপ্লেট বা কাস্টম কলাম (Text / Number / Date) যুক্ত করুন। তারিখ, ভাউচার নং ও টাকা স্বয়ংক্রিয়ভাবে থাকবে।"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveSheet} className="space-y-4">
          {sheetModalMode === "create" && (
            <div className="space-y-2 rounded-xl border bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">
                এক-ক্লিকে রেডি টেমপ্লেট বাছাই (ঐচ্ছিক — পরে ইচ্ছেমতো এডিট করতে পারবেন):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyStarterTemplate(tpl)}
                    className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium shadow-2xs transition hover:border-primary hover:bg-primary/5"
                  >
                    + {tpl.name} ({tpl.fields.length} কলাম)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="custom-sheet-name">শিটের নাম *</Label>
            <Input
              id="custom-sheet-name"
              required
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="যেমন: বাজার বিল, মিল বিল, কারেন্ট বিল, সাধারণ খরচ..."
            />
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

            {removedExistingColumns.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
                সতর্কতা: আপনি{" "}
                <strong>
                  {removedExistingColumns.map((c) => c.label).join(", ")}
                </strong>{" "}
                কলামটি সরিয়েছেন। সংরক্ষণ করলে এই কলামের পূর্বের সংরক্ষিত তথ্য টেবিল ও
                রিপোর্টে আর দেখা যাবে না।
              </div>
            )}

            {fieldDrafts.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-background p-3 text-center text-xs text-muted-foreground">
                কোনো অতিরিক্ত কলাম যোগ করা হয়নি — চাইলে শুধু তারিখ ও টাকা দিয়েও শিট তৈরি
                করতে পারেন, অথবা উপরের টেমপ্লেট / &ldquo;কলাম যোগ করুন&rdquo; বাটনে
                ক্লিক করুন।
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
        description="তারিখ, টাকার পরিমাণ, পেমেন্ট মাধ্যম, কাস্টম তথ্য এবং ঐচ্ছিক বিল/ভাউচারের ছবি যুক্ত করুন।"
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
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
            <div className="space-y-1.5">
              <Label htmlFor="entry-method">পেমেন্ট মাধ্যম *</Label>
              <select
                id="entry-method"
                value={entryPaymentMethod}
                onChange={(e) =>
                  setEntryPaymentMethod(e.target.value as StudentPaymentMethod)
                }
                className="h-9 w-full rounded-md border bg-background px-2.5 text-sm"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {PAYMENT_METHOD_LABELS[pm]}
                  </option>
                ))}
              </select>
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

          {/* Optional Bill / Voucher Photo Attachment */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label>বিল / মেমো / ভাউচারের ছবি (ঐচ্ছিক)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => void handleBillFileSelect(e)}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadFileMut.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 text-xs"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {uploadFileMut.isPending ? "আপলোড হচ্ছে..." : "ছবি / ফাইল আপলোড"}
              </Button>
            </div>
            {entryAttachmentUrl && (
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                <a
                  href={entryAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 truncate text-primary hover:underline"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">সংযুক্ত বিল/ভাউচার দেখুন</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setEntryAttachmentUrl("")}
                  className="h-6 w-6 text-destructive"
                  title="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={closeEntryModal}>
              বাতিল
            </Button>
            {!editingEntry && (
              <Button
                type="button"
                variant="outline"
                disabled={createEntryMut.isPending}
                onClick={() => void submitEntry(true)}
              >
                সংরক্ষণ ও আরেকটি যোগ করুন
              </Button>
            )}
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

      {/* Bill / Voucher Attachment Viewer Modal */}
      <Modal
        open={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        title={`বিল / ভাউচার প্রিভিউ — ${previewAttachment?.voucherNo ?? previewAttachment?.entryDate ?? ""}`}
        description={
          previewAttachment
            ? `তারিখ: ${previewAttachment.entryDate} • পরিমাণ: ${formatBDT(previewAttachment.amount)}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {previewAttachment && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-muted/20 p-2 text-center">
              {/* biome-ignore lint/performance/noImgElement: direct preview of uploaded bill image */}
              <img
                src={previewAttachment.url}
                alt="Bill voucher attachment"
                className="mx-auto max-h-[65vh] rounded object-contain"
              />
            </div>
            <div className="flex justify-end gap-2">
              <a
                href={previewAttachment.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                নতুন ট্যাবে খুলুন
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewAttachment(null)}
              >
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete / Archive Sheet Confirmation Modal (Admin Only) */}
      <Modal
        open={Boolean(deleteSheetTarget)}
        onClose={() => setDeleteSheetTarget(null)}
        title={`শিট আর্কাইভ / মুছুন — ${deleteSheetTarget?.name ?? ""}`}
        description="আর্কাইভ করলে শিটটি সাধারণ তালিকা থেকে সরে যাবে কিন্তু পূর্বের হিসাব সংরক্ষিত থাকবে (পরে পুনরুদ্ধার করা যাবে)। স্থায়ীভাবে মুছলে এই শিটের সব এন্ট্রিও মুছে যাবে।"
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

      {/* Delete Entry Confirmation Modal (Admin Only) */}
      <Modal
        open={Boolean(deleteEntryTarget)}
        onClose={() => setDeleteEntryTarget(null)}
        title="এন্ট্রি মুছে ফেলুন"
        description={`আপনি কি ${deleteEntryTarget?.entryDate ?? ""} তারিখের ${formatBDT(deleteEntryTarget?.amount ?? 0)} (${deleteEntryTarget?.voucherNo ?? ""}) এন্ট্রিটি মুছে ফেলতে চান?`}
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

export function CustomExpensesWorkspace() {
  return (
    <Suspense
      fallback={<LoadingState message="কাস্টম বিল ও খরচের শিট লোড হচ্ছে..." />}
    >
      <CustomExpensesWorkspaceInner />
    </Suspense>
  );
}
