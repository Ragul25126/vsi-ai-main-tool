"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const inputClass =
  "h-9 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none";

async function call(id: string, method: "PATCH" | "DELETE", body?: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (res.ok) return null;
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return j.error ?? "That didn't work. Please try again.";
  } catch {
    return "We couldn't reach VSI. Check your connection and try again.";
  }
}

/** Disable/enable a user, or remove them from the platform (typed confirmation). */
export function UserActions({ id, email, isDisabled, isSelf }: { id: string; email: string | null; isDisabled: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "disable" | "remove">("idle");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-support text-ink-3">This is you</span>;

  async function run(fn: () => Promise<string | null>) {
    setBusy(true);
    setError(null);
    const err = await fn();
    setBusy(false);
    if (err) setError(err);
    else {
      setMode("idle");
      setReason("");
      setConfirm("");
      router.refresh();
    }
  }

  const expected = (email ?? "").toLowerCase();

  return (
    <div className="space-y-2">
      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          {isDisabled ? (
            <Button size="sm" onClick={() => run(() => call(id, "PATCH", { is_disabled: false }))} disabled={busy}>
              Enable
            </Button>
          ) : (
            <Button size="sm" onClick={() => setMode("disable")}>
              Disable
            </Button>
          )}
          <Button size="sm" variant="quiet" onClick={() => setMode("remove")}>
            Remove
          </Button>
        </div>
      )}
      {mode === "disable" && (
        <div className="max-w-sm space-y-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (shown to admins)" aria-label="Reason" className={inputClass} />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={() => run(() => call(id, "PATCH", { is_disabled: true, disabled_reason: reason.trim() || null }))} disabled={busy}>
              {busy ? "Disabling" : "Disable user"}
            </Button>
            <Button size="sm" variant="quiet" onClick={() => setMode("idle")} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {mode === "remove" && (
        <div className="max-w-sm space-y-2">
          <p className="text-support text-ink-2">Removes this person from their organization and the platform. Type their email to confirm.</p>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={email ?? "email"} aria-label="Type the email to confirm" className={inputClass} />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={() => run(() => call(id, "DELETE"))} disabled={busy || !expected || confirm.trim().toLowerCase() !== expected}>
              {busy ? "Removing" : "Remove user"}
            </Button>
            <Button size="sm" variant="quiet" onClick={() => setMode("idle")} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-support text-critical">
          {error}
        </p>
      )}
    </div>
  );
}
