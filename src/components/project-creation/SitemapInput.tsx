"use client";

import { useState } from "react";
import { FileCode, Plus, X } from "lucide-react";

interface SitemapInputProps {
  initialSitemap?: string;
  onChange: (sitemaps: string[]) => void;
}

export function SitemapInput({ initialSitemap = "", onChange }: SitemapInputProps) {
  const [sitemaps, setSitemaps] = useState<string[]>(() =>
    initialSitemap ? [initialSitemap] : []
  );
  const [inputVal, setInputVal] = useState("");

  function notify(list: string[]) {
    setSitemaps(list);
    onChange(list);
  }

  function handleAdd() {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!sitemaps.includes(trimmed)) {
      const next = [...sitemaps, trimmed];
      notify(next);
    }
    setInputVal("");
  }

  function handleRemove(url: string) {
    const next = sitemaps.filter((s) => s !== url);
    notify(next);
  }

  return (
    <div className="rounded-panel border border-line bg-surface p-5 space-y-3">
      <div className="flex items-center gap-2 text-support font-medium text-ink">
        <FileCode className="h-4 w-4 text-brand-strong" />
        <h3 className="font-semibold text-ink">Your Sitemap (Optional)</h3>
      </div>

      <p className="text-support text-ink-2">
        An accurate sitemap helps us find your pages and analyze your website faster.
      </p>

      {/* List of current sitemaps */}
      {sitemaps.length > 0 && (
        <div className="space-y-2">
          {sitemaps.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between rounded-control border border-line bg-surface-2 px-3 py-2 text-support text-ink font-mono"
            >
              <span className="truncate">{url}</span>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="ml-2 text-ink-3 hover:text-critical"
                aria-label={`Remove sitemap ${url}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input box to add a sitemap */}
      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="https://example.com/sitemap.xml"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 font-mono text-body text-ink placeholder:font-sans placeholder:text-ink-3 focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputVal.trim()}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-control bg-surface-2 px-3.5 text-support font-medium text-ink border border-line hover:bg-brand-soft hover:text-brand-strong disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
