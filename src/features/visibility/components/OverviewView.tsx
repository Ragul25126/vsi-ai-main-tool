import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer, PageHeader, Section, TextLink } from "@/components/ui/Page";
import { Notice, StatusIcon } from "@/components/ui/Status";
import { SetupChecklist, type SetupItem } from "@/components/intro/SetupPanel";
import { Welcome } from "@/components/intro/Welcome";
import { RunChecksButton } from "@/features/geo/components/RunChecksButton";
import { formatDate } from "@/lib/format";
import { TrendLine, type TrendPoint } from "./TrajectoryChart";
import type { Finding } from "@/lib/findings";
import KeywordLookup from "./KeywordLookup";

export interface OverviewData {
  project: { id: string; name: string; domain: string | null } | null;
  loadError: string | null;
  website: { score: number | null; problems: number; checkedAt: string | null; running: boolean; error: string | null };
  search: { tracked: number; top10: number; improved: number; declined: number; checkedAt: string | null; error: string | null };
  ai: { visibility: number | null; appears: number; answered: number; checkedAt: string | null; error: string | null; topCompetitor: { domain: string; answers: number } | null; yourCitations: number };
  tasks: { todo: number; inProgress: number; doneLast30: number; verified: number } | null;
  activeSearches: number;
  topFindings: (Finding & { hasTask: boolean })[];
  findingCount: number;
  urgentCount: number;
  trends: { website: TrendPoint[]; ai: TrendPoint[]; search: TrendPoint[] };
  /** Competitors the user added ("setup_required" until migration 036 is applied). */
  competitors: { state: "ok" | "setup_required" | "error"; domains: string[] };
  /** Parts of project setup that didn't save, passed from the setup flow. */
  setupNotices: string[];
}

const SETUP_NOTICE: Record<string, { title: string; body: string; href: string; label: string }> = {
  searches_not_saved: {
    title: "Your searches weren't saved",
    body: "The project was created, but its searches couldn't be saved. Add them again to start checking Google and AI answers.",
    href: "/dashboard/services/seo",
    label: "Add searches",
  },
  competitors_not_saved: {
    title: "Your competitors weren't saved",
    body: "The project was created, but its competitors couldn't be saved. Add them on the Competitors page.",
    href: "/dashboard/competitors",
    label: "Competitors",
  },
  audit_not_started: {
    title: "The site audit didn't start",
    body: "Your project is ready, but the first site audit couldn't be started. Start it from Site Audit.",
    href: "/dashboard/check",
    label: "Site Audit",
  },
};

function headline(d: OverviewData): string {
  const urgent = d.urgentCount;
  if (d.findingCount === 0) return "Nothing needs your attention right now.";
  if (urgent > 0) return `${urgent === 1 ? "One thing needs" : `${urgent} things need`} your attention, and ${d.findingCount - urgent} more could be improved.`;
  return `${d.findingCount === 1 ? "One thing" : `${d.findingCount} things`} could be improved. Start with the first one below.`;
}

