"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  bug: "Bug",
  idea: "Idea",
  question: "Question",
  praise: "Praise",
  general: "Other",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "New" },
  { value: "triaged", label: "Triaged" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

interface RowProps {
  row: {
    id: string;
    category: string;
    message: string;
    status: string;
    page_url: string | null;
    admin_notes: string | null;
    created_at: string;
    agency_name: string;
    user_name: string | null;
  };
}

/** One piece of customer feedback with its triage status and private notes. */
export default function FeedbackAdminRow({ row }: RowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) startTransition(() => router.refresh());
      else setError("That didn't save. Please try again.");
    } catch {
      setError("We couldn't reach VSI. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-support">
        <span className="font-medium text-ink">{CATEGORY_LABEL[row.category] ?? "Other"}</span>
        <span className="text-ink-2">{row.agency_name}</span>
        {row.user_name && <span className="text-ink-3">{row.user_name}</span>}
        <span className="text-ink-3">{formatDateTime(row.created_at)}</span>
      </div>
      <p className="max-w-[75ch] whitespace-pre-line text-body text-ink">{row.message}</p>
      {row.page_url && <p className="break-all text-caption text-ink-3">Sent from {row.page_url}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-support text-ink-3">
          Status
          <select
            value={status}
            disabled={saving}
            onChange={(e) => {
              setStatus(e.target.value);
              void patch({ status: e.target.value });
            }}
            className="h-8 rounded-control border border-line-strong bg-surface px-2 text-support text-ink focus:border-ink focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {!editingNotes && (
          <button type="button" onClick={() => setEditingNotes(true)} className="text-support font-medium text-ink underline-offset-4 hover:underline">
            {row.admin_notes ? "Edit notes" : "Add notes"}
          </button>
        )}
        {pending && <span className="text-caption text-ink-3">Updating</span>}
      </div>

      {editingNotes ? (
        <div className="max-w-xl space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Private to platform admins"
            aria-label="Admin notes"
            className="w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={async () => { await patch({ admin_notes: notes }); setEditingNotes(false); }} disabled={saving} className="h-8 rounded-control bg-ink px-3 text-support font-medium text-white hover:bg-ink-2 disabled:opacity-50">
              Save notes
            </button>
            <button type="button" onClick={() => { setEditingNotes(false); setNotes(row.admin_notes ?? ""); }} className="h-8 rounded-control px-3 text-support text-ink-2 hover:bg-surface-2">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        row.admin_notes && <p className="max-w-xl whitespace-pre-line rounded-control bg-surface-2 px-3 py-2 text-support text-ink-2">{row.admin_notes}</p>
      )}
      {error && <p role="alert" className="text-support text-critical">{error}</p>}
    </li>
  );
}
