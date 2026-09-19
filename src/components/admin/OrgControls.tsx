"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const inputClass =
  "h-9 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none";

async function patchOrg(id: string, body: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(`/api/admin/agencies/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return null;
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return j.error ?? "That didn't work. Please try again.";
  } catch {
    return "We couldn't reach VSI. Check your connection and try again.";
  }
}

/** Plan limits and pilot flag for one organization. */
export function OrgLimitsForm({ id, maxClients, maxKeywords, isPilot }: { id: string; maxClients: number | null; maxKeywords: number | null; isPilot: boolean }) {
  const router = useRouter();
  const [clients, setClients] = useState(maxClients === null ? "" : String(maxClients));
  const [keywords, setKeywords] = useState(maxKeywords === null ? "" : String(maxKeywords));
  const [pilot, setPilot] = useState(isPilot);
  const [state, setState] = useState<{ kind: "idle" | "saving" | "saved" } | { kind: "error"; message: string }>({ kind: "idle" });

  async function save() {
    const c = clients.trim() === "" ? null : Number(clients);
    const k = Number(keywords);
    if ((c !== null && (!Number.isInteger(c) || c < 0)) || !Number.isInteger(k) || k < 0) {
      setState({ kind: "error", message: "Limits must be whole numbers, 0 or more. Leave max projects empty for no limit." });
      return;
    }
    setState({ kind: "saving" });
    const err = await patchOrg(id, { max_clients: c, max_keywords: k, is_pilot: pilot });
    if (err) setState({ kind: "error", message: err });
    else {
      setState({ kind: "saved" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Max projects</span>
          <input inputMode="numeric" value={clients} onChange={(e) => setClients(e.target.value)} placeholder="No limit" className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="block text-support font-medium text-ink">Max searches</span>
          <input inputMode="numeric" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className="flex items-center gap-2.5 text-body text-ink">
        <input type="checkbox" checked={pilot} onChange={(e) => setPilot(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
        Pilot organization
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={save} disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "Saving" : "Save limits"}
        </Button>
        {state.kind === "saved" && <span className="text-support text-positive">Saved.</span>}
        {state.kind === "error" && <span role="alert" className="text-support text-critical">{state.message}</span>}
      </div>
    </div>
  );
}

/** Disable (with a reason) or re-enable an organization. Members of a disabled organization are signed out. */
export function OrgStatusControl({ id, name, isDisabled, disabledReason, isOwnOrg }: { id: string; name: string; isDisabled: boolean; disabledReason: string | null; isOwnOrg: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(disable: boolean) {
    setBusy(true);
    setError(null);
    const err = await patchOrg(id, disable ? { is_disabled: true, disabled_reason: reason.trim() || null } : { is_disabled: false });
    setBusy(false);
    if (err) setError(err);
    else {
      setOpen(false);
      setReason("");
      router.refresh();
    }
  }

  if (isDisabled) {
    return (
      <div className="space-y-3">
        <p className="text-body text-ink-2">
          {name} is disabled{disabledReason ? `: ${disabledReason}` : "."} Its members can&apos;t sign in.
        </p>
        <Button onClick={() => apply(false)} disabled={busy}>
          {busy ? "Enabling" : "Enable organization"}
        </Button>
        {error && <p role="alert" className="text-support text-critical">{error}</p>}
      </div>
    );
  }

  if (isOwnOrg) return <p className="text-body text-ink-3">This is your own organization, so it can&apos;t be disabled from here.</p>;

  return (
    <div className="space-y-3">
      <p className="text-body text-ink-2">Disabling signs out every member of {name} and blocks them from signing in. Their data is kept.</p>
      {!open ? (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Disable organization
        </Button>
      ) : (
        <div className="max-w-md space-y-3 rounded-panel border border-line bg-surface p-4">
          <label className="block space-y-1.5">
            <span className="block text-support font-medium text-ink">Reason (shown to admins)</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Trial ended" className={inputClass} />
          </label>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => apply(true)} disabled={busy}>
              {busy ? "Disabling" : `Disable ${name}`}
            </Button>
            <Button variant="quiet" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-support text-critical">{error}</p>}
    </div>
  );
}
