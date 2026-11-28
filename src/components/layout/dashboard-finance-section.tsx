"use client";

import {
  AlertTriangle,
  Banknote,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
  UserX,
} from "lucide-react";
import Link from "next/link";
import type { SchoolDashboardFinance } from "@/features/dashboard/types";
import { formatBDT, formatMonthLong, formatSignedBDT } from "@/lib/dhaka-date";

export function DashboardFinanceSection({
  userRole,
  finance,
}: {
  userRole: "ADMIN" | "MANAGER";
  finance?: SchoolDashboardFinance;
}) {
  const basePath =
    userRole === "MANAGER" ? "/dashboard/manager" : "/dashboard/admin";

  if (!finance) return null;

  const isSurplus = finance.monthlyNetBalance >= 0;

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            আর্থিক সারসংক্ষেপ — {formatMonthLong(finance.billingMonth)}
          </h2>
          <p className="text-xs text-muted-foreground">
            চলতি মাসের আয়, খরচ (বেতনসহ), নিট উদ্বৃত্ত/ঘাটতি এবং আজকের (
            {finance.todayDate}) ক্যাশ ইন হ্যান্ড।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${basePath}/income`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            আয়ের হিসাব
          </Link>
          <Link
            href={`${basePath}/custom-expenses`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            <Receipt className="h-3.5 w-3.5 text-rose-600" />
            কাস্টম বিল / খরচ
          </Link>
          <Link
            href={`${basePath}/reports?tab=monthly-net`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            <Scale className="h-3.5 w-3.5 text-primary" />
            আয় বনাম খরচ (নিট)
          </Link>
          <Link
            href={`${basePath}/reports?tab=defaulters`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            <UserX className="h-3.5 w-3.5 text-amber-600" />
            বকেয়া তালিকা
          </Link>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
            <span>চলতি মাসের আয় (Income)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-emerald-900">
            {formatBDT(finance.monthlyIncome)}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            ভেরিফায়েড ফি + অন্যান্য আয়
          </p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-rose-800">
            <span>চলতি মাসের খরচ (Expense)</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-rose-900">
            {formatBDT(finance.monthlyTotalExpense)}
          </p>
          <p className="mt-0.5 text-[11px] text-rose-700">
            কাস্টম: {formatBDT(finance.monthlyCustomExpense)} • বেতন:{" "}
            {formatBDT(finance.monthlyPayrollExpense)}
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
            <span className={isSurplus ? "text-emerald-800" : "text-red-800"}>
              নিট ব্যালেন্স (Net)
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isSurplus
                  ? "bg-emerald-200/70 text-emerald-900"
                  : "bg-red-200/70 text-red-900"
              }`}
            >
              {isSurplus ? "SURPLUS" : "DEFICIT"}
            </span>
          </div>
          <p
            className={`mt-1.5 text-xl font-bold ${
              isSurplus ? "text-emerald-800" : "text-red-700"
            }`}
          >
            {formatSignedBDT(finance.monthlyNetBalance)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isSurplus ? "মাসিক উদ্বৃত্ত" : "মাসিক ঘাটতি"}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-blue-900">
            <span>আজকের ক্যাশ ইন হ্যান্ড</span>
            <Banknote className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-blue-950">
            {formatSignedBDT(finance.todayCashInHand)}
          </p>
          <p className="mt-0.5 text-[11px] text-blue-800">
            নগদ আদায় {formatBDT(finance.todayCashCollected)} − নগদ খরচ{" "}
            {formatBDT(finance.todayCashSpent)}
          </p>
        </div>
      </div>

      {/* Actionable Alerts */}
      {(finance.pendingPaymentVerifications > 0 ||
        finance.overdueFeesCount > 0) && (
        <div className="flex flex-wrap gap-2.5 border-t pt-3 text-xs">
          {finance.pendingPaymentVerifications > 0 && (
            <Link
              href={`${basePath}/fees`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              {finance.pendingPaymentVerifications}টি পেন্ডিং পেমেন্ট ভেরিফিকেশন
            </Link>
          )}
          {finance.overdueFeesCount > 0 && (
            <Link
              href={`${basePath}/reports?tab=defaulters`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-medium text-red-900 hover:bg-red-100"
            >
              <UserX className="h-3.5 w-3.5 text-red-600" />
              {finance.overdueFeesCount}টি মেয়াদোত্তীর্ণ বকেয়া ফি (Overdue)
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
