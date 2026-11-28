export const formatBDT = (amount: number): string =>
  `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const formatSignedBDT = (amount: number): string => {
  const abs = formatBDT(Math.abs(amount));
  if (amount > 0) return `+${abs}`;
  if (amount < 0) return `-${abs}`;
  return abs;
};

/**
 * Returns today's calendar date (YYYY-MM-DD) in Asia/Dhaka so browser timezone
 * never drifts from Bangladesh school accounting dates.
 */
export const getTodayDhakaDate = (now: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "2026";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
};

export const getCurrentDhakaMonth = (now: Date = new Date()): string =>
  getTodayDhakaDate(now).slice(0, 7);

export const shiftBillingMonth = (
  billingMonth: string,
  delta: number,
): string => {
  const [yStr = "2026", mStr = "01"] = billingMonth.split("-");
  const date = new Date(Date.UTC(Number(yStr), Number(mStr) - 1 + delta, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const formatMonthLong = (billingMonth: string): string => {
  const [yStr = "2026", mStr = "01"] = billingMonth.split("-");
  const date = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, 15));
  if (Number.isNaN(date.getTime())) return billingMonth;
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const formatMonthShort = (billingMonth: string): string => {
  const [yStr = "2026", mStr = "01"] = billingMonth.split("-");
  const date = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, 15));
  if (Number.isNaN(date.getTime())) return billingMonth;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
};

/**
 * Preserves Unicode (including Bangla) sheet names in downloaded CSV filenames
 * while stripping only filesystem-unsafe characters.
 */
export const sanitizeFilenamePreservingUnicode = (
  name: string,
  fallback: string,
): string => {
  const cleaned = name
    .trim()
    .replace(/[/\\:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
};
