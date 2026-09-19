"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Status";

const inputClass =
  "h-9 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none";

/** Create a single-use invite code. Platform admin invites need an extra confirmation. */
export default function InviteCreator() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [role, setRole] = useState<"pilot" | "super_admin">("pilot");
  const [maxKeywords, setMaxKeywords] = useState(10);
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (role === "super_admin" && !confirmAdmin) {
      setError("Confirm that this person should have full platform admin access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setCreated(null);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || null,
          note: note.trim() || null,
          role,
          max_keywords: role === "super_admin" ? 999999 : maxKeywords,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setError(data.error ?? "The invite couldn't be created. Please try again.");
        return;
      }
      setCreated({ code: data.code });
      setEmail("");
      setNote("");
      setConfirmAdmin(false);
      router.refresh();
    } catch {
      setError("We couldn't reach VSI. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4 rounded-panel border border-line bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Email (optional)</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Any email" className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Note (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who it's for" className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Access</span>
          <select value={role} onChange={(e) => setRole(e.target.value as "pilot" | "super_admin")} className={inputClass}>
            <option value="pilot">Member (their own organization)</option>
            <option value="super_admin">Platform admin (everything)</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Max searches</span>
          <input
            type="number"
            min={1}
            value={role === "super_admin" ? "" : maxKeywords}
            placeholder={role === "super_admin" ? "No limit" : undefined}
            onChange={(e) => setMaxKeywords(Math.max(1, Number(e.target.value) || 1))}
            disabled={role === "super_admin"}
            className={inputClass}
          />
        </label>
      </div>

      {role === "super_admin" && (
        <Notice tone="attention" title="Platform admins can see and change every organization">
          <label className="mt-1 flex items-center gap-2">
            <input type="checkbox" checked={confirmAdmin} onChange={(e) => setConfirmAdmin(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
            I understand. This invite is recorded in the activity log.
          </label>
        </Notice>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Creating" : "Create invite"}
        </Button>
        {created && (
          <p role="status" className="text-support text-ink-2">
            Invite code: <span className=" font-medium text-ink">{created.code}</span> (single use)
          </p>
        )}
        {error && (
          <p role="alert" className="text-support text-critical">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