export default function OverviewView({ data }: { data: OverviewData }) {
  const { project } = data;

  if (!project) {
    if (!data.loadError) return <Welcome />;
    return (
      <PageContainer>
        <PageHeader title="Overview" />
        <Notice tone="critical" title={data.loadError}>Refresh the page to try again.</Notice>
      </PageContainer>
    );
  }

  const searchChecked = data.search.checkedAt !== null;
  const aiChecked = data.ai.checkedAt !== null;
  const anyChecks = searchChecked || aiChecked;
  const hasAnyResult = anyChecks || data.website.checkedAt !== null;
  const setup: SetupItem[] = [
    project.domain
      ? { state: "done", label: "Website added", detail: project.domain }
      : { state: "todo", label: "Website address", detail: "Missing", href: `/dashboard/clients/${project.id}/settings`, hrefLabel: "Add it" },
    data.activeSearches > 0
      ? { state: "done", label: "Searches to track", detail: `${data.activeSearches} ${data.activeSearches === 1 ? "search" : "searches"}` }
      : { state: "todo", label: "Searches to track", detail: "None yet", href: `/dashboard/clients/${project.id}/keywords/new`, hrefLabel: "Add searches" },
    data.competitors.domains.length > 0
      ? { state: "done", label: "Your competitors", detail: `${data.competitors.domains.length} ${data.competitors.domains.length === 1 ? "competitor" : "competitors"}` }
      : data.competitors.state === "ok"
        ? { state: "todo", label: "Your competitors", detail: "None yet", href: "/dashboard/competitors", hrefLabel: "Add competitors" }
        : { state: "todo", label: "Your competitors", detail: "Needs a database update", href: "/dashboard/competitors", hrefLabel: "Details" },
    data.website.checkedAt
      ? { state: "done", label: "Site audit", detail: data.website.score !== null ? `Score ${data.website.score} / 100` : "Done" }
      : data.website.running
        ? { state: "running", label: "Site audit", detail: "Running now" }
        : { state: "todo", label: "Site audit", detail: "Not run yet", href: "/dashboard/check", hrefLabel: "Run site audit" },
    searchChecked
      ? { state: "done", label: "Search visibility", detail: `Checked ${formatDate(data.search.checkedAt)}` }
      : { state: "todo", label: "Search visibility", detail: "Not checked yet" },
    aiChecked
      ? { state: "done", label: "AI visibility", detail: `Checked ${formatDate(data.ai.checkedAt)}` }
      : { state: "todo", label: "AI visibility", detail: "Not checked yet" },
  ];
  // Competitors are optional, so they don't keep "Getting started" open on their own.
  const setupDone = setup.filter((s) => s.label !== "Your competitors").every((s) => s.state === "done");

  return (
    <PageContainer>
      <PageHeader
        title={project.name}
        description="See your website health, search visibility, AI visibility and the actions that can improve them, all in one place."
        meta={project.domain && <span>{project.domain}</span>}
      />

      {data.setupNotices.map((key) => {
        const n = SETUP_NOTICE[key];
        if (!n) return null;
        return (
          <Notice key={key} tone="attention" title={n.title} action={<TextLink href={n.href}>{n.label}</TextLink>}>
            {n.body}
          </Notice>
        );
      })}

      {!setupDone && (
        <Section title="Getting started" description="What has been set up for this project so far. Each step unlocks more of VSI.">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
            <SetupChecklist items={setup} />
            {!anyChecks && data.activeSearches > 0 && (
              <div className="space-y-3 rounded-panel bg-surface-2 p-5">
                <p className="text-body font-medium text-ink">Run your first search and AI check</p>
                <p className="text-support text-ink-2">
                  One check looks up your Google position and asks AI systems about each of your {data.activeSearches}{" "}
                  {data.activeSearches === 1 ? "search" : "searches"}. It uses search credits, so VSI only runs it when you start it.
                </p>
                <RunChecksButton clientId={project.id} searches={data.activeSearches} label="Run first check" align="start" />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Only claim "nothing needs attention" once something has actually been checked. */}
      {(anyChecks || data.website.checkedAt) && <p className="max-w-[60ch] text-title font-medium text-ink">{headline(data)}</p>}

      {/* At a glance and next actions: shown once something has been checked; before that, "Getting started" says it all. */}
      {hasAnyResult && (
      <>
      <section aria-label="At a glance" className="grid grid-cols-1 border-y border-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
        <Glance
          label="Website health"
          value={data.website.score !== null ? `${data.website.score}` : null}
          suffix="/ 100"
          empty="Not audited yet"
          sub={data.website.error ?? (data.website.score !== null ? `${data.website.problems} ${data.website.problems === 1 ? "thing" : "things"} to fix or improve` : "Run a site audit to get your score")}
          href="/dashboard/check"
          linkLabel="Site Audit"
        />
        <Glance
          label="Google first page"
          value={data.search.tracked > 0 ? `${data.search.top10}` : null}
          suffix={data.search.tracked > 0 ? `of ${data.search.tracked}` : undefined}
          empty="Not checked yet"
          sub={
            data.search.error ??
            (data.search.tracked > 0
              ? data.search.improved + data.search.declined > 0
                ? `${data.search.improved} up, ${data.search.declined} down since last check`
                : "No change since last check"
              : "Rankings appear after your first check")
          }
          href="/dashboard/services/seo"
          linkLabel="Search Visibility"
        />
        <Glance
          label="AI visibility"
          value={data.ai.visibility !== null ? `${data.ai.visibility}%` : null}
          empty="Not checked yet"
          sub={data.ai.error ?? (data.ai.answered > 0 ? `Mentioned in ${data.ai.appears} of ${data.ai.answered} AI answers` : "Run an AI check to see if AI mentions you")}
          href="/dashboard/geo"
          linkLabel="AI Visibility"
        />
        <Glance
          label="Tasks"
          value={data.tasks ? `${data.tasks.todo + data.tasks.inProgress}` : null}
          suffix={data.tasks ? "open" : undefined}
          empty="None yet"
          sub={data.tasks ? `${data.tasks.doneLast30} done in the last 30 days, ${data.tasks.verified} confirmed by a re-check` : "Tasks you create appear here"}
          href="/dashboard/tasks"
          linkLabel="Tasks"
        />
      </section>

      {/* Next actions */}
      <Section
        title="Do these next"
        description="The most important findings from every part of VSI."
        action={data.findingCount > 3 ? { label: `All ${data.findingCount} actions`, href: "/dashboard/next-actions" } : undefined}
      >
        {data.topFindings.length === 0 ? (
          <p className="text-body text-ink-2">
            {data.website.checkedAt || data.ai.checkedAt || data.search.checkedAt
              ? "Nothing to fix from your latest checks. VSI will list new findings here after each check."
              : "Findings from your site audit, AI checks and rankings appear here after your first checks."}
          </p>
        ) : (
          <ol className="divide-y divide-line rounded-panel border border-line bg-surface">
            {data.topFindings.map((f, i) => (
              <li key={f.key}>
                <Link href={`/dashboard/next-actions?open=${encodeURIComponent(f.key)}`} className="flex items-start gap-3 px-4 py-4 hover:bg-surface-2">
                  <span className="mt-0.5 w-5 shrink-0 text-support font-semibold tabular text-ink-3">{i + 1}</span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-body font-medium text-ink">{f.title}</span>
                    <span className="block text-support text-ink-2">{f.whatWeFound}</span>
                    <span className="block text-caption text-ink-3">
                      {f.sourceLabel}
                      {f.hasTask ? " · Task already created" : ""}
                    </span>
                  </span>
                  <StatusIcon tone={f.tone} size={18} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Section>

      </>
      )}

      {/* Progress: only once there is something to track. */}
      {(anyChecks || data.website.checkedAt) && (
      <Section title="Progress over time" description="Each point is one check. Lines appear once there are two or more checks.">
        <div className="grid gap-8 md:grid-cols-3">
          <TrendBlock title="Website health" points={data.trends.website} format={(v) => `${v}`} empty="After your second site audit" />
          <TrendBlock title="AI visibility" points={data.trends.ai} format={(v) => `${v}%`} empty="After your second AI check" />
          <TrendBlock title="Searches on Google's first page" points={data.trends.search} format={(v) => `${v}%`} empty="After your second ranking check" />
        </div>
      </Section>
      )}

      {(data.ai.topCompetitor || data.competitors.domains.length > 0) && (
        <Section title="Competitors" action={{ label: "Competitors", href: "/dashboard/competitors" }}>
          {data.ai.topCompetitor && (
            <p className="max-w-[65ch] text-body text-ink-2">
              {data.ai.topCompetitor.answers > data.ai.yourCitations ? (
                <>
                  <span className="font-medium text-ink">{data.ai.topCompetitor.domain}</span> is linked in {data.ai.topCompetitor.answers} AI
                  answers for your searches. Your website is linked in {data.ai.yourCitations}.
                </>
              ) : (
                <>
                  Your website is linked in {data.ai.yourCitations} AI answers, at least as often as any competitor. The closest is{" "}
                  <span className="font-medium text-ink">{data.ai.topCompetitor.domain}</span> with {data.ai.topCompetitor.answers}.
                </>
              )}
            </p>
          )}
          {data.competitors.domains.length > 0 && (
            <p className="max-w-[65ch] text-support text-ink-3">
              You&apos;re tracking {data.competitors.domains.slice(0, 3).join(", ")}
              {data.competitors.domains.length > 3 ? ` and ${data.competitors.domains.length - 3} more` : ""}.
              {!anyChecks && " They appear in the comparison after your first check."}
            </p>
          )}
        </Section>
      )}

      <Section title="Look up any search" description="See who Google shows for a search right now. This doesn't use your tracked searches.">
        <KeywordLookup />
      </Section>
    </PageContainer>
  );
}

function Glance({
  label,
  value,
  suffix,
  empty,
  sub,
  href,
  linkLabel,
}: {
  label: string;
  value: string | null;
  suffix?: string;
  empty: string;
  sub: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-5 last:border-b-0 sm:px-5 sm:[&:nth-child(odd)]:pl-0 lg:border-b-0 lg:first:pl-0">
      <p className="text-caption font-medium text-ink-3">{label}</p>
      {value !== null ? (
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular text-ink">{value}</span>
          {suffix && <span className="text-support text-ink-3">{suffix}</span>}
        </p>
      ) : (
        <p className="text-body font-medium text-ink-3">{empty}</p>
      )}
      <p className="text-support text-ink-3">{sub}</p>
      <Link href={href} className="mt-1 inline-flex items-center gap-1 text-support font-medium text-ink-2 hover:text-ink">
        {linkLabel}
        <ArrowRight size={13} strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}

function TrendBlock({ title, points, format, empty }: { title: string; points: TrendPoint[]; format: (v: number) => string; empty: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="mb-3 text-support font-medium text-ink">{title}</p>
      {points.length >= 2 ? (
        <TrendLine points={points} format={format} ariaLabel={`${title} over time`} />
      ) : (
        <p className="text-support text-ink-3">{empty}</p>
      )}
    </div>
  );
}

