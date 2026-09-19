/** Shared helpers for platform admin pages. No server imports. */

export const PAGE_SIZE = 25;

export type Params = Record<string, string | string[] | undefined>;

export function param(p: Params, key: string): string {
  const v = p[key];
  return typeof v === "string" ? v.trim() : "";
}

export function pageOf(p: Params): number {
  const n = Number.parseInt(param(p, "page"), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pageCount: number; total: number } {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const safe = Math.min(page, pageCount);
  return { items: items.slice((safe - 1) * size, safe * size), page: safe, pageCount, total: items.length };
}

/** Build a link to the same list with some params changed (others kept). */
export function hrefWith(path: string, p: Params, changes: Record<string, string | number | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (typeof v === "string" && v) q.set(k, v);
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === "") q.delete(k);
    else q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export function matches(text: (string | null | undefined)[], query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return text.some((t) => (t ?? "").toLowerCase().includes(q));
}

/** PostgREST / Postgres "function or table doesn't exist" (a migration isn't applied). */
export function isMissingObject(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return ["42883", "42P01", "PGRST202", "PGRST205"].includes(err.code ?? "") || /does not exist|could not find the function|schema cache/i.test(err.message ?? "");
}

/** Plain-language role names. Raw role ids are never shown. */
export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Platform admin",
  pilot: "Member",
};

export function roleLabel(role: string | null | undefined): string {
  return role ? ROLE_LABEL[role] ?? "Member" : "No role";
}

/** Result of an admin data load: real rows, or a reason there are none. */
export type Load<T> = { ok: true; data: T; partial?: string } | { ok: false; message: string };
