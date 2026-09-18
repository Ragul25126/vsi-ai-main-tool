"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_META: Record<string, { label: string; emoji: string; chip: string }> = {
  bug: { label: "Bug", emoji: "🐞", chip: "bg-rose-50 text-rose-600 border border-rose-200" },
  idea: { label: "Idea", emoji: "💡", chip: "bg-amber-50 text-amber-600 border border-amber-200" },
  question: { label: "Question", emoji: "❓", chip: "bg-blue-50 text-blue-600 border border-blue-200" },
  praise: { label: "Praise", emoji: "🙌", chip: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  general: { label: "Other", emoji: "✍️", chip: "bg-slate-100 text-slate-600 border border-slate-200" },
};

const STATUS_OPTIONS = ["new", "triaged", "in_progress", "done", "archived"] as const;

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

export default function FeedbackAdminRow({ row }: RowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);

  const cat = CATEGORY_META[row.category] ?? CATEGORY_META.general;

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedback/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  async function setStatusValue(s: string) {
    setStatus(s);
    await patch({ status: s });
  }

  async function saveNotes() {
    await patch({ admin_notes: notes });
    setEditingNotes(false);
  }

  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs text-slate-900">
      <div className="flex items-start gap-4">
        <div className={`shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center text-lg ${cat.chip}`}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${cat.chip}`}>{cat.label}</span>
            <span className="text-sm font-bold text-slate-900">{row.agency_name}</span>
            {row.user_name && <span className="text-xs font-semibold text-slate-500">· {row.user_name}</span>}
            <span className="text-[11px] font-medium text-slate-400">
              · {new Date(row.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{row.message}</p>
          {row.page_url && (
            <p className="mt-2 text-[11px] font-medium text-slate-400">From: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{row.page_url}</code></p>
          )}

          {/* Admin controls */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status</span>
            <div className="flex items-center gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusValue(s)}
                  disabled={saving || s === status}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${
                    s === status
                      ? "bg-[#FF5500] text-white shadow-xs"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Admin-only notes…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF5500] focus:bg-white focus:outline-none resize-none font-medium"
                />
                <div className="flex items-center gap-2">
                  <button onClick={saveNotes} disabled={saving} className="rounded-lg bg-[#FF5500] px-3 py-1 text-xs font-bold text-white hover:bg-[#e04800] transition-colors shadow-xs">Save</button>
                  <button onClick={() => { setEditingNotes(false); setNotes(row.admin_notes ?? ""); }} className="text-xs font-semibold text-slate-400 hover:text-slate-600">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-xs font-bold text-[#FF5500] hover:text-[#e04800] transition-colors"
              >
                {row.admin_notes ? "Edit admin notes" : "+ Add admin notes"}
              </button>
            )}
            {!editingNotes && row.admin_notes && (
              <p className="mt-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-700 font-medium whitespace-pre-line">{row.admin_notes}</p>
            )}
          </div>
        </div>
      </div>
      {pending && <div className="mt-2 h-0.5 w-full bg-[#FF5500]/50 animate-pulse rounded" />}
    </div>
  );
}
