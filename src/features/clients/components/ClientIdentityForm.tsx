"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isValidDomain } from "@/lib/url-input";
import { Shield, Globe, Tag } from "lucide-react";

interface Props {
 clientId: string;
 initial: {
 website: string | null;
 brand_name: string | null;
 };
 scope?: "admin" | "agency";
}

export default function ClientIdentityForm({ clientId, initial, scope = "agency" }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [website, setWebsite] = useState(initial.website ?? "");
 const [brand, setBrand] = useState(initial.brand_name ?? "");
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

 const websiteOk = isValidDomain(website);
 const dirty =
 website.trim() !== (initial.website ?? "") || brand.trim() !== (initial.brand_name ?? "");
 const endpoint =
 scope === "admin"
 ? `/api/admin/clients/${clientId}/identity`
 : `/api/clients/${clientId}/identity`;

 async function save() {
 setSaving(true);
 setMsg(null);
 try {
 const res = await fetch(endpoint, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ website: website.trim(), brand_name: brand.trim() }),
 });
 const data = (await res.json().catch(() => ({}))) as { error?: string };
 if (!res.ok) {
 setMsg({ kind: "err", text: data.error ?? "Failed to save" });
 return;
 }
 setMsg({ kind: "ok", text: "Saved. Re-run keyword scan to refresh citation status." });
 startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 return (
    <div className="rounded-panel border border-line bg-surface p-6 shadow-overlay relative overflow-hidden">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-body font-semibold text-ink flex items-center gap-2">
            <Shield size={14} className="text-brand-strong" />
            <span>Tracked Brand Identity Signals</span>
          </h2>
          <p className="text-caption text-ink-3 mt-0.5">Primary domains and brand names used by AI agents to detect citations and answer mentions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-center gap-1.5 text-caption font-semibold text-ink mb-2">
            <Tag size={12} className="text-brand-strong" /> Brand Name Anchor
          </span>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Valgrow Labs"
            className="w-full rounded-panel border border-line bg-canvas text-ink px-4 py-3 text-body focus:border-line-strong focus:outline-none placeholder:text-ink-3/70 transition-colors"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-caption font-semibold text-ink mb-2">
            <Globe size={12} className="text-brand-strong" /> Primary Domain
          </span>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. valgrowlabs.com"
            className={`w-full rounded-panel border bg-background text-foreground px-4 py-3 text-body focus:outline-none placeholder:text-muted-foreground/70 transition-colors ${
              website.trim() && !websiteOk
                ? "border-critical/30 focus:border-critical/30"
                : "border-line focus:border-line-strong"
            }`}
          />
          {website.trim() && !websiteOk && (
            <span className="mt-1.5 block text-caption font-mono text-critical">
              Invalid domain format. Use bare host like <span className="underline">example.com</span> without https://.
            </span>
          )}
        </label>
 </div>

 <div className="mt-6 pt-4 border-t border-line flex items-center justify-between flex-wrap gap-4">
 <p className="text-caption text-ink-3 max-w-md">
 Updating your identity instantly recalculates brand mentions across all tracked keywords on your next scan.
 </p>
 <div className="flex items-center gap-3">
 {msg && (
 <span className={`text-caption font-mono font-semibold ${msg.kind === "ok" ? "text-positive" : "text-critical"}`}>
 {msg.text}
 </span>
 )}
 <button
 onClick={save}
 disabled={saving || !dirty || !websiteOk || !brand.trim()}
 className="rounded-control bg-ink px-4 py-2 text-support font-medium text-white hover:bg-ink-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 {saving ? "SAVING…" : "UPDATE IDENTITY"}
 </button>
 </div>
 </div>
 </div>
 );
}
