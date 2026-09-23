/** Browser helpers for the project keywords/searches API. */

export type KeywordResult =
  | { ok: true; count: number }
  | { ok: false; code: string; message: string };

export type RemoveKeywordResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export type SearchInputItem =
  | string
  | {
      keyword: string;
      trackType?: string;
      location?: string;
    };

export async function addSearches(
  projectId: string,
  searches: SearchInputItem[]
): Promise<KeywordResult> {
  try {
    const res = await fetch(`/api/projects/${projectId}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searches }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      count?: number;
      error?: { code?: string; message?: string };
    };

    if (res.ok && (body.ok || body.count !== undefined)) {
      return { ok: true, count: body.count ?? searches.length };
    }

    return {
      ok: false,
      code: body.error?.code ?? "failed",
      message: body.error?.message ?? "We couldn't save these searches. Please try again.",
    };
  } catch {
    return {
      ok: false,
      code: "network",
      message: "We couldn't reach VSI. Check your connection and try again.",
    };
  }
}

export async function removeSearch(
  projectId: string,
  keywordId: string
): Promise<RemoveKeywordResult> {
  try {
    const res = await fetch(`/api/projects/${projectId}/keywords/${keywordId}`, {
      method: "DELETE",
    });

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: { code?: string; message?: string };
    };

    if (res.ok && body.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      code: body.error?.code ?? "failed",
      message: body.error?.message ?? "We couldn't remove that search. Please try again.",
    };
  } catch {
    return {
      ok: false,
      code: "network",
      message: "We couldn't reach VSI. Check your connection and try again.",
    };
  }
}
