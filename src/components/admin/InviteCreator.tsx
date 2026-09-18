"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteCreator() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [role, setRole] = useState<"pilot" | "super_admin">("pilot");
  const [maxKeywords, setMaxKeywords] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

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

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create invite");
      return;
    }

    const data = await res.json() as { code: string };
    setCreated(data);
    setEmail("");
    setNote("");
    router.refresh();
  }

  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-4">Generate invite code</h3>

      {created && (
        <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-700">New invite created — share this code:</p>
          <p className="font-mono text-lg font-black text-emerald-800 tracking-wider mt-1">{created.code}</p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
      )}

      <form onSubmit={handleCreate} className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-4">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lock to one address"
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#FF5500] focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="who is this for?"
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#FF5500] focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "pilot" | "super_admin")}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#FF5500] focus:bg-white focus:outline-none transition-colors"
          >
            <option value="pilot">Pilot</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Max KW</label>
          <input
            type="number"
            min={1}
            value={maxKeywords}
            disabled={role === "super_admin"}
            onChange={(e) => setMaxKeywords(parseInt(e.target.value, 10) || 10)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#FF5500] focus:bg-white focus:outline-none disabled:opacity-50 transition-colors"
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04800] disabled:opacity-50 transition-colors shadow-md shadow-[#FF5500]/20 cursor-pointer"
          >
            {submitting ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
