import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, type SessionContext } from "@/lib/auth";
import { PROJECT_COOKIE, type ProjectSummary } from "@/lib/project-types";

export { PROJECT_COOKIE };
export type { ProjectSummary };

export interface ProjectContext {
  projects: ProjectSummary[];
  active: ProjectSummary | null;
  /** Set when the project list could not be loaded (network, database). */
  error: string | null;
}

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  brand_name: string | null;
  service_type: string | null;
  default_location: string | null;
  agency_id: string;
  agencies?: { name?: string | null; display_name?: string | null } | { name?: string | null; display_name?: string | null }[] | null;
};

const loadProjects = cache(async (userId: string, agencyId: string | null, isSuperAdmin: boolean) => {
  if (isDummySupabase()) {
    return { projects: [] as ProjectSummary[], error: null as string | null };
  }
  const supabase = await createClient();
  const base = supabase
    .from("clients")
    .select("id, name, website, brand_name, service_type, default_location, agency_id, agencies(name, display_name)")
    .order("created_at", { ascending: true });
  const { data, error } = await (isSuperAdmin || !agencyId ? base : base.eq("agency_id", agencyId));
  if (error) {
    console.error("[project-context] failed to load projects", { userId, code: error.code });
    return { projects: [] as ProjectSummary[], error: "We couldn't load your projects right now." };
  }
  const projects = ((data ?? []) as ClientRow[]).map((c) => {
    const agency = Array.isArray(c.agencies) ? c.agencies[0] : c.agencies;
    return {
      id: c.id,
      name: c.name,
      website: c.website,
      brandName: c.brand_name,
      serviceType: c.service_type,
      defaultLocation: c.default_location,
      agencyId: c.agency_id,
      agencyName: isSuperAdmin ? agency?.display_name ?? agency?.name ?? null : null,
    } satisfies ProjectSummary;
  });
  return { projects, error: null as string | null };
});

/**
 * The single source of "which project am I looking at".
 * Order: explicit override (deep link) → vsi_project cookie → first project.
 * Only projects the session may access are ever returned.
 */
export async function getProjectContext(session: SessionContext, override?: string | null): Promise<ProjectContext> {
  const isSuperAdmin = session.role === "super_admin";
  const { projects, error } = await loadProjects(session.userId, session.agencyId, isSuperAdmin);
  const cookieStore = await cookies();
  const wanted = override || cookieStore.get(PROJECT_COOKIE)?.value || null;
  const active = projects.find((p) => p.id === wanted) ?? projects[0] ?? null;
  return { projects, active, error };
}
