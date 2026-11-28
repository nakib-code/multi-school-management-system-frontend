"use client";

import {
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { PrintableReportSheet } from "@/components/shared/printable-report-sheet";
import { Input } from "@/components/ui/input";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import { useExams } from "@/features/exams/hooks";
import { ALL_FEE_TYPES, type FeeType } from "@/features/fees/types";
import {
  useAdmissionChartReport,
  useFeeChartReport,
  useSchoolReportOverview,
  useStudentRosterChartReport,
} from "@/features/reports/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const formatBDT = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "all";

type ReportTab = "overview" | "admissions" | "fees" | "roster";

const FEE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ALL_FEE_TYPES.map((t) => [t.value, t.label]),
);

function SchoolReportsWorkspaceInner() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as ReportTab) || "overview";
  const [activeTab, setActiveTab] = useState<ReportTab>(
    ["overview", "admissions", "fees", "roster"].includes(initialTab)
      ? initialTab
      : "overview",
  );

  useEffect(() => {
    const t = searchParams.get("tab") as ReportTab | null;
    if (t && ["overview", "admissions", "fees", "roster"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Shared lookup lists
  const { data: classes = [] } = useClasses(schoolId);
  const { data: exams = [] } = useExams(schoolId);

  // Admission Chart Filters
  const [admClassId, setAdmClassId] = useState("");
  const [admSectionId, setAdmSectionId] = useState("");
  const [admYear, setAdmYear] = useState("");
  const [admStatus, setAdmStatus] = useState("");
  const [admPayStatus, setAdmPayStatus] = useState("");

  // Fee Chart Filters
  const [feeType, setFeeType] = useState<"ALL" | FeeType>("ALL");
  const [feeClassId, setFeeClassId] = useState("");
  const [feeSectionId, setFeeSectionId] = useState("");
  const [feeYear, setFeeYear] = useState("");
  const [feeMonth, setFeeMonth] = useState("");
  const [feeExamId, setFeeExamId] = useState("");
  const [feeStatus, setFeeStatus] = useState("");

  // Roster Chart Filters
  const [rosterClassId, setRosterClassId] = useState("");
  const [rosterSectionId, setRosterSectionId] = useState("");
  const [rosterYear, setRosterYear] = useState("");
  const [rosterStatus, setRosterStatus] = useState("ACTIVE");

  const { data: admSections = [] } = useSections(
    schoolId,
    admClassId ? Number(admClassId) : undefined,
  );
  const { data: feeSections = [] } = useSections(
    schoolId,
    feeClassId ? Number(feeClassId) : undefined,
  );
  const { data: rosterSections = [] } = useSections(
    schoolId,
    rosterClassId ? Number(rosterClassId) : undefined,
  );

  const debouncedAdmYear = useDebounce(admYear.trim(), 350);
  const debouncedFeeYear = useDebounce(feeYear.trim(), 350);
  const debouncedRosterYear = useDebounce(rosterYear.trim(), 350);

  const queryAdmYear =
    debouncedAdmYear.length >= 4 ? debouncedAdmYear : undefined;
  const queryFeeYear =
    debouncedFeeYear.length >= 4 ? debouncedFeeYear : undefined;
  const queryRosterYear =
    debouncedRosterYear.length >= 4 ? debouncedRosterYear : undefined;

  // Queries
  const overviewQuery = useSchoolReportOverview(schoolId);
  const admissionChartQuery = useAdmissionChartReport(
    schoolId,
    {
      ...(admClassId ? { classId: Number(admClassId) } : {}),
      ...(admSectionId ? { sectionId: Number(admSectionId) } : {}),
      ...(queryAdmYear ? { academicYear: queryAdmYear } : {}),
      ...(admStatus ? { status: admStatus } : {}),
      ...(admPayStatus ? { paymentStatus: admPayStatus } : {}),
    },
    activeTab === "admissions",
  );
  const feeChartQuery = useFeeChartReport(
    schoolId,
    {
      feeType,
      ...(feeClassId ? { classId: Number(feeClassId) } : {}),
      ...(feeSectionId ? { sectionId: Number(feeSectionId) } : {}),
      ...(queryFeeYear ? { academicYear: queryFeeYear } : {}),
      ...(feeMonth ? { billingMonth: feeMonth } : {}),
      ...(feeExamId ? { examId: Number(feeExamId) } : {}),
      ...(feeStatus ? { status: feeStatus } : {}),
    },
    activeTab === "fees",
  );
  const rosterChartQuery = useStudentRosterChartReport(
    schoolId,
    {
      ...(rosterClassId ? { classId: Number(rosterClassId) } : {}),
      ...(rosterSectionId ? { sectionId: Number(rosterSectionId) } : {}),
      ...(queryRosterYear ? { academicYear: queryRosterYear } : {}),
      ...(rosterStatus ? { status: rosterStatus } : {}),
    },
    activeTab === "roster",
  );

  const selectedAdmClassName = classes.find(
    (c) => String(c.id) === admClassId,
  )?.name;
  const selectedAdmSectionName = admSections.find(
    (s) => String(s.id) === admSectionId,
  )?.name;
  const selectedFeeClassName = classes.find(
    (c) => String(c.id) === feeClassId,
  )?.name;
  const selectedFeeSectionName = feeSections.find(
    (s) => String(s.id) === feeSectionId,
  )?.name;
  const selectedFeeExamName = exams.find(
    (ex) => String(ex.id) === feeExamId,
  )?.name;
  const selectedRosterClassName = classes.find(
    (c) => String(c.id) === rosterClassId,
  )?.name;
  const selectedRosterSectionName = rosterSections.find(
    (s) => String(s.id) === rosterSectionId,
  )?.name;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold tracking-tight">
          Institution Reports &amp; Class-Wise Charts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounting overview, class-wise admission &amp; fee charts, student
          roll rosters, and one-click PDF export.
        </p>
      </div>

      {/* Tabs */}
      <div className="no-print flex flex-wrap gap-2 border-b">
        {(
          [
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            {
              id: "admissions",
              label: "Admission Chart & Accounting",
              icon: GraduationCap,
            },
            {
              id: "fees",
              label: "Fee Chart & Accounting",
              icon: FileSpreadsheet,
            },
            {
              id: "roster",
              label: "Student Roll Roster",
              icon: Users,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <OverviewTab
          data={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
          isError={overviewQuery.isError}
          error={overviewQuery.error}
          onRetry={() => overviewQuery.refetch()}
        />
      )}

      {/* TAB 2: ADMISSION CHART & ACCOUNTING */}
      {activeTab === "admissions" && (
        <div className="space-y-4">
          <div className="no-print grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={admClassId}
              onChange={(e) => {
                setAdmClassId(e.target.value);
                setAdmSectionId("");
              }}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={admSectionId}
              onChange={(e) => setAdmSectionId(e.target.value)}
              disabled={!admClassId}
              className="h-9 rounded-md border bg-background px-2.5 text-sm disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {admSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              value={admYear}
              onChange={(e) => setAdmYear(e.target.value)}
              placeholder="Academic Year (e.g. 2026)"
              className="h-9 text-sm"
            />
            <select
              value={admStatus}
              onChange={(e) => setAdmStatus(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Admission Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={admPayStatus}
              onChange={(e) => setAdmPayStatus(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Payment Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {admissionChartQuery.isLoading ? (
            <LoadingState message="Loading admission chart..." />
          ) : admissionChartQuery.isError || !admissionChartQuery.data ? (
            <ErrorState
              message={getApiErrorMessage(
                admissionChartQuery.error,
                "Failed to load admission chart",
              )}
              onRetry={() => admissionChartQuery.refetch()}
            />
          ) : (
            <PrintableReportSheet
              school={admissionChartQuery.data.school}
              title="Class-Wise Admission Chart & Accounting Sheet"
              csvExport={{
                filename: `admission-chart-${sanitizeFilenamePart(selectedAdmClassName || "all")}-${sanitizeFilenamePart(queryAdmYear || "all")}`,
                headers: [
                  "Serial",
                  "Application No",
                  "Applicant Name",
                  "Bangla Name",
                  "Guardian Name",
                  "Guardian Phone",
                  "Class",
                  "Section",
                  "Academic Year",
                  "Admission Fee (BDT)",
                  "Payment Method",
                  "TrxID",
                  "Payment Status",
                  "Admission Status",
                ],
                rows: [
                  ...admissionChartQuery.data.rows.map((r) => [
                    r.serial,
                    r.applicationNo,
                    r.studentName,
                    r.nameBangla,
                    r.guardianName,
                    r.guardianPhone,
                    r.className,
                    r.sectionName,
                    r.academicYear,
                    r.admissionFee,
                    r.paymentMethod,
                    r.trxId,
                    r.paymentStatus,
                    r.admissionStatus,
                  ]),
                  [
                    "TOTAL",
                    `${admissionChartQuery.data.summary.totalApplicants} applicants`,
                    `Approved: ${admissionChartQuery.data.summary.approvedCount}`,
                    `Pending: ${admissionChartQuery.data.summary.pendingCount}`,
                    `Rejected: ${admissionChartQuery.data.summary.rejectedCount}`,
                    "",
                    "",
                    "",
                    "",
                    admissionChartQuery.data.summary.totalExpected,
                    `Collected: ${admissionChartQuery.data.summary.totalCollected}`,
                    `Pending: ${admissionChartQuery.data.summary.totalPending}`,
                    "",
                    "",
                  ],
                ],
              }}
              filterSummary={[
                selectedAdmClassName
                  ? `Class: ${selectedAdmClassName}`
                  : "Class: All",
                ...(selectedAdmSectionName
                  ? [`Section: ${selectedAdmSectionName}`]
                  : []),
                queryAdmYear ? `Year: ${queryAdmYear}` : "Year: All",
                admStatus ? `Status: ${admStatus}` : "Status: All",
                admPayStatus ? `Payment: ${admPayStatus}` : "Payment: All",
              ]}
              generatedBy={user?.name}
              footerTotals={
                <div className="grid gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <span className="text-muted-foreground">Applicants</span>
                    <p className="text-sm font-bold">
                      {admissionChartQuery.data.summary.totalApplicants}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approved</span>
                    <p className="text-sm font-bold text-emerald-700">
                      {admissionChartQuery.data.summary.approvedCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending</span>
                    <p className="text-sm font-bold text-amber-700">
                      {admissionChartQuery.data.summary.pendingCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Fee</span>
                    <p className="text-sm font-bold">
                      {formatBDT(
                        admissionChartQuery.data.summary.totalExpected,
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Collected</span>
                    <p className="text-sm font-bold text-emerald-700">
                      {formatBDT(
                        admissionChartQuery.data.summary.totalCollected,
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending Fee</span>
                    <p className="text-sm font-bold text-amber-700">
                      {formatBDT(admissionChartQuery.data.summary.totalPending)}
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
                      <th className="px-3 py-2">App No</th>
                      <th className="px-3 py-2">Applicant</th>
                      <th className="px-3 py-2">Guardian &amp; Phone</th>
                      <th className="px-3 py-2">Class</th>
                      <th className="px-3 py-2 text-right">Fee</th>
                      <th className="px-3 py-2">Method / TrxID</th>
                      <th className="px-3 py-2">Payment</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {admissionChartQuery.data.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          No matching admissions found.
                        </td>
                      </tr>
                    ) : (
                      admissionChartQuery.data.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2">{row.serial}</td>
                          <td className="px-3 py-2 font-mono">
                            {row.applicationNo}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.studentName}
                            {row.nameBangla && (
                              <div className="text-[11px] text-muted-foreground">
                                {row.nameBangla}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div>{row.guardianName ?? "—"}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {row.guardianPhone ?? "—"}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {row.className}
                            {row.sectionName ? ` (${row.sectionName})` : ""}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatBDT(row.admissionFee)}
                          </td>
                          <td className="px-3 py-2">
                            <div>{row.paymentMethod ?? "—"}</div>
                            {row.trxId && (
                              <div className="font-mono text-[10px]">
                                {row.trxId}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.paymentStatus}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.admissionStatus}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </PrintableReportSheet>
          )}
        </div>
      )}

      {/* TAB 3: FEE CHART & ACCOUNTING */}
      {activeTab === "fees" && (
        <div className="space-y-4">
          <div className="no-print grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value as "ALL" | FeeType)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="ALL">All Fee Types</option>
              {ALL_FEE_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
            <select
              value={feeClassId}
              onChange={(e) => {
                setFeeClassId(e.target.value);
                setFeeSectionId("");
              }}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={feeSectionId}
              onChange={(e) => setFeeSectionId(e.target.value)}
              disabled={!feeClassId}
              className="h-9 rounded-md border bg-background px-2.5 text-sm disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {feeSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              value={feeYear}
              onChange={(e) => setFeeYear(e.target.value)}
              placeholder="Academic Year (e.g. 2026)"
              className="h-9 text-sm"
            />
            <Input
              type="month"
              value={feeMonth}
              onChange={(e) => setFeeMonth(e.target.value)}
              className="h-9 text-sm"
              title="Billing Month"
            />
            <select
              value={feeExamId}
              onChange={(e) => setFeeExamId(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <select
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PAID">Paid</option>
              <option value="WAIVED">Waived</option>
            </select>
          </div>

          {feeChartQuery.isLoading ? (
            <LoadingState message="Loading fee accounting chart..." />
          ) : feeChartQuery.isError || !feeChartQuery.data ? (
            <ErrorState
              message={getApiErrorMessage(
                feeChartQuery.error,
                "Failed to load fee chart",
              )}
              onRetry={() => feeChartQuery.refetch()}
            />
          ) : (
            <PrintableReportSheet
              school={feeChartQuery.data.school}
              title={`Class-Wise ${feeType === "ALL" ? "All Student Fees" : (FEE_TYPE_LABELS[feeType] ?? feeType)} Accounting Sheet`}
              csvExport={{
                filename: `fee-chart-${sanitizeFilenamePart(feeType)}-${sanitizeFilenamePart(selectedFeeClassName || "all")}`,
                headers: [
                  "Serial",
                  "Roll",
                  "Student ID",
                  "Student Name",
                  "Class",
                  "Section",
                  "Academic Year",
                  "Fee Type",
                  "Title",
                  "Billing Month",
                  "Exam",
                  "Billed (BDT)",
                  "Paid (BDT)",
                  "Due (BDT)",
                  "Status",
                ],
                rows: [
                  ...feeChartQuery.data.rows.map((r) => [
                    r.serial,
                    r.rollNumber,
                    r.studentCode,
                    r.studentName,
                    r.className,
                    r.sectionName,
                    r.academicYear,
                    r.feeType,
                    r.title,
                    r.billingMonth,
                    r.examName,
                    r.billed,
                    r.paid,
                    r.due,
                    r.status,
                  ]),
                  [
                    "TOTAL",
                    "",
                    "",
                    `${feeChartQuery.data.summary.totalInvoices} invoices`,
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    `Waived: ${feeChartQuery.data.summary.totalWaived}`,
                    feeChartQuery.data.summary.totalBilled,
                    feeChartQuery.data.summary.totalCollected,
                    feeChartQuery.data.summary.totalDue,
                    "",
                  ],
                ],
              }}
              filterSummary={[
                `Fee Type: ${feeType === "ALL" ? "All" : (FEE_TYPE_LABELS[feeType] ?? feeType)}`,
                selectedFeeClassName
                  ? `Class: ${selectedFeeClassName}`
                  : "Class: All",
                ...(selectedFeeSectionName
                  ? [`Section: ${selectedFeeSectionName}`]
                  : []),
                queryFeeYear ? `Year: ${queryFeeYear}` : "Year: All",
                ...(feeMonth ? [`Month: ${feeMonth}`] : []),
                ...(selectedFeeExamName
                  ? [`Exam: ${selectedFeeExamName}`]
                  : []),
                ...(feeStatus ? [`Status: ${feeStatus}`] : []),
              ]}
              generatedBy={user?.name}
              footerTotals={
                <div className="space-y-3">
                  <div className="grid gap-3 text-xs sm:grid-cols-5">
                    <div>
                      <span className="text-muted-foreground">Invoices</span>
                      <p className="text-sm font-bold">
                        {feeChartQuery.data.summary.totalInvoices}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {feeChartQuery.data.summary.totalWaived > 0
                          ? "Total Billed (excl. waived)"
                          : "Total Billed"}
                      </span>
                      <p className="text-sm font-bold">
                        {formatBDT(feeChartQuery.data.summary.totalBilled)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Collected</span>
                      <p className="text-sm font-bold text-emerald-700">
                        {formatBDT(feeChartQuery.data.summary.totalCollected)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due</span>
                      <p className="text-sm font-bold text-amber-700">
                        {formatBDT(feeChartQuery.data.summary.totalDue)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Waived</span>
                      <p className="text-sm font-bold text-slate-600">
                        {formatBDT(feeChartQuery.data.summary.totalWaived)}
                      </p>
                    </div>
                  </div>
                  {feeChartQuery.data.summary.byFeeType.length > 1 && (
                    <div className="flex flex-wrap gap-2 border-t pt-2 text-[11px]">
                      {feeChartQuery.data.summary.byFeeType.map((b) => (
                        <span
                          key={b.feeType}
                          className="rounded border bg-background px-2 py-0.5"
                        >
                          <strong>{b.feeType}</strong>: Billed{" "}
                          {formatBDT(b.billed)} · Paid {formatBDT(b.collected)}{" "}
                          · Due {formatBDT(b.due)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Roll</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Class / Sec</th>
                      <th className="px-3 py-2">Fee Type &amp; Title</th>
                      <th className="px-3 py-2 text-right">Billed</th>
                      <th className="px-3 py-2 text-right">Paid</th>
                      <th className="px-3 py-2 text-right">Due</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {feeChartQuery.data.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          No matching fee invoices found.
                        </td>
                      </tr>
                    ) : (
                      feeChartQuery.data.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2">{row.serial}</td>
                          <td className="px-3 py-2 font-mono">
                            {row.rollNumber ?? "—"}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.studentName}
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {row.studentCode}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {row.className}
                            {row.sectionName ? ` (${row.sectionName})` : ""}
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{row.title}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {row.feeType}
                              {row.billingMonth ? ` • ${row.billingMonth}` : ""}
                              {row.examName ? ` • ${row.examName}` : ""}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatBDT(row.billed)}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-700">
                            {formatBDT(row.paid)}
                          </td>
                          <td className="px-3 py-2 text-right text-amber-700">
                            {formatBDT(row.due)}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </PrintableReportSheet>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ROLL ROSTER CHART */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="no-print grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={rosterClassId}
              onChange={(e) => {
                setRosterClassId(e.target.value);
                setRosterSectionId("");
              }}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={rosterSectionId}
              onChange={(e) => setRosterSectionId(e.target.value)}
              disabled={!rosterClassId}
              className="h-9 rounded-md border bg-background px-2.5 text-sm disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {rosterSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              value={rosterYear}
              onChange={(e) => setRosterYear(e.target.value)}
              placeholder="Academic Year (e.g. 2026)"
              className="h-9 text-sm"
            />
            <select
              value={rosterStatus}
              onChange={(e) => setRosterStatus(e.target.value)}
              className="h-9 rounded-md border bg-background px-2.5 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          {rosterChartQuery.isLoading ? (
            <LoadingState message="Loading student roster..." />
          ) : rosterChartQuery.isError || !rosterChartQuery.data ? (
            <ErrorState
              message={getApiErrorMessage(
                rosterChartQuery.error,
                "Failed to load student roster",
              )}
              onRetry={() => rosterChartQuery.refetch()}
            />
          ) : (
            <PrintableReportSheet
              school={rosterChartQuery.data.school}
              title="Class-Wise Student Roll / Roster Chart"
              csvExport={{
                filename: `student-roster-${sanitizeFilenamePart(selectedRosterClassName || "all")}-${sanitizeFilenamePart(queryRosterYear || "all")}`,
                headers: [
                  "Serial",
                  "Roll",
                  "Student ID",
                  "Student Name",
                  "Bangla Name",
                  "Class",
                  "Section",
                  "Academic Year",
                  "Residential Type",
                  "Guardian Name",
                  "Guardian Phone",
                  "Status",
                ],
                rows: [
                  ...rosterChartQuery.data.rows.map((r) => [
                    r.serial,
                    r.rollNumber,
                    r.studentId,
                    r.studentName,
                    r.nameBangla,
                    r.className,
                    r.sectionName,
                    r.academicYear,
                    r.residentialType,
                    r.guardianName,
                    r.guardianPhone,
                    r.status,
                  ]),
                  [
                    "TOTAL",
                    "",
                    `${rosterChartQuery.data.summary.totalStudents} students`,
                    `Active: ${rosterChartQuery.data.summary.activeCount}`,
                    `Residential: ${rosterChartQuery.data.summary.residentialCount}`,
                    `Non-Residential: ${rosterChartQuery.data.summary.nonResidentialCount}`,
                    `Day-Care: ${rosterChartQuery.data.summary.dayCareCount}`,
                    "",
                    "",
                    "",
                    "",
                    "",
                  ],
                ],
              }}
              filterSummary={[
                selectedRosterClassName
                  ? `Class: ${selectedRosterClassName}`
                  : "Class: All",
                ...(selectedRosterSectionName
                  ? [`Section: ${selectedRosterSectionName}`]
                  : []),
                queryRosterYear ? `Year: ${queryRosterYear}` : "Year: All",
                rosterStatus ? `Status: ${rosterStatus}` : "Status: All",
              ]}
              generatedBy={user?.name}
              footerTotals={
                <div className="grid gap-3 text-xs sm:grid-cols-5 lg:grid-cols-6">
                  <div>
                    <span className="text-muted-foreground">
                      Total Students
                    </span>
                    <p className="text-sm font-bold">
                      {rosterChartQuery.data.summary.totalStudents}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active</span>
                    <p className="text-sm font-bold text-emerald-700">
                      {rosterChartQuery.data.summary.activeCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Residential</span>
                    <p className="text-sm font-bold">
                      {rosterChartQuery.data.summary.residentialCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Non-Residential
                    </span>
                    <p className="text-sm font-bold">
                      {rosterChartQuery.data.summary.nonResidentialCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Day-Care</span>
                    <p className="text-sm font-bold">
                      {rosterChartQuery.data.summary.dayCareCount}
                    </p>
                  </div>
                  {(rosterChartQuery.data.summary.transferredCount ?? 0) >
                    0 && (
                    <div>
                      <span className="text-muted-foreground">Transferred</span>
                      <p className="text-sm font-bold text-amber-700">
                        {rosterChartQuery.data.summary.transferredCount}
                      </p>
                    </div>
                  )}
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Roll</th>
                      <th className="px-3 py-2">Student ID</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Class / Sec</th>
                      <th className="px-3 py-2">Guardian &amp; Phone</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rosterChartQuery.data.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          No enrolled students found for the selected filter.
                        </td>
                      </tr>
                    ) : (
                      rosterChartQuery.data.rows.map((row) => (
                        <tr key={row.enrollmentId}>
                          <td className="px-3 py-2">{row.serial}</td>
                          <td className="px-3 py-2 font-mono font-semibold">
                            {row.rollNumber ?? "—"}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {row.studentId}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {row.studentName}
                            {row.nameBangla && (
                              <div className="text-[11px] text-muted-foreground">
                                {row.nameBangla}
                              </div>
                            )}
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
                          <td className="px-3 py-2 font-medium">
                            {row.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </PrintableReportSheet>
          )}
        </div>
      )}
    </div>
  );
}

export function SchoolReportsWorkspace() {
  return (
    <Suspense
      fallback={<LoadingState message="Loading institution reports..." />}
    >
      <SchoolReportsWorkspaceInner />
    </Suspense>
  );
}

function OverviewTab({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  data: ReturnType<typeof useSchoolReportOverview>["data"];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (isLoading)
    return <LoadingState message="Loading institution reports..." />;
  if (isError || !data) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          error,
          "Failed to load institution reports",
        )}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Collection */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" />
          Fee Collection &amp; Dues (Unified Ledger)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Billed"
            value={formatBDT(data.fees.totalBilled)}
          />
          <StatCard
            label="Total Collected"
            value={formatBDT(data.fees.totalCollected)}
            sub={`${data.fees.paidCount} paid • ${data.fees.partialCount} partial`}
          />
          <StatCard
            label="Outstanding Dues"
            value={formatBDT(data.fees.totalDue)}
            sub={`${data.fees.unpaidCount} unpaid invoices`}
          />
          <StatCard
            label="Pending TrxID Verifications"
            value={String(data.fees.pendingVerifications)}
            sub="Awaiting staff review"
          />
        </div>

        {data.fees.byFeeType && data.fees.byFeeType.length > 0 && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Fee Category</th>
                  <th className="px-4 py-2.5 text-right">Invoices</th>
                  <th className="px-4 py-2.5 text-right">Billed</th>
                  <th className="px-4 py-2.5 text-right">Collected</th>
                  <th className="px-4 py-2.5 text-right">Due</th>
                  <th className="px-4 py-2.5 text-right">Waived</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.fees.byFeeType.map((bucket) => (
                  <tr key={bucket.feeType}>
                    <td className="px-4 py-2.5 font-medium">
                      {FEE_TYPE_LABELS[bucket.feeType] ?? bucket.feeType}
                    </td>
                    <td className="px-4 py-2.5 text-right">{bucket.count}</td>
                    <td className="px-4 py-2.5 text-right">
                      {formatBDT(bucket.billed)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">
                      {formatBDT(bucket.collected)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-amber-700">
                      {formatBDT(bucket.due)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {formatBDT(bucket.waived)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Admissions Pipeline & Revenue */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-primary" />
          Admissions Pipeline &amp; Revenue
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Applications"
            value={String(data.admissions.total)}
            sub={`${data.admissions.pending} pending • ${data.admissions.approved} approved • ${data.admissions.rejected} rejected`}
          />
          <StatCard
            label="Expected Admission Fee"
            value={formatBDT(data.admissions.totalExpected ?? 0)}
          />
          <StatCard
            label="Admission Fee Collected"
            value={formatBDT(data.admissions.collectedVerified ?? 0)}
            sub={
              (data.admissions.unlinkedCollected ?? 0) > 0
                ? `${formatBDT(data.admissions.unlinkedCollected ?? 0)} awaiting approval sync`
                : "All synced to fee ledger"
            }
          />
          <StatCard
            label="Admission Fee Pending"
            value={formatBDT(data.admissions.pendingPayment ?? 0)}
          />
        </div>
      </section>

      {/* Payroll */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          Teacher Payroll Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Gross Payroll"
            value={formatBDT(data.payroll.totalGross)}
            sub={`${data.payroll.totalRecords} salary records`}
          />
          <StatCard
            label="Total Disbursed"
            value={formatBDT(data.payroll.totalPaid)}
            sub={`${data.payroll.paidCount} paid`}
          />
          <StatCard
            label="Pending Disbursement"
            value={formatBDT(data.payroll.totalPending)}
            sub={`${data.payroll.unpaidCount} unpaid`}
          />
        </div>
      </section>

      {/* Academics & Attendance */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          Academics &amp; 30-Day Attendance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Students"
            value={String(data.academics.activeStudents)}
            sub={`${data.academics.activeClasses} active classes`}
          />
          <StatCard
            label="Active Teachers"
            value={String(data.academics.activeTeachers)}
          />
          <StatCard
            label="30-Day Attendance Rate"
            value={`${data.academics.attendanceRate30d}%`}
            sub={`${data.academics.presentAttendance30d} / ${data.academics.totalAttendance30d} present`}
          />
          <StatCard
            label="Exams &amp; Results"
            value={String(data.academics.totalExams)}
            sub={`${data.academics.totalResults} result entries`}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
        <span>{label}</span>
        <ClipboardCheck className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
