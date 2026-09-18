import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAgency } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Intro } from "@/components/intro/intros";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

/** Reports for the active project, or the Reports introduction when there is none. */
export default async function ReportsPage() {
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);
  if (active) redirect(`/dashboard/clients/${active.id}/reports`);
  if (!error) return <Intro name="reports" />;
  return (
    <PageContainer>
      <PageHeader title="Reports" />
      <Notice tone="critical" title={error}>
        Refresh the page to try again.
      </Notice>
    </PageContainer>
  );
}
