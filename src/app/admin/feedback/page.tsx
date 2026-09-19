import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin, isDummySupabase } from "@/lib/auth";
import { param, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { LoadFailed } from "@/components/admin/bits";
import FeedbackAdminRow from "@/components/FeedbackAdminRow";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

type Named = { name: string | null; display_name: string | null } | { name: string | null; display_name: string | null }[] | null;
type Person = { full_name: string | null } | { full_name: string | null }[] | null;
type Row = {
  id: string;
  category: string;
  message: string;
  page_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  agencies: Named;
  profiles: Person;
};

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const status = param(sp, "status") || "new";
  const category = param(sp, "category");

  const header = <PageHeader title="Feedback" description="What customers have sent from inside VSI. Set a status as you go; notes are private to platform admins." />;

  if (isDummySupabase()) {
    return (
      <PageContainer>
        {header}
        <LoadFailed message="VSI isn't connected to its database in this environment." />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, category, message, page_url, status, admin_notes, created_at, agencies(name, display_name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <PageContainer>
        {header}
        <LoadFailed message="Feedback couldn't be loaded right now." />
      </PageContainer>
    );
  }

  const rows = (data ?? []) as unknown as Row[];
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const filtered = rows.filter((r) => (status === "all" || r.status === status) && (!category || r.category === category));

  return (
    <PageContainer>
      {header}
      <TableToolbar
        filters={[
          {
            param: "status",
            label: "Status",
            options: [
              { value: "", label: `New (${count("new")})` },
              { value: "triaged", label: `Triaged (${count("triaged")})` },
              { value: "in_progress", label: `In progress (${count("in_progress")})` },
              { value: "done", label: `Done (${count("done")})` },
              { value: "archived", label: `Archived (${count("archived")})` },
              { value: "all", label: `All (${rows.length})` },
            ],
          },
          {
            param: "category",
            label: "Type",
            options: [
              { value: "", label: "All types" },
              { value: "bug", label: "Bugs" },
              { value: "idea", label: "Ideas" },
              { value: "question", label: "Questions" },
              { value: "praise", label: "Praise" },
              { value: "general", label: "Other" },
            ],
          },
        ]}
      />
      {filtered.length === 0 ? (
        <p className="rounded-panel border border-line bg-surface px-4 py-8 text-center text-body text-ink-2">{rows.length === 0 ? "No feedback yet." : "No feedback in this view."}</p>
      ) : (
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {filtered.map((r) => {
            const agency = Array.isArray(r.agencies) ? r.agencies[0] : r.agencies;
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            return (
              <FeedbackAdminRow
                key={r.id}
                row={{
                  id: r.id,
                  category: r.category,
                  message: r.message,
                  status: r.status,
                  page_url: r.page_url,
                  admin_notes: r.admin_notes,
                  created_at: r.created_at,
                  agency_name: agency?.display_name ?? agency?.name ?? "Unknown organization",
                  user_name: profile?.full_name ?? null,
                }}
              />
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
