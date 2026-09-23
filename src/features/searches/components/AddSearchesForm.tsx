"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Location } from "@/types/search";
import { addSearches } from "@/lib/keyword-client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Status";
import { useSearchSuggestions, type SearchItem } from "../search-suggestions";
import { SearchPicker } from "./SearchPicker";

/** Add searches to an existing project. The project was loaded and access-checked on the server. */
export function AddSearchesForm({
  project,
  existing,
}: {
  project: { id: string; agencyId: string; name: string; domain: string; brand: string; industry: string | null; location: Location };
  existing: string[];
}) {
  const router = useRouter();
  const { suggestions, loadSuggestions } = useSearchSuggestions();
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSuggestions({ domain: project.domain, brandName: project.brand, industry: project.industry ?? undefined, location: project.location });
  }, [loadSuggestions, project.domain, project.brand, project.industry, project.location]);

  async function save() {
    if (searches.length === 0) return;
    setSaving(true);
    setError(null);
    const result = await addSearches(
      project.id,
      searches.map((s) => ({
        keyword: s.keyword,
        trackType: s.trackType,
        location: project.location,
      }))
    );
    if (!result.ok) {
      setSaving(false);
      setError(result.message);
      return;
    }
    // The next step for new searches is a first check, which the Overview offers.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {error && <Notice tone="critical" title={error} />}
      <SearchPicker value={searches} onChange={setSearches} suggestions={suggestions} domain={project.domain} existing={existing} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <ButtonLink href={`/dashboard/clients/${project.id}/keywords`} variant="quiet">
          Cancel
        </ButtonLink>
        <Button variant="primary" onClick={save} disabled={saving || searches.length === 0}>
          {saving && <Loader2 size={15} className="animate-spin" aria-hidden />}
          {searches.length > 0 ? `Save ${searches.length} ${searches.length === 1 ? "search" : "searches"}` : "Save searches"}
        </Button>
      </div>
    </div>
  );
}
