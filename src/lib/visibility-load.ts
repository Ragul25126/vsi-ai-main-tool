import "server-only";
import { isDummySupabase } from "@/lib/auth";
import { buildGeo, finishGeo, GEO_COLUMNS, loadChatgptSystemSetting, loadGeo, type GeoLoad } from "@/lib/geo-load";
import { buildSearch, loadSearch, SEARCH_COLUMNS, type SearchLoad } from "@/lib/search-load";
import { loadProjectFlags, loadRecentResults, loadTrackedKeywords, mergeColumns } from "@/lib/project-data-load";
import type { ProjectSummary } from "@/lib/project-types";

/**
 * AI and Search visibility for pages that show both. Both summaries come from
 * the same recent checks, so they're read once instead of once per summary.
 */
export async function loadVisibility(project: ProjectSummary, opts: { evidence?: boolean } = {}): Promise<{ geo: GeoLoad; search: SearchLoad }> {
  if (isDummySupabase()) {
    const [geo, search] = await Promise.all([loadGeo(project, opts), loadSearch(project)]);
    return { geo, search };
  }

  const [flags, keywords, rows, chatgptSystem] = await Promise.all([
    loadProjectFlags(project.id),
    loadTrackedKeywords(project.id),
    loadRecentResults(project.id, mergeColumns(GEO_COLUMNS, SEARCH_COLUMNS)),
    loadChatgptSystemSetting(),
  ]);
  const search = buildSearch(flags, keywords, rows);
  const geo = await finishGeo(project, buildGeo(project, flags, keywords, rows, chatgptSystem), opts);
  return { geo, search };
}
