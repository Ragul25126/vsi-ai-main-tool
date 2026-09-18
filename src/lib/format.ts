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
