"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Frequency = "manual" | "daily" | "every_3_days" | "weekly";

const OPTIONS: Array<{ value: Frequency; label: string; desc: string }> = [
 { value: "manual", label: "Manual", desc: "Run only when you click Run Now" },
 { value: "daily", label: "Daily", desc: "Auto-run every 24 hours" },
 { value: "every_3_days",label: "Every 3 days",desc: "Auto-run every 72 hours" },
 { value: "weekly", label: "Weekly", desc: "Auto-run every 7 days" },
];

export default function FrequencySelector({ clientId, current }: { clientId: string; current: string }) {
 const [selected, setSelected] = useState<Frequency>((current as Frequency) ?? "manual");
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);

 async function handleChange(val: Frequency) {
 if (val === selected) return;
 setSelected(val);
 setSaving(true);
 setSaved(false);

 const supabase = createClient();
 await supabase
 .from("clients")
 .update({ check_frequency: val })
 .eq("id", clientId);

 setSaving(false);
 setSaved(true);
 setTimeout(() => setSaved(false), 2000);
 }

 return (
 <div className="rounded-panel border border-line bg-surface p-5">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-caption font-medium text-ink-3">Check Frequency</h2>
 {saving && <span className="text-caption text-ink-3 animate-pulse">Saving...</span>}
 {saved && <span className="text-caption text-positive">Saved</span>}
 </div>

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 {OPTIONS.map((opt) => (
 <button
 key={opt.value}
 onClick={() => handleChange(opt.value)}
 className={`rounded-lg border p-3 text-left transition-all ${
 selected === opt.value
 ? "border-line bg-attention-soft"
 : "border-line-strong hover:border-line-strong"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <p className="text-caption font-semibold text-ink">{opt.label}</p>
 {selected === opt.value && <span className="text-attention text-caption">✓</span>}
 </div>
 <p className="text-caption text-ink-3 leading-tight">{opt.desc}</p>
 </button>
 ))}
 </div>

 {selected !== "manual" && (
 <p className="mt-3 text-caption text-ink-3">
 Auto-run requires the daily pipeline to be configured. For now, use <span className="text-attention">Run Now</span> to trigger manually.
 </p>
 )}
 </div>
 );
}
