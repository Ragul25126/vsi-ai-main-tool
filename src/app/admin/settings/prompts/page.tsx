import type { Metadata } from "next";
import { requireSuperAdmin, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PROMPTS, type PromptKey } from "@/lib/prompts";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { StatusLabel } from "@/components/ui/Status";
import { DataTable } from "@/components/admin/DataTable";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { When } from "@/components/admin/bits";

export const metadata: Metadata = { title: "AI prompts" };
export const dynamic = "force-dynamic";

export default async function PromptsListPage() {
  await requireSuperAdmin();
  const saved = new Map<string, string>();
  if (!isDummySupabase()) {
    const supabase = await createClient();
    const { data } = await supabase.from("prompts").select("key, updated_at");
    for (const r of (data ?? []) as { key: string; updated_at: string }[]) saved.set(r.key, r.updated_at);
  }
  const keys = Object.keys(DEFAULT_PROMPTS) as PromptKey[];

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Edit the prompts behind AI briefs and citation strategies without a redeploy. A broken or removed edit falls back to the built-in prompt."
      />
      <SettingsTabs current="prompts" />
      <DataTable
        caption="AI prompts"
        columns={[{ label: "Prompt" }, { label: "In use" }, { label: "Last edited" }]}
        rows={keys.map((k) => {
          const def = DEFAULT_PROMPTS[k];
          const at = saved.get(k) ?? null;
          return {
            key: k,
            href: `/admin/settings/prompts/${k}`,
            cells: [
              <span key="t" className="block">
                <span className="block">{def.title}</span>
                <span className="block text-caption font-normal text-ink-3">{def.description}</span>
              </span>,
              at ? (
                <StatusLabel key="s" tone="info">
                  Edited version
                </StatusLabel>
              ) : (
                <StatusLabel key="s" tone="neutral">
                  Built-in
                </StatusLabel>
              ),
              <When key="w" iso={at} missing="Never" />,
            ],
          };
        })}
        empty="No prompts are defined."
      />
    </PageContainer>
  );
}
