import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { DEFAULT_PROMPTS, getSavedPrompt, type PromptKey } from "@/lib/prompts";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { BackLink } from "@/components/admin/bits";
import PromptEditor from "@/components/admin/PromptEditor";

export const metadata: Metadata = { title: "Edit prompt" };
export const dynamic = "force-dynamic";

export default async function PromptEditPage({ params }: { params: Promise<{ key: string }> }) {
  await requireSuperAdmin();
  const { key } = await params;
  const promptKey = key as PromptKey;
  const def = DEFAULT_PROMPTS[promptKey];
  if (!def) notFound();

  const saved = await getSavedPrompt(promptKey);

  return (
    <PageContainer>
      <BackLink href="/admin/settings/prompts">AI prompts</BackLink>
      <PageHeader title={def.title} description={def.description} />
      <PromptEditor
        promptKey={promptKey}
        title={def.title}
        defaultTemplate={def.template}
        currentTemplate={saved?.template ?? def.template}
        variables={def.variables}
        outputFormat={def.outputFormat}
        isOverride={!!saved}
      />
    </PageContainer>
  );
}
