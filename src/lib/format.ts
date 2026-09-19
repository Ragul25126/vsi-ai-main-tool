const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "12 Sep 2026" */
export function formatDate(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATE.format(d) : "";
}

/** "12 Sep" */
export function formatShortDate(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? SHORT_DATE.format(d) : "";
}

/** "12 Sep, 09:14" */
export function formatDateTime(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATE_TIME.format(d) : "";
}

/** Whole days between an ISO date and now. */
export function daysAgo(iso: string | null | undefined, now: Date = new Date()): number | null {
  const d = parse(iso);
  if (!d) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/**
 * Operational time: "Just now", "12 min ago", "Today, 10:32", "Yesterday, 18:05",
 * then "12 Sep, 09:14". Empty string for missing dates.
 */
export function formatWhen(iso: string | null | undefined, now: Date = new Date()): string {
  const d = parse(iso);
  if (!d) return "";
  const mins = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (mins >= 0 && mins < 1) return "Just now";
  if (mins >= 1 && mins < 60) return `${mins} min ago`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= startOfToday && d.getTime() <= now.getTime()) return `Today, ${TIME.format(d)}`;
  if (d.getTime() >= startOfToday - 86_400_000 && d.getTime() < startOfToday) return `Yesterday, ${TIME.format(d)}`;
  return DATE_TIME.format(d);
}

/** "3 min", "1 h 12 min", "45 s": for job durations. Null when either end is missing. */
export function formatDuration(startIso: string | null | undefined, endIso: string | null | undefined): string | null {
  const a = parse(startIso);
  const b = parse(endIso);
  if (!a || !b) return null;
  const s = Math.max(0, Math.round((b.getTime() - a.getTime()) / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
