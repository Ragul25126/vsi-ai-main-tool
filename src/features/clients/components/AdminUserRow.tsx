"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Row {
 id: string;
 email: string | null;
 full_name: string | null;
 role: string | null;
 agency_id: string | null;
 agency_name: string | null;
 is_disabled: boolean;
 agency_is_disabled: boolean;
 created_at: string;
}

export default function AdminUserRow({ row, isSelf }: { row: Row; isSelf: boolean }) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [busy, setBusy] = useState(false);

 async function toggleDisable() {
 if (isSelf) return;
 const next = !row.is_disabled;
 if (next && !confirm(`Disable ${row.full_name ?? row.email ?? "this user"}? They won't be able to log in until you re-enable.`)) return;
 setBusy(true);
 try {
 await fetch(`/api/admin/users/${row.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ is_disabled: next }),
 });
 startTransition(() => router.refresh());
 } finally {
 setBusy(false);
 }
 }

 async function remove() {
 if (isSelf) return;
 if (!confirm(`Delete ${row.full_name ?? row.email ?? "this user"}? Their profile is removed permanently. The auth account remains orphaned for cleanup.`)) return;
 setBusy(true);
 try {
 const res = await fetch(`/api/admin/users/${row.id}`, { method: "DELETE" });
 if (res.ok) startTransition(() => router.refresh());
 } finally {
 setBusy(false);
 }
 }

 return (
 <div className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-200 items-center text-xs ${row.is_disabled ? "bg-gray-50 opacity-70" : ""}`}>
 <div className="col-span-3 text-gray-900 truncate">{row.full_name ?? <span className="text-gray-400">-</span>}</div>
 <div className="col-span-3 truncate">
 {row.email ? (
 <a href={`mailto:${row.email}`} className="text-attention hover:underline">{row.email}</a>
 ) : (
 <span className="text-gray-400">-</span>
 )}
 </div>
 <div className="col-span-2 text-gray-700 truncate">
 {row.agency_name ?? <span className="text-gray-400">no agency</span>}
 {row.agency_is_disabled && <span className="ml-1 text-caption text-red-600">(agency disabled)</span>}
 </div>
 <div className="col-span-1">
 {row.role === "super_admin" ? (
 <span className="rounded-full bg-attention-soft px-2 py-0.5 text-caption font-semibold text-attention">Admin</span>
 ) : (
 <span className="rounded-full bg-blue-50 px-2 py-0.5 text-caption font-semibold text-blue-700">Pilot</span>
 )}
 </div>
 <div className="col-span-1">
 {row.is_disabled ? (
 <span className="rounded-full bg-red-50 px-2 py-0.5 text-caption font-semibold text-red-700">Disabled</span>
 ) : (
 <span className="rounded-full bg-green-50 px-2 py-0.5 text-caption font-semibold text-green-700">Active</span>
 )}
 </div>
 <div className="col-span-2 flex items-center justify-end gap-1.5">
 {isSelf ? (
 <span className="text-caption text-gray-400">(you)</span>
 ) : (
 <>
 <button
 onClick={toggleDisable}
 disabled={busy}
 className={`rounded-md border px-2 py-1 text-caption font-semibold transition-colors ${
 row.is_disabled
 ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
 : "border-line bg-attention-soft text-attention hover:bg-attention-soft"
 } disabled:opacity-50`}
 >
 {row.is_disabled ? "Enable" : "Disable"}
 </button>
 <button
 onClick={remove}
 disabled={busy}
 className="rounded-md border border-red-300 bg-card px-2 py-1 text-caption font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
 >
 Delete
 </button>
 </>
 )}
 </div>
 </div>
 );
}
