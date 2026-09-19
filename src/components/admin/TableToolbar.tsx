"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export interface FilterDef {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Search box and filters that live in the URL, so a filtered list can be
 * shared or bookmarked and the back button works. Changing anything goes
 * back to page 1.
 */
export function TableToolbar({ searchPlaceholder, filters = [] }: { searchPlaceholder?: string; filters?: FilterDef[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  // Search after a short pause in typing.
  useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    const t = setTimeout(() => apply({ q: q.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchPlaceholder && (
        <label className="relative min-w-0 flex-1 sm:max-w-xs">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
        </label>
      )}
      {filters.map((f) => (
        <label key={f.param} className="flex items-center gap-2 text-support text-ink-3">
          <span className="sr-only sm:not-sr-only">{f.label}</span>
          <select
            value={params.get(f.param) ?? ""}
            onChange={(e) => apply({ [f.param]: e.target.value || null })}
            className="h-9 rounded-control border border-line-strong bg-surface px-2.5 text-body text-ink focus:border-ink focus:outline-none"
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
