"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  promptKey: string;
  title: string;
  defaultTemplate: string;
  currentTemplate: string;
  variables: string[];
  outputFormat: string;
  isOverride: boolean;
}

export default function PromptEditor({
  promptKey,
  defaultTemplate,
  currentTemplate,
  variables,
  outputFormat,
  isOverride,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(currentTemplate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const placeholdersUsed = useMemo(() => {
    const found = new Set<string>();
    const re = /\{\{\s*(\w+)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(draft)) !== null) found.add(m[1]);
    return found;
  }, [draft]);

  const unknownPlaceholders = useMemo(
    () => Array.from(placeholdersUsed).filter((p) => !variables.includes(p)),
    [placeholdersUsed, variables]
  );

  const missingPlaceholders = useMemo(
    () => variables.filter((v) => !placeholdersUsed.has(v)),
    [variables, placeholdersUsed]
  );

  const dirty = draft !== currentTemplate;

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch(`/api/admin/prompts/${promptKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: draft }),
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

  async function resetToDefault() {
    if (!confirm("Reset this prompt to the hardcoded default? The current override will be deleted.")) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/prompts/${promptKey}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to reset");
      return;
    }
    setDraft(defaultTemplate);
    router.refresh();
  }

  const samplePreview = useMemo(() => {
    const samples: Record<string, string> = {
      todayLabel: "1 January 2026",
      currentYear: "2026",
      clientBrand: "Sample Brand",
      clientDomain: "samplebrand.com",
      keyword: "best example agency dubai",
      rankPosition: "#4",
      aioPresent: "Yes",
      clientCited: "No",
      mentionedInText: "No",
      gapLabel: "geo invisible",
      competitorList: "competitor-a.com, competitor-b.com, competitor-c.com",
      aioSnippet: "- AIO body excerpt: \"Sample AI Mode response text...\"",
      sourceCount: "3",
      sourceBlocks: "--- Source 1: Example Page\nURL: https://example.com/article\nWord count: 1200\nExcerpt:\n[truncated content excerpt]\n",
    };
    return draft.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, name: string) => samples[name] ?? `«${name}»`);
  }, [draft]);

  return (
    <div className="space-y-6">
      {/* Variables reference */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs text-slate-900">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available template variables</p>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => {
            const used = placeholdersUsed.has(v);
            return (
              <code
                key={v}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold ${
                  used ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
                title={used ? "In use" : "Not yet referenced in template"}
              >
                {`{{${v}}}`}
              </code>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-4">
          <span className="font-bold text-slate-800">Expected output:</span> {outputFormat}
        </p>
      </div>

      {/* Editor */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-slate-900">Template</p>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOverride ? "bg-orange-50 text-[#FF5500] border border-orange-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
            {isOverride ? "Editing override" : "Editing default copy"}
          </span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={22}
          spellCheck={false}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 font-mono leading-relaxed focus:border-[#FF5500] focus:bg-white focus:outline-none transition-colors"
        />

        {unknownPlaceholders.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <strong>Unknown placeholders:</strong>{" "}
            {unknownPlaceholders.map((p) => `{{${p}}}`).join(", ")} — these will render as empty strings. Remove or fix them.
          </div>
        )}
        {missingPlaceholders.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-[#FF5500]">
            <strong>Not referenced:</strong>{" "}
            {missingPlaceholders.map((p) => `{{${p}}}`).join(", ")} — these variables won&rsquo;t appear in the prompt. That&rsquo;s fine if intentional.
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs">
        <button
          onClick={() => setPreviewOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-[#FF5500] transition-colors"
        >
          <span>{previewOpen ? "▼" : "▶"}</span>
          Preview rendered prompt (with sample values)
        </button>
        {previewOpen && (
          <pre className="mt-4 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
            {samplePreview}
          </pre>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={resetToDefault}
          disabled={saving || !isOverride}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
        >
          Reset to default
        </button>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-600 font-bold">✓ Saved</span>}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-xl bg-[#FF5500] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04800] disabled:opacity-40 transition-colors shadow-md shadow-[#FF5500]/20"
          >
            {saving ? "Saving..." : dirty ? "Save override" : "No changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
