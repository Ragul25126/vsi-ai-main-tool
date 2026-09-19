import type { Metadata } from "next";
import { requireSuperAdmin, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QA_SECTIONS } from "@/lib/qa-checklist";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { StatusLabel, type Tone } from "@/components/ui/Status";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { LoadFailed } from "@/components/admin/bits";

export const metadata: Metadata = { title: "QA checklist" };
export const dynamic = "force-dynamic";

interface CheckRow {
  tester_id: string;
  tester_name: string;
  item_key: string;
  status: string;
  notes: string | null;
  updated_at: string;
}

const TONE: Record<string, Tone> = { pass: "positive", fail: "critical", skipped: "neutral" };
const LABEL: Record<string, string> = { pass: "Pass", fail: "Fail", skipped: "Skipped" };

export default async function AdminQAPage() {
  await requireSuperAdmin();
  const header = <PageHeader title="Settings" description="Progress of manual QA testers. Each tester signs in at /qa with their own code." />;

  if (isDummySupabase()) {
    return (
      <PageContainer>
        {header}
        <SettingsTabs current="qa" />
        <LoadFailed message="VSI isn't connected to its database in this environment." />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("qa_all_checks_admin");
  const rows = (data ?? []) as CheckRow[];
  const testers = new Map<string, { name: string; items: Map<string, CheckRow> }>();
  for (const r of rows) {
    if (!testers.has(r.tester_id)) testers.set(r.tester_id, { name: r.tester_name, items: new Map() });
    testers.get(r.tester_id)!.items.set(r.item_key, r);
  }
  const list = [...testers.entries()];

  return (
    <PageContainer>
      {header}
      <SettingsTabs current="qa" />
      {error ? (
        <LoadFailed message="QA progress couldn't be loaded right now." />
      ) : list.length === 0 ? (
        <p className="rounded-panel border border-line bg-surface px-4 py-8 text-center text-body text-ink-2">No QA submissions yet.</p>
      ) : (
        <div className="space-y-8">
          <ul className="grid gap-x-10 gap-y-2 text-support sm:grid-cols-2">
            {list.map(([id, t]) => {
              const items = [...t.items.values()];
              return (
                <li key={id} className="flex justify-between gap-4 border-b border-line py-2">
                  <span className="font-medium text-ink">{t.name}</span>
                  <span className="text-ink-3">
                    {items.length} checked, {items.filter((i) => i.status === "pass").length} pass, {items.filter((i) => i.status === "fail").length} fail
                  </span>
                </li>
              );
            })}
          </ul>
          {QA_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-section font-semibold text-ink">{section.title}</h2>
              <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
                {section.tests.map((t) => (
                  <li key={t.id} className="grid gap-2 px-4 py-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <span className="text-support text-ink">
                      <span className="mr-2 font-mono text-caption text-ink-3">{t.id}</span>
                      {t.label}
                    </span>
                    <span className="flex flex-wrap gap-x-4 gap-y-1">
                      {list.map(([id, tester]) => {
                        const r = tester.items.get(t.id);
                        return (
                          <span key={id} className="flex items-center gap-1.5 text-caption text-ink-3" title={r?.notes ?? undefined}>
                            {tester.name}:{" "}
                            {r ? <StatusLabel tone={TONE[r.status] ?? "neutral"}>{LABEL[r.status] ?? r.status}</StatusLabel> : "Not checked"}
                          </span>
                        );
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
