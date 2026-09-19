import { requireSuperAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEFAULT_PROMPTS, getSavedPrompt, type PromptKey } from "@/lib/prompts";
import PromptEditor from "@/components/admin/PromptEditor";

export const dynamic = "force-dynamic";

export default async function PromptEditPage({ params }: { params: Promise<{ key: string }> }) {
  // Checked here, not only in the layout: layouts don't re-run on client navigation.
  await requireSuperAdmin();
  const { key } = await params;
  const promptKey = key as PromptKey;
  const def = DEFAULT_PROMPTS[promptKey];
  if (!def) notFound();

  const saved = await getSavedPrompt(promptKey);
  const currentTemplate = saved?.template ?? def.template;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/admin/prompts" className="hover:text-brand-strong transition-colors">Prompts</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">{def.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{def.title}</h1>
        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
      </div>

      <PromptEditor
        promptKey={promptKey}
        title={def.title}
        defaultTemplate={def.template}
        currentTemplate={currentTemplate}
        variables={def.variables}
        outputFormat={def.outputFormat}
        isOverride={!!saved}
      />
    </div>
  );
}
