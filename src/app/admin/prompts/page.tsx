import Link from "next/link";
import { DEFAULT_PROMPTS, type PromptKey } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PromptsListPage() {
  const supabase = await createClient();
  const { data: savedRows } = await supabase
    .from("prompts")
    .select("key, template, updated_at");

  const savedMap = new Map((savedRows ?? []).map((r) => [r.key, r]));

  const keys = Object.keys(DEFAULT_PROMPTS) as PromptKey[];
  const rows = keys.map((key) => {
    const def = DEFAULT_PROMPTS[key];
    const s = savedMap.get(key);
    const saved = s ? { key, template: s.template, updated_at: s.updated_at, isOverride: true } : null;
    return { def, saved };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prompts</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Edit the LLM prompts that power AI Brief and Citation Strategy without redeploying. If a saved override is broken or removed, the system falls back to the hardcoded default automatically.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map(({ def, saved }) => (
          <Link
            key={def.key}
            href={`/admin/prompts/${def.key}`}
            className="block rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs hover:border-[#FF5500]/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="text-base font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors">{def.title}</p>
                  {saved ? (
                    <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">Override active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Default</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{def.description}</p>
                {saved && (
                  <p className="text-xs text-slate-400 font-medium mt-2">
                    Last edited {new Date(saved.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-[#FF5500] shrink-0 pt-0.5 group-hover:translate-x-0.5 transition-transform">Edit →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
