"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MAX_SEARCHES, type SearchItem, type Suggestions } from "../search-suggestions";

const inputClass =
  "h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none";

/**
 * Choose searches: type your own, or pick from suggestions. Nothing is
 * selected until the user chooses it. `existing` are searches the project
 * already tracks, shown as taken.
 */
export function SearchPicker({
  value,
  onChange,
  suggestions,
  domain,
  existing = [],
}: {
  value: SearchItem[];
  onChange: (next: SearchItem[]) => void;
  suggestions: Suggestions;
  domain: string | null;
  existing?: string[];
}) {
  const [input, setInput] = useState("");
  const taken = new Set(existing.map((e) => e.toLowerCase()));
  const has = (k: string) => value.some((s) => s.keyword.toLowerCase() === k.toLowerCase());
  const room = MAX_SEARCHES - existing.length - value.length;

  function toggle(item: SearchItem) {
    if (has(item.keyword)) onChange(value.filter((s) => s.keyword.toLowerCase() !== item.keyword.toLowerCase()));
    else if (room > 0 && !taken.has(item.keyword.toLowerCase())) onChange([...value, item]);
  }

  function addOwn(e: FormEvent) {
    e.preventDefault();
    const k = input.trim().replace(/\s+/g, " ");
    if (!k || k.length > 200) return;
    if (!has(k) && !taken.has(k.toLowerCase()) && room > 0) onChange([...value, { keyword: k, trackType: "both", origin: "yours" }]);
    setInput("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addOwn} className="flex max-w-xl flex-col gap-2 sm:flex-row">
        <label htmlFor="own-search" className="sr-only">
          Add a search
        </label>
        <input id="own-search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. best accountant in Dubai" className={inputClass} />
        <Button type="submit" variant="secondary" disabled={!input.trim() || room <= 0}>
          <Plus size={15} strokeWidth={2} aria-hidden />
          Add search
        </Button>
      </form>

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-support font-medium text-ink">Your searches ({value.length})</p>
          <ul className="flex flex-wrap gap-2">
            {value.map((s) => (
              <li key={s.keyword} className="inline-flex min-h-8 items-center gap-1.5 rounded-control border border-line bg-surface py-1 pl-3 pr-1 text-support text-ink">
                {s.keyword}
                <button type="button" onClick={() => toggle(s)} aria-label={`Remove ${s.keyword}`} className="rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink">
                  <X size={13} strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-support font-medium text-ink">Suggested searches</p>
        {(suggestions.kind === "loading" || suggestions.kind === "idle") && (
          <p className="flex items-center gap-2 text-support text-ink-3" role="status">
            <Loader2 size={14} className="animate-spin" aria-hidden />
            Getting suggestions{domain ? ` for ${domain}` : ""}
          </p>
        )}
        {suggestions.kind === "failed" && (
          <p className="text-support text-ink-2">Couldn&apos;t suggest searches right now. Add the searches your customers use above.</p>
        )}
        {suggestions.kind === "ok" && (
          <>
            <p className="text-support text-ink-3">
              Ideas based on your website and industry. Pick only the ones that fit your business; nothing is added until you choose it.
            </p>
            <ul className="flex flex-wrap gap-2">
              {suggestions.items.map((item) => {
                const on = has(item.keyword);
                const already = taken.has(item.keyword.toLowerCase());
                return (
                  <li key={item.keyword}>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      aria-pressed={on}
                      disabled={already}
                      title={already ? "Already tracked" : undefined}
                      className={cn(
                        "inline-flex min-h-8 items-center gap-1.5 rounded-control border px-3 py-1 text-left text-support disabled:cursor-default disabled:opacity-50",
                        on ? "border-ink bg-ink text-white" : "border-dashed border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink",
                      )}
                    >
                      {on || already ? <Check size={13} strokeWidth={2} className="shrink-0" aria-hidden /> : <Plus size={13} strokeWidth={2} className="shrink-0" aria-hidden />}
                      {item.keyword}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
