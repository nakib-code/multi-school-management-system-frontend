export const SCHOOL_TIMEZONE = "Asia/Dhaka";
export const TEACHER_EDIT_WINDOW_DAYS = 3;

/**
 * Returns today's date in Asia/Dhaka as YYYY-MM-DD.
 * Never uses new Date().toISOString().slice(0, 10).
 */
export function getSchoolTodayStr(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function getSchoolCurrentMonthStr(now: Date = new Date()): string {
  return getSchoolTodayStr(now).slice(0, 7);
}

/**
 * Extracts YYYY-MM-DD safely from an ISO UTC-midnight date string or Date.
 */
export function toDateOnlyStr(input: string | Date): string {
  if (typeof input === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(input.trim());
    if (match) return match[1];
    const parsed = new Date(input);
    return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(parsed.getUTCDate()).padStart(2, "0")}`;
  }
  return `${input.getUTCFullYear()}-${String(input.getUTCMonth() + 1).padStart(2, "0")}-${String(input.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Formats a YYYY-MM-DD (or UTC midnight ISO) string into a clean human-readable date
 * without local-timezone off-by-one shifts.
 */
export function formatLocalDateDisplay(input: string | Date): string {
  const dateStr = toDateOnlyStr(input);
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const utcDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(utcDate);
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  const utcDate = new Date(Date.UTC(y, m - 1, 15, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(utcDate);
}

export function shiftMonthStr(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return getSchoolCurrentMonthStr();
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function isWithinTeacherEditWindow(
  dateStr: string,
  todayStr: string = getSchoolTodayStr(),
): boolean {
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const [dy, dm, dd] = dateStr.split("-").map(Number);
  if (!ty || !tm || !td || !dy || !dm || !dd) return false;
  const todayMs = Date.UTC(ty, tm - 1, td);
  const dateMs = Date.UTC(dy, dm - 1, dd);
  const diffDays = Math.round((todayMs - dateMs) / 86_400_000);
  return diffDays >= 0 && diffDays <= TEACHER_EDIT_WINDOW_DAYS;
}

export const WEEKDAY_NAMES: readonly {
  value: number;
  short: string;
  label: string;
}[] = [
  { value: 0, short: "Sun", label: "Sunday" },
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
];
