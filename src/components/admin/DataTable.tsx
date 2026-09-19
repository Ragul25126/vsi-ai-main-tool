import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column {
  label: string;
  /** Tailwind classes for the cell, e.g. "text-right tabular". */
  className?: string;
  /** Hide on the stacked phone layout (secondary detail). */
  hideOnMobile?: boolean;
}

export interface Row {
  key: string;
  cells: ReactNode[];
  /** Makes the whole row open this page. */
  href?: string;
}

/**
 * Operational table. A real <table> on wide screens; on phones each row
 * becomes a short labelled list, so nothing scrolls sideways.
 */
export function DataTable({ columns, rows, empty, caption }: { columns: Column[]; rows: Row[]; empty: ReactNode; caption?: string }) {
  if (rows.length === 0) {
    return <div className="rounded-panel border border-line bg-surface px-4 py-8 text-center text-body text-ink-2">{empty}</div>;
  }

  return (
    <div className="rounded-panel border border-line bg-surface">
      <table className="hidden w-full text-left text-support md:table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.label} scope="col" className={cn("px-4 py-2.5 text-caption font-medium text-ink-3", c.className)}>
                {c.label}
              </th>
            ))}
            {rows.some((r) => r.href) && <th scope="col" className="w-8" aria-label="Open" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.key} className={cn("align-middle", r.href && "relative hover:bg-surface-2")}>
              {r.cells.map((cell, i) => (
                <td key={i} className={cn("px-4 py-3 text-ink-2", i === 0 && "text-ink", columns[i]?.className)}>
                  {i === 0 && r.href ? (
                    <Link href={r.href} className="font-medium text-ink after:absolute after:inset-0 hover:underline">
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
              {rows.some((x) => x.href) && (
                <td className="pr-3 text-ink-3">{r.href && <ChevronRight size={15} strokeWidth={1.75} aria-hidden />}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((r) => {
          const body = (
            <>
              <div className="text-body font-medium text-ink">{r.cells[0]}</div>
              <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-support">
                {columns.slice(1).map((c, i) =>
                  c.hideOnMobile ? null : (
                    <div key={c.label} className="contents">
                      <dt className="text-ink-3">{c.label}</dt>
                      <dd className="min-w-0 text-ink-2">{r.cells[i + 1]}</dd>
                    </div>
                  ),
                )}
              </dl>
            </>
          );
          return (
            <li key={r.key}>
              {r.href ? (
                <Link href={r.href} className="block px-4 py-3 hover:bg-surface-2">
                  {body}
                </Link>
              ) : (
                <div className="px-4 py-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Previous / next links that keep the current filters. */
export function Pagination({
  page,
  pageCount,
  total,
  hrefFor,
  noun,
}: {
  page: number;
  pageCount: number;
  total: number;
  hrefFor: (page: number) => string;
  noun: [string, string];
}) {
  if (total === 0) return null;
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3 text-support text-ink-3">
      <p>
        {total} {total === 1 ? noun[0] : noun[1]}
        {pageCount > 1 ? ` · page ${page} of ${pageCount}` : ""}
      </p>
      {pageCount > 1 && (
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className="rounded-control border border-line bg-surface px-3 py-1.5 text-ink hover:bg-surface-2">
              Previous
            </Link>
          ) : (
            <span className="rounded-control border border-line px-3 py-1.5 opacity-50">Previous</span>
          )}
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} className="rounded-control border border-line bg-surface px-3 py-1.5 text-ink hover:bg-surface-2">
              Next
            </Link>
          ) : (
            <span className="rounded-control border border-line px-3 py-1.5 opacity-50">Next</span>
          )}
        </div>
      )}
    </nav>
  );
}
