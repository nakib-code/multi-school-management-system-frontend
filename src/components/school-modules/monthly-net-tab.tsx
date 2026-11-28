"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { PrintableReportSheet } from "@/components/shared/printable-report-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMonthlyNetReport } from "@/features/reports/hooks";
import { getApiErrorMessage } from "@/lib/api";

const formatBDT = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatSignedBDT = (amount: number) => {
  const abs = formatBDT(Math.abs(amount));
  if (amount > 0) return `+${abs}`;
  if (amount < 0) return `-${abs}`;
  return abs;
};

const getCurrentMonth = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const shiftBillingMonth = (billingMonth: string, delta: number): string => {
  const [yStr, mStr] = billingMonth.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const formatMonthShort = (billingMonth: string): string => {
  const [yStr, mStr] = billingMonth.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1, 1);
  if (Number.isNaN(date.getTime())) return billingMonth;
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const formatMonthLong = (billingMonth: string): string => {
  const [yStr, mStr] = billingMonth.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1, 1);
  if (Number.isNaN(date.getTime())) return billingMonth;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export function MonthlyNetTab({
  schoolId,
  generatedBy,
}: {
  schoolId: number;
  generatedBy?: string | null;
}) {
  const [billingMonth, setBillingMonth] = useState<string>(getCurrentMonth);
  const [trendMonths, setTrendMonths] = useState<number>(6);

  const query = useMonthlyNetReport(schoolId, {
    billingMonth,
    trendMonths,
  });

  const data = query.data;

  const maxDailyValue = useMemo(() => {
    if (!data) return 0;
    return data.dailySeries.reduce(
      (max, d) => Math.max(max, d.income, d.expense),
      0,
    );
  }, [data]);

  const maxTrendValue = useMemo(() => {
    if (!data) return 0;
    return data.trend.reduce(
      (max, t) => Math.max(max, t.totalIncome, t.totalExpense),
      0,
    );
  }, [data]);

  const trendTotals = useMemo(() => {
    if (!data) return { income: 0, expense: 0, net: 0 };
    const income = data.trend.reduce((s, t) => s + t.totalIncome, 0);
    const expense = data.trend.reduce((s, t) => s + t.totalExpense, 0);
    return {
      income: Math.round((income + Number.EPSILON) * 100) / 100,
      expense: Math.round((expense + Number.EPSILON) * 100) / 100,
      net: Math.round((income - expense + Number.EPSILON) * 100) / 100,
    };
  }, [data]);

  const isSurplus = (data?.summary.netBalance ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Month & Trend Range Filter Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">
              মাসিক আয় বনাম খরচ (নিট উদ্বৃত্ত / ঘাটতি)
            </p>
            <p className="text-xs text-muted-foreground">
              ভেরিফায়েড আয় এবং কাস্টম খরচের শিটের সমন্বিত মাসিক নিট হিসাব ও ট্রেন্ড।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
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

          <select
            value={trendMonths}
            onChange={(e) => setTrendMonths(Number(e.target.value))}
            aria-label="Trend months"
            className="h-9 rounded-md border bg-background px-2.5 text-sm"
          >
            <option value={3}>৩ মাসের ট্রেন্ড</option>
            <option value={6}>৬ মাসের ট্রেন্ড</option>
            <option value={12}>১২ মাসের ট্রেন্ড</option>
          </select>
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState message="মাসিক আয় বনাম খরচের নিট হিসাব লোড হচ্ছে..." />
      ) : query.isError || !data ? (
        <ErrorState
          message={getApiErrorMessage(
            query.error,
            "Failed to load monthly net income vs expense report",
          )}
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {/* 4 Summary Cards */}
          <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
                <span>মোট আয় (Total Income)</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-emerald-900">
                {formatBDT(data.summary.totalIncome)}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700">
                {formatMonthLong(data.billingMonth)}
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-rose-800">
                <span>মোট খরচ (Total Expense)</span>
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-rose-900">
                {formatBDT(data.summary.totalExpense)}
              </p>
              <p className="mt-0.5 text-[11px] text-rose-700">
                {data.expenseBreakdown.length}টি খরচের শিট
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isSurplus
                  ? "border-emerald-300 bg-emerald-50/70"
                  : "border-red-300 bg-red-50/70"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span
                  className={isSurplus ? "text-emerald-800" : "text-red-800"}
                >
                  নিট উদ্বৃত্ত / ঘাটতি
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSurplus
                      ? "bg-emerald-200/70 text-emerald-900"
                      : "bg-red-200/70 text-red-900"
                  }`}
                >
                  {isSurplus ? "উদ্বৃত্ত (SURPLUS)" : "ঘাটতি (DEFICIT)"}
                </span>
              </div>
              <p
                className={`mt-1.5 text-2xl font-bold ${
                  isSurplus ? "text-emerald-800" : "text-red-700"
                }`}
              >
                {formatSignedBDT(data.summary.netBalance)}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                খরচের অনুপাত (Expense Ratio)
              </p>
              <p className="mt-1.5 text-2xl font-bold">
                {data.summary.expenseSharePercent}%
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                মোট আয়ের বিপরীতে খরচের হার
              </p>
            </div>
          </div>

          {/* Printable Sheet */}
          <PrintableReportSheet
            school={data.school}
            title={`মাসিক আয় বনাম খরচ (নিট হিসাব) — ${formatMonthLong(data.billingMonth)}`}
            subtitle="সমন্বিত আয় (ছাত্র ফি ও অন্যান্য আয়) বনাম কাস্টম খরচের শিট প্রতিবেদন"
            filterSummary={[
              `মাস: ${formatMonthLong(data.billingMonth)} (${data.billingMonth})`,
              `ট্রেন্ড: সর্বশেষ ${data.trendMonths} মাস`,
              `অবস্থা: ${isSurplus ? "উদ্বৃত্ত (SURPLUS)" : "ঘাটতি (DEFICIT)"}`,
            ]}
            generatedBy={generatedBy}
            csvExport={{
              filename: `monthly-net-${data.billingMonth}-${data.trendMonths}m`,
              headers: [
                "Section",
                "Period / Item",
                "Income (BDT)",
                "Expense (BDT)",
                "Net Balance (BDT)",
                "Status / Share",
              ],
              rows: [
                ...data.incomeBreakdown.byCategory.map((c) => [
                  "Income Category",
                  c.label,
                  c.amount,
                  0,
                  c.amount,
                  `${c.percentage}% (${c.count} entries)`,
                ]),
                ...data.expenseBreakdown.map((e) => [
                  "Expense Sheet",
                  e.sheetName,
                  0,
                  e.totalAmount,
                  -e.totalAmount,
                  `${e.percentage}% (${e.entryCount} entries)`,
                ]),
                ...data.trend.map((t) => [
                  `${data.trendMonths}-Month Trend`,
                  t.billingMonth,
                  t.totalIncome,
                  t.totalExpense,
                  t.netBalance,
                  t.status,
                ]),
                [
                  "TOTAL / NET",
                  `Selected Month (${data.billingMonth})`,
                  data.summary.totalIncome,
                  data.summary.totalExpense,
                  data.summary.netBalance,
                  `${data.summary.status} (${data.summary.expenseSharePercent}% expense ratio)`,
                ],
              ],
            }}
            footerTotals={
              <div className="grid gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">মোট আয়</span>
                  <p className="text-sm font-bold text-emerald-700">
                    {formatBDT(data.summary.totalIncome)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">মোট খরচ</span>
                  <p className="text-sm font-bold text-rose-700">
                    {formatBDT(data.summary.totalExpense)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    নিট ব্যালেন্স ({data.summary.status})
                  </span>
                  <p
                    className={`text-base font-bold ${
                      isSurplus ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {formatSignedBDT(data.summary.netBalance)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">খরচের অনুপাত</span>
                  <p className="text-sm font-bold">
                    {data.summary.expenseSharePercent}%
                  </p>
                </div>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Income vs Expense Selected Month Visual Comparison + Breakdowns */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Income Breakdown */}
                <div className="rounded-xl border bg-muted/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      আয়ের খাতসমূহ (Income Breakdown)
                    </h4>
                    <span className="text-xs font-bold text-emerald-700">
                      {formatBDT(data.summary.totalIncome)}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {data.incomeBreakdown.byCategory.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {cat.label}{" "}
                            <span className="text-[10px] text-muted-foreground">
                              ({cat.count})
                            </span>
                          </span>
                          <span className="font-semibold">
                            {formatBDT(cat.amount)}{" "}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              ({cat.percentage}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(100, cat.percentage)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sheet-Wise Expense Breakdown */}
                <div className="rounded-xl border bg-muted/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                      খরচের শিটভিত্তিক হিসাব (Expense Breakdown)
                    </h4>
                    <span className="text-xs font-bold text-rose-700">
                      {formatBDT(data.summary.totalExpense)}
                    </span>
                  </div>
                  {data.expenseBreakdown.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      এই মাসে ({data.billingMonth}) কোনো কাস্টম খরচের এন্ট্রি নেই।
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {data.expenseBreakdown.map((sheet) => (
                        <div key={sheet.sheetId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">
                              {sheet.sheetName}{" "}
                              <span className="text-[10px] text-muted-foreground">
                                ({sheet.entryCount} এন্ট্রি)
                              </span>
                            </span>
                            <span className="font-semibold">
                              {formatBDT(sheet.totalAmount)}{" "}
                              <span className="text-[10px] font-normal text-muted-foreground">
                                ({sheet.percentage}%)
                              </span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-rose-500"
                              style={{
                                width: `${Math.min(100, sheet.percentage)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Month Daily Income vs Expense Comparison Chart */}
              <div className="rounded-xl border bg-muted/10 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      দৈনিক আয় বনাম খরচ — {formatMonthLong(data.billingMonth)}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      প্রতিদিনের আয় ও খরচের তুলনামূলক চিত্র
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                      আয় (Income)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                      খরচ (Expense)
                    </span>
                  </div>
                </div>

                {maxDailyValue <= 0 ? (
                  <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                    এই মাসে কোনো আয় বা খরচের রেকর্ড নেই।
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-1">
                    <div className="flex h-36 min-w-[560px] items-end gap-1 border-b border-l px-2 pt-4">
                      {data.dailySeries.map((pt) => {
                        const incPct =
                          pt.income > 0
                            ? Math.max(
                                5,
                                Math.round((pt.income / maxDailyValue) * 100),
                              )
                            : 0;
                        const expPct =
                          pt.expense > 0
                            ? Math.max(
                                5,
                                Math.round((pt.expense / maxDailyValue) * 100),
                              )
                            : 0;
                        return (
                          <div
                            key={pt.date}
                            className="flex h-full flex-1 flex-col items-center justify-end"
                            title={`${pt.date} | আয়: ${formatBDT(pt.income)} | খরচ: ${formatBDT(pt.expense)} | নিট: ${formatSignedBDT(pt.net)}`}
                          >
                            <div className="flex h-full w-full items-end justify-center gap-0.5">
                              <div
                                className={`w-1.5 rounded-t ${
                                  pt.income > 0
                                    ? "bg-emerald-500"
                                    : "bg-muted/30"
                                }`}
                                style={{
                                  height: pt.income > 0 ? `${incPct}%` : "2px",
                                }}
                              />
                              <div
                                className={`w-1.5 rounded-t ${
                                  pt.expense > 0 ? "bg-rose-500" : "bg-muted/30"
                                }`}
                                style={{
                                  height: pt.expense > 0 ? `${expPct}%` : "2px",
                                }}
                              />
                            </div>
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

              {/* 6-Month (or N-Month) Trend Chart + Summary Table */}
              <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      সর্বশেষ {data.trendMonths} মাসের আয়-খরচ ট্রেন্ড (
                      {data.trendMonths}-Month Trend)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                      আয়
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                      খরচ
                    </span>
                  </div>
                </div>

                {maxTrendValue > 0 && (
                  <div className="overflow-x-auto pb-1">
                    <div className="flex h-40 min-w-[420px] items-end gap-4 border-b border-l px-4 pt-4">
                      {data.trend.map((t) => {
                        const incPct =
                          t.totalIncome > 0
                            ? Math.max(
                                6,
                                Math.round(
                                  (t.totalIncome / maxTrendValue) * 100,
                                ),
                              )
                            : 0;
                        const expPct =
                          t.totalExpense > 0
                            ? Math.max(
                                6,
                                Math.round(
                                  (t.totalExpense / maxTrendValue) * 100,
                                ),
                              )
                            : 0;
                        const isSelected = t.billingMonth === data.billingMonth;
                        return (
                          <div
                            key={t.billingMonth}
                            className={`flex h-full flex-1 flex-col items-center justify-end rounded-t px-1 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                            title={`${t.billingMonth} | আয়: ${formatBDT(t.totalIncome)} | খরচ: ${formatBDT(t.totalExpense)} | নিট: ${formatSignedBDT(t.netBalance)}`}
                          >
                            <div className="flex h-full items-end gap-1.5">
                              <div
                                className={`w-5 rounded-t ${
                                  t.totalIncome > 0
                                    ? "bg-emerald-500"
                                    : "bg-muted/40"
                                }`}
                                style={{
                                  height:
                                    t.totalIncome > 0 ? `${incPct}%` : "3px",
                                }}
                              />
                              <div
                                className={`w-5 rounded-t ${
                                  t.totalExpense > 0
                                    ? "bg-rose-500"
                                    : "bg-muted/40"
                                }`}
                                style={{
                                  height:
                                    t.totalExpense > 0 ? `${expPct}%` : "3px",
                                }}
                              />
                            </div>
                            <span
                              className={`mt-1.5 text-[10px] ${
                                isSelected
                                  ? "font-bold text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatMonthShort(t.billingMonth)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trend Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">মাস (Month)</th>
                        <th className="px-3 py-2 text-right">মোট আয় (BDT)</th>
                        <th className="px-3 py-2 text-right">মোট খরচ (BDT)</th>
                        <th className="px-3 py-2 text-right">নিট ব্যালেন্স</th>
                        <th className="px-3 py-2 text-right">অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.trend.map((t) => (
                        <tr
                          key={t.billingMonth}
                          className={
                            t.billingMonth === data.billingMonth
                              ? "bg-primary/5 font-semibold"
                              : undefined
                          }
                        >
                          <td className="px-3 py-2">
                            {formatMonthLong(t.billingMonth)} ({t.billingMonth})
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-700">
                            {formatBDT(t.totalIncome)}
                          </td>
                          <td className="px-3 py-2 text-right text-rose-700">
                            {formatBDT(t.totalExpense)}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-semibold ${
                              t.netBalance >= 0
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {formatSignedBDT(t.netBalance)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                t.status === "SURPLUS"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {t.status === "SURPLUS"
                                ? "উদ্বৃত্ত (SURPLUS)"
                                : "ঘাটতি (DEFICIT)"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 bg-muted/30 font-semibold">
                      <tr>
                        <td className="px-3 py-2.5 uppercase">
                          TOTAL / NET ({data.trendMonths} Months)
                        </td>
                        <td className="px-3 py-2.5 text-right text-emerald-700">
                          {formatBDT(trendTotals.income)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-rose-700">
                          {formatBDT(trendTotals.expense)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-bold ${
                            trendTotals.net >= 0
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {formatSignedBDT(trendTotals.net)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {trendTotals.net >= 0 ? "SURPLUS" : "DEFICIT"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </PrintableReportSheet>
        </>
      )}
    </div>
  );
}
