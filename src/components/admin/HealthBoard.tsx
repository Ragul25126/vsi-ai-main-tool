"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ServiceHealth } from "@/lib/admin/health-model";
import { HealthLabel } from "./bits";

/**
 * Service health rows. AI and search providers are only tested when you
 * click Test (free calls: listing models, reading the SerpAPI account).
 */
export function HealthBoard({ initial }: { initial: ServiceHealth[] }) {
  const [rows, setRows] = useState(initial);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function test(kind: "ai" | "search") {
    setTesting(kind);
    setError(null);
    try {
      const res = await fetch("/api/admin/health", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
      const body = (await res.json().catch(() => ({}))) as ServiceHealth & { error?: string };
      if (!res.ok) {
        setError(body.error ?? "The test couldn't run. Please try again.");
        return;
      }
      setRows((r) => r.map((x) => (x.key === kind ? body : x)));
    } catch {
      setError("We couldn't reach VSI. Check your connection and try again.");
    } finally {
      setTesting(null);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
        {rows.map((h) => (
          <li key={h.key} className="space-y-2 px-4 py-3.5">
            <div className="grid gap-1 sm:grid-cols-[10rem_12rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
              <span className="text-body font-medium text-ink">{h.name}</span>
              <HealthLabel state={h.state} />
              <span className="text-support text-ink-3">{h.detail}</span>
              {h.testable && (h.key === "ai" || h.key === "search") ? (
                <Button size="sm" onClick={() => test(h.key as "ai" | "search")} disabled={testing !== null}>
                  {testing === h.key && <Loader2 size={13} className="animate-spin" aria-hidden />}
                  {testing === h.key ? "Testing" : "Test now"}
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
            </div>
            {h.providers && h.providers.some((p) => p.state !== "not_configured") && (
              <ul className="space-y-1 sm:pl-[10rem]">
                {h.providers.map((p) => (
                  <li key={p.name} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-support">
                    <span className="w-28 text-ink-2">{p.name}</span>
                    <HealthLabel state={p.state} />
                    <span className="text-ink-3">{p.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-support text-critical">
          {error}
        </p>
      )}
      <p className="text-support text-ink-3">Tests make free calls only: they list the provider&apos;s models or read the account. No searches or AI answers are used.</p>
    </div>
  );
}
