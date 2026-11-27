"use client";

import { Download, FileDown, Printer } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface PrintableSchoolHeader {
  name: string;
  code?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface CsvExportConfig {
  filename: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
}

interface PrintableReportSheetProps {
  school?: PrintableSchoolHeader | null;
  title: string;
  subtitle?: string;
  filterSummary?: string[];
  generatedBy?: string | null;
  children: ReactNode;
  footerTotals?: ReactNode;
  toolbarExtra?: ReactNode;
  csvExport?: CsvExportConfig;
}

const escapeCsvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const downloadCsvReport = (config: CsvExportConfig) => {
  if (typeof window === "undefined") return;
  const lines = [
    config.headers.map(escapeCsvCell).join(","),
    ...config.rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  // UTF-8 BOM ensures Microsoft Excel renders Bangla & ৳ cleanly
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config.filename.endsWith(".csv")
    ? config.filename
    : `${config.filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const triggerSheetPdfPrint = () => {
  if (typeof window === "undefined") return;
  document.body.classList.add("printing-sheet");
  const cleanup = () => {
    document.body.classList.remove("printing-sheet");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  setTimeout(cleanup, 1500);
};

export function PrintableReportSheet({
  school,
  title,
  subtitle,
  filterSummary = [],
  generatedBy,
  children,
  footerTotals,
  toolbarExtra,
  csvExport,
}: PrintableReportSheetProps) {
  const generatedAt = new Date().toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">{toolbarExtra}</div>
        <div className="flex flex-wrap items-center gap-2">
          {csvExport && (
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadCsvReport(csvExport)}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          <Button
            type="button"
            onClick={triggerSheetPdfPrint}
            className="gap-1.5"
          >
            <FileDown className="h-4 w-4" />
            Export PDF / Print
          </Button>
        </div>
      </div>

      <div
        id="printable-sheet"
        className="print-report-sheet space-y-4 rounded-xl border bg-card p-5 text-foreground"
      >
        {/* Official School Header */}
        <div className="flex flex-col items-center gap-2 border-b pb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            {school?.logo && (
              // biome-ignore lint/performance/noImgElement: print-safe img for PDF export
              <img
                src={school.logo}
                alt={school.name}
                className="h-12 w-12 rounded-lg object-contain"
              />
            )}
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {school?.name ?? "Institution Accounting Report"}
              </h2>
              {(school?.address || school?.phone) && (
                <p className="text-xs text-muted-foreground">
                  {[
                    school.address,
                    school.phone ? `Phone: ${school.phone}` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-1">
            <h3 className="text-base font-semibold uppercase tracking-wide">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {filterSummary.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
              {filterSummary.map((item) => (
                <span
                  key={item}
                  className="rounded-md border bg-muted/40 px-2 py-0.5 font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            Generated: {generatedAt}
            {generatedBy ? ` • By: ${generatedBy}` : ""}
          </p>
        </div>

        {/* Main Table / Content */}
        <div>{children}</div>

        {/* Summary Totals Footer */}
        {footerTotals && (
          <div className="rounded-lg border bg-muted/20 p-3">
            {footerTotals}
          </div>
        )}

        {/* Signature Lines (Always shown on print, subtle on screen) */}
        <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
          <div>
            <div className="mx-auto w-48 border-t border-slate-400 pt-1.5 font-medium">
              Accountant / Manager
            </div>
          </div>
          <div>
            <div className="mx-auto w-48 border-t border-slate-400 pt-1.5 font-medium">
              Principal / Headmaster
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrintReceiptButton({
  label = "Print / Save PDF",
}: {
  label?: string;
}) {
  return (
    <Button type="button" onClick={triggerSheetPdfPrint} className="gap-1.5">
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
