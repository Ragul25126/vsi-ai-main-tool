"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_COMPETITORS, validateCompetitorDomain, type TrackedCompetitor } from "@/lib/project-competitors";
import { addCompetitors, removeCompetitor } from "@/lib/competitor-client";

/**
 * Add and remove the competitors for the active project. Every change goes
 * to the server, which checks the project belongs to your organization.
 */
export function CompetitorManager({
  projectId,
  ownWebsite,
  competitors,
}: {
  projectId: string;
  ownWebsite: string | null;
  competitors: TrackedCompetitor[];
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const domains = competitors.map((c) => c.domain);
  const full = domains.length >= MAX_COMPETITORS;

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const check = validateCompetitorDomain(value, ownWebsite, domains);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setPending("add");
    const result = await addCompetitors(projectId, [check.domain]);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setValue("");
    router.refresh();
  }

  async function remove(c: TrackedCompetitor) {
    setError(null);
    setPending(c.id);
    const result = await removeCompetitor(projectId, c.id);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {competitors.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Your competitors">
          {competitors.map((c) => (
            <li key={c.id} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface pl-3 pr-1 text-support text-ink">
              {c.domain}
              <button
                type="button"
                onClick={() => remove(c)}
                disabled={pending !== null}
                aria-label={`Remove ${c.domain}`}
                className="rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-50"
              >
                {pending === c.id ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <X size={13} strokeWidth={1.75} aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!full && (
        <form onSubmit={add} className="flex max-w-md flex-col gap-2 sm:flex-row">
          <label htmlFor="competitor-domain" className="sr-only">
            Competitor website
          </label>
          <input
            id="competitor-domain"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="competitor.com"
            className="h-9 min-w-0 flex-1 rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
          <Button type="submit" variant="secondary" disabled={pending !== null || !value.trim()}>
            {pending === "add" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Plus size={15} strokeWidth={2} aria-hidden />}
            Add competitor
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-support text-critical">
          {error}
        </p>
      )}
      <p className="text-caption text-ink-3">
        {full ? `You've added the maximum of ${MAX_COMPETITORS} competitors.` : `Up to ${MAX_COMPETITORS} competitors per project.`}
      </p>
    </div>
  );
}
