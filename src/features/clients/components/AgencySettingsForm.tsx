"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Initial {
 legal_name: string; // agency.name - readonly here
 display_name: string;
 logo_url: string;
 primary_color: string;
 support_email: string;
 report_footer: string;
}

export default function AgencySettingsForm({ agencyId, initial }: { agencyId: string; initial: Initial }) {
 const router = useRouter();
 const [state, setState] = useState<Initial>(initial);
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function uploadLogo(file: File) {
 if (!file) return;
 if (file.size > 1024 * 1024) {
 setError("Logo must be under 1 MB");
 return;
 }
 setUploading(true);
 setError(null);
 try {
 const supabase = createClient();
 const ext = file.name.split(".").pop()?.toLowerCase() || "png";
 const path = `${agencyId}/logo-${Date.now()}.${ext}`;
 const { error: upErr } = await supabase.storage
 .from("agency-logos")
 .upload(path, file, { contentType: file.type, upsert: true });
 if (upErr) {
 setError(upErr.message);
 return;
 }
 const { data } = supabase.storage.from("agency-logos").getPublicUrl(path);
 setState((s) => ({ ...s, logo_url: data.publicUrl }));
 } catch (e) {
 setError(e instanceof Error ? e.message : "Upload failed");
 } finally {
 setUploading(false);
 }
 }

 async function save() {
 setSaving(true);
 setError(null);
 setSaved(false);
 const res = await fetch("/api/agency/settings", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 display_name: state.display_name || null,
 logo_url: state.logo_url || null,
 primary_color: state.primary_color || null,
 support_email: state.support_email || null,
 report_footer: state.report_footer || null,
 }),
 });
 setSaving(false);
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Failed to save");
 return;
 }
 setSaved(true);
 router.refresh();
 setTimeout(() => setSaved(false), 3000);
 }

 return (
 <div className="space-y-4">
 <div className="rounded-panel border border-line bg-surface p-5 space-y-3">
 <div>
 <label className="block text-caption text-ink-3 mb-1">Legal name (internal)</label>
 <input
 type="text"
 value={state.legal_name}
 disabled
 className="w-full rounded-control border border-line bg-surface-2 px-3 py-2 text-body text-ink-3"
 />
 <p className="mt-1 text-caption text-ink-3">Internal record. Contact support to change.</p>
 </div>

 <div>
 <label className="block text-caption text-ink-3 mb-1">Display name</label>
 <input
 type="text"
 value={state.display_name}
 onChange={(e) => setState((s) => ({ ...s, display_name: e.target.value }))}
 placeholder={state.legal_name}
 maxLength={80}
 className="w-full rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
 />
 <p className="mt-1 text-caption text-ink-3">Used wherever your agency name appears to a client. Defaults to your legal name.</p>
 </div>

 <div>
 <label className="block text-caption text-ink-3 mb-1">Support email</label>
 <input
 type="email"
 value={state.support_email}
 onChange={(e) => setState((s) => ({ ...s, support_email: e.target.value }))}
 placeholder="hello@youragency.com"
 className="w-full rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
 />
 <p className="mt-1 text-caption text-ink-3">Where clients reply when they receive a report from you.</p>
 </div>
 </div>

 <div className="rounded-panel border border-line bg-surface p-5 space-y-4">
 <div>
 <label className="block text-caption text-ink-3 mb-2">Logo</label>
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-control border border-line bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
 {state.logo_url ? (
 <Image src={state.logo_url} alt="Logo" width={64} height={64} className="object-contain" unoptimized />
 ) : (
 <span className="text-caption text-ink-3">No logo</span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <label className="inline-block rounded-control border border-line-strong px-3 py-1.5 text-caption text-ink-2 hover:bg-surface-2 cursor-pointer">
 {uploading ? "Uploading..." : "Upload logo"}
 <input
 type="file"
 accept="image/png,image/jpeg,image/svg+xml,image/webp"
 className="hidden"
 disabled={uploading}
 onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }}
 />
 </label>
 {state.logo_url && (
 <button
 type="button"
 onClick={() => setState((s) => ({ ...s, logo_url: "" }))}
 className="ml-2 text-caption text-critical hover:underline"
 >
 Remove
 </button>
 )}
 <p className="mt-1 text-caption text-ink-3">PNG/SVG/JPEG, under 1MB. Square works best.</p>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-caption text-ink-3 mb-1">Brand colour</label>
 <div className="flex items-center gap-3">
 <input
 type="color"
 value={state.primary_color}
 onChange={(e) => setState((s) => ({ ...s, primary_color: e.target.value.toUpperCase() }))}
 className="h-10 w-14 rounded border border-line-strong bg-surface"
 />
 <input
 type="text"
 value={state.primary_color}
 onChange={(e) => setState((s) => ({ ...s, primary_color: e.target.value.toUpperCase() }))}
 maxLength={7}
 placeholder="#F59E0B"
 className="rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink w-32 focus:border-line-strong focus:outline-none"
 />
 <div
 className="rounded-control px-3 py-1.5 text-caption font-semibold text-ink"
 style={{ backgroundColor: state.primary_color }}
 >
 Preview button
 </div>
 </div>
 <p className="mt-1 text-caption text-ink-3">Used in client-facing reports - buttons, headings, accents.</p>
 </div>
 </div>

 <div className="rounded-panel border border-line bg-surface p-5">
 <label className="block text-caption text-ink-3 mb-1">Report footer text</label>
 <textarea
 value={state.report_footer}
 onChange={(e) => setState((s) => ({ ...s, report_footer: e.target.value }))}
 rows={3}
 maxLength={500}
 placeholder="e.g. Prepared by [Agency] for our valued clients. Questions? Reply to this email."
 className="w-full rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
 />
 <p className="mt-1 text-caption text-ink-3">Shown at the bottom of every report you generate. Plain text. Keep it short.</p>
 </div>

 {error && (
 <div className="rounded-control border border-critical/30 bg-critical-soft px-3 py-2 text-body text-critical">{error}</div>
 )}

 <div className="flex items-center justify-end gap-3">
 {saved && <span className="text-caption text-positive font-medium">Saved</span>}
 <button
 onClick={save}
 disabled={saving || uploading}
 className="rounded-control bg-ink px-4 py-2 text-body font-semibold text-white hover:bg-ink-2 disabled:opacity-50"
 >
 {saving ? "Saving..." : "Save branding"}
 </button>
 </div>
 </div>
 );
}
