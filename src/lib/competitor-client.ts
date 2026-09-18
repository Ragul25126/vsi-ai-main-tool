/** Browser helpers for the project competitors API. */

export type CompetitorResult = { ok: true } | { ok: false; code: string; message: string };

async function send(url: string, init: RequestInit): Promise<CompetitorResult> {
  try {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
    return { ok: false, code: body.error?.code ?? "failed", message: body.error?.message ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, code: "network", message: "We couldn't reach VSI. Check your connection and try again." };
  }
}

export function addCompetitors(projectId: string, domains: string[]): Promise<CompetitorResult> {
  return send(`/api/projects/${projectId}/competitors`, { method: "POST", body: JSON.stringify({ domains }) });
}

export function removeCompetitor(projectId: string, competitorId: string): Promise<CompetitorResult> {
  return send(`/api/projects/${projectId}/competitors/${competitorId}`, { method: "DELETE" });
}
