"use client";

import { AlertTriangle, Copy, Search, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { PrintableReportSheet } from "@/components/shared/printable-report-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import { ALL_FEE_TYPES, type FeeType } from "@/features/fees/types";
import {
  type DefaulterListRow,
  useDefaulterListReport,
} from "@/features/reports/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import { formatBDT, sanitizeFilenamePreservingUnicode } from "@/lib/dhaka-date";

export function DefaultersTab({
  schoolId,
  generatedBy,
}: {
  schoolId: number;
  generatedBy?: string | null;
}) {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [feeType, setFeeType] = useState<"ALL" | FeeType>("ALL");
  const [status, setStatus] = useState<
    "ALL_DUE" | "OVERDUE" | "PENDING" | "PARTIAL"
  >("ALL_DUE");
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput.trim(), 300);
  const debouncedYear = useDebounce(academicYear.trim(), 350);
  const queryYear = debouncedYear.length >= 4 ? debouncedYear : undefined;

  const { data: classes = [] } = useClasses(schoolId);
  const { data: sections = [] } = useSections(
    schoolId,
    classId ? Number(classId) : undefined,
  );

  const query = useDefaulterListReport(schoolId, {
    ...(classId ? { classId: Number(classId) } : {}),
    ...(sectionId ? { sectionId: Number(sectionId) } : {}),
    ...(queryYear ? { academicYear: queryYear } : {}),
    feeType,
    status,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const data = query.data;
  const selectedClassName = classes.find((c) => String(c.id) === classId)?.name;
  const selectedSectionName = sections.find(
    (s) => String(s.id) === sectionId,
  )?.name;

  const handleCopyReminder = async (row: DefaulterListRow) => {
    const schoolName = data?.school?.name ?? "প্রতিষ্ঠান";
    const feesList = row.feeTitles.slice(0, 4).join(", ");
    const extraCount =
      row.feeTitles.length > 4 ? ` ও আরও ${row.feeTitles.length - 4}টি` : "";
    const msg = `আসসালামু আলাইকুম ${row.guardianName ?? "অভিভাবক"}, ${schoolName}-এর শিক্ষার্থী ${row.studentName} (শ্রেণি: ${row.className}${row.rollNumber ? `, রোল: ${row.rollNumber}` : ""})-এর ${row.unpaidFeeCount}টি ফি (${feesList}${extraCount}) বাবদ মোট ${formatBDT(row.totalDue)} বকেয়া রয়েছে${row.overdueFeeCount > 0 ? ` (যার মধ্যে ${formatBDT(row.overdueDue)} মেয়াদোত্তীর্ণ)` : ""}। অনুগ্রহ করে দ্রুত বকেয়া পরিশোধ করার অনুরোধ রইল। জাযাকাল্লাহু খাইরান।`;

    try {
      await navigator.clipboard.writeText(msg);
      toast.success(`${row.studentName}-এর রিমাইন্ডার মেসেজ কপি হয়েছে`);
    } catch {
      toast.error("মেসেজ কপি করা যায়নি");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="no-print grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ছাত্রের নাম, রোল, আইডি বা অভিভাবকের ফোন..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSectionId("");
          }}
          className="h-9 rounded-md border bg-background px-2.5 text-sm"
        >
          <option value="">সব শ্রেণি (All Classes)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={!classId}
          className="h-9 rounded-md border bg-background px-2.5 text-sm disabled:opacity-50"
        >
          <option value="">সব শাখা</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={feeType}
          onChange={(e) => setFeeType(e.target.value as "ALL" | FeeType)}
          className="h-9 rounded-md border bg-background px-2.5 text-sm"
        >
          <option value="ALL">সব ফি ধরন</option>
          {ALL_FEE_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as "ALL_DUE" | "OVERDUE" | "PENDING" | "PARTIAL",
            )
          }
          className="h-9 rounded-md border bg-background px-2.5 text-sm"
        >
          <option value="ALL_DUE">সব বকেয়া (All Due)</option>
          <option value="OVERDUE">শুধু মেয়াদোত্তীর্ণ (Overdue)</option>
          <option value="PARTIAL">আংশিক পরিশোধিত (Partial)</option>
          <option value="PENDING">বকেয়া (Pending)</option>
        </select>
        <Input
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          placeholder="শিক্ষাবর্ষ (যেমন: 2026)"
          className="h-9 text-sm"
        />
      </div>

      {query.isLoading ? (
        <LoadingState message="বকেয়া তালিকা লোড হচ্ছে..." />
      ) : query.isError || !data ? (
        <ErrorState
          message={getApiErrorMessage(
            query.error,
            "Failed to load defaulter list",
          )}
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>মোট বকেয়া শিক্ষার্থী</span>
                <UserX className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold">
                {data.summary.totalDefaulters}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                মোট {data.summary.totalUnpaidInvoices}টি অপরিশোধিত ইনভয়েস
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-red-800">
                <span>মেয়াদোত্তীর্ণ শিক্ষার্থী (Overdue)</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-red-700">
                {data.summary.overdueStudentsCount}
              </p>
              <p className="mt-0.5 text-[11px] text-red-700">
                মেয়াদোত্তীর্ণ বকেয়া: {formatBDT(data.summary.totalOverdueAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs font-medium text-amber-900">
                মোট বকেয়া টাকা (Total Due)
              </p>
              <p className="mt-1.5 text-2xl font-bold text-amber-800">
                {formatBDT(data.summary.totalDueAmount)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                অপরিশোধিত ইনভয়েস সংখ্যা
              </p>
              <p className="mt-1.5 text-2xl font-bold">
                {data.summary.totalUnpaidInvoices}
              </p>
            </div>
          </div>

          <PrintableReportSheet
            school={data.school}
            title="শিক্ষার্থীভিত্তিক বকেয়া তালিকা (Student-Wise Defaulter List)"
            subtitle="অপরিশোধিত ও মেয়াদোত্তীর্ণ ফির সমন্বিত বকেয়া প্রতিবেদন"
            defaultOrientation="landscape"
            filterSummary={[
              selectedClassName ? `শ্রেণি: ${selectedClassName}` : "শ্রেণি: সকল",
              ...(selectedSectionName ? [`শাখা: ${selectedSectionName}`] : []),
              `স্ট্যাটাস: ${status}`,
              `মোট বকেয়া ছাত্র: ${data.summary.totalDefaulters}`,
              `মোট বকেয়া: ${formatBDT(data.summary.totalDueAmount)}`,
            ]}
            generatedBy={generatedBy}
            csvExport={{
              filename: `বকেয়া-তালিকা-${sanitizeFilenamePreservingUnicode(selectedClassName || "all", "all")}`,
              headers: [
                "Serial",
                "Roll",
                "Student ID",
                "Student Name",
                "Class",
                "Section",
                "Guardian Name",
                "Guardian Phone",
                "Unpaid Invoices",
                "Overdue Invoices",
                "Total Due (BDT)",
                "Overdue Due (BDT)",
                "Last Payment Date",
                "Unpaid Fee Details",
              ],
              rows: [
                ...data.rows.map((r) => [
                  r.serial,
                  r.rollNumber ?? "",
                  r.studentCode,
                  r.studentName,
                  r.className,
                  r.sectionName ?? "",
                  r.guardianName ?? "",
                  r.guardianPhone ?? "",
                  r.unpaidFeeCount,
                  r.overdueFeeCount,
                  r.totalDue,
                  r.overdueDue,
                  r.lastPaymentDate ?? "Never",
                  r.feeTitles.join(" | "),
                ]),
                [
                  "TOTAL",
                  "",
                  `${data.summary.totalDefaulters} students`,
                  "",
                  "",
                  "",
                  "",
                  "",
                  data.summary.totalUnpaidInvoices,
                  data.summary.overdueStudentsCount,
                  data.summary.totalDueAmount,
                  data.summary.totalOverdueAmount,
                  "",
                  "",
                ],
              ],
            }}
            footerTotals={
              <div className="grid gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">বকেয়া শিক্ষার্থী</span>
                  <p className="text-sm font-bold">
                    {data.summary.totalDefaulters}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">মেয়াদোত্তীর্ণ</span>
                  <p className="text-sm font-bold text-red-700">
                    {data.summary.overdueStudentsCount} জন (
                    {formatBDT(data.summary.totalOverdueAmount)})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">অপরিশোধিত ফি</span>
                  <p className="text-sm font-bold">
                    {data.summary.totalUnpaidInvoices}টি
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">মোট বকেয়া (BDT)</span>
                  <p className="text-base font-bold text-amber-700">
                    {formatBDT(data.summary.totalDueAmount)}
                  </p>
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">রোল</th>
                    <th className="px-3 py-2">শিক্ষার্থী</th>
                    <th className="px-3 py-2">শ্রেণি / শাখা</th>
                    <th className="px-3 py-2">অভিভাবক ও ফোন</th>
                    <th className="px-3 py-2 text-center">বকেয়া ফি</th>
                    <th className="px-3 py-2 text-right">মোট বকেয়া (৳)</th>
                    <th className="px-3 py-2">সর্বশেষ পরিশোধ</th>
                    <th className="no-print px-3 py-2 text-right">রিমাইন্ডার</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-8 text-center text-muted-foreground"
                      >
                        এই ফিল্টারে কোনো বকেয়া শিক্ষার্থী পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    data.rows.map((row) => (
                      <tr
                        key={row.studentId}
                        className={row.isOverdue ? "bg-red-50/30" : undefined}
                      >
                        <td className="px-3 py-2 font-mono">{row.serial}</td>
                        <td className="px-3 py-2 font-mono font-semibold">
                          {row.rollNumber ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{row.studentName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {row.studentCode}
                            {row.nameBangla ? ` • ${row.nameBangla}` : ""}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {row.className}
                          {row.sectionName ? ` (${row.sectionName})` : ""}
                        </td>
                        <td className="px-3 py-2">
                          <div>{row.guardianName ?? "—"}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {row.guardianPhone ?? "—"}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="font-semibold">
                            {row.unpaidFeeCount}টি
                          </span>
                          {row.overdueFeeCount > 0 && (
                            <span className="ml-1 inline-flex rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                              {row.overdueFeeCount} Overdue
                            </span>
                          )}
                          <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted-foreground">
                            {row.feeTitles.join(", ")}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-amber-700">
                          {formatBDT(row.totalDue)}
                          {row.overdueDue > 0 && (
                            <div className="text-[10px] font-medium text-red-600">
                              Overdue: {formatBDT(row.overdueDue)}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {row.lastPaymentDate ?? "কখনো হয়নি"}
                        </td>
                        <td className="no-print whitespace-nowrap px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void handleCopyReminder(row)}
                            className="h-7 gap-1 px-2 text-[11px]"
                            title="বাংলা রিমাইন্ডার মেসেজ কপি করুন"
                          >
                            <Copy className="h-3 w-3" />
                            রিমাইন্ডার কপি
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PrintableReportSheet>
        </>
      )}
    </div>
  );
}
