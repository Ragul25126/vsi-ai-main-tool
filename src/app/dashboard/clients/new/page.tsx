"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { normaliseDomain } from "@/lib/url-input";
import { INDUSTRIES, COUNTRIES, LOCATIONS } from "@/types/search";
import type { Location } from "@/types/search";
import { useSearchSuggestions, type SearchItem } from "@/features/searches/search-suggestions";
import { SearchPicker } from "@/features/searches/components/SearchPicker";
import { MAX_COMPETITORS, validateCompetitorDomain } from "@/lib/project-competitors";
import { addCompetitors } from "@/lib/competitor-client";
import { PageContainer } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { cn } from "@/lib/utils";

const STEPS = ["Website", "Searches", "Competitors", "Start VSI"] as const;

interface Details {
  website: string;
  name: string;
  brandName: string;
  industry: string;
  country: string;
  location: Location;
}

type StartStep = "project" | "searches" | "competitors" | "select" | "audit";
const START_LABEL: Record<StartStep, string> = {
  project: "Create your project",
  searches: "Save your searches",
  competitors: "Save your competitors",
  select: "Make it your active project",
  audit: "Start your free site audit",
};

const inputClass =
  "h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none";

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({
    website: "",
    name: "",
    brandName: "",
    industry: "",
    country: "United Arab Emirates",
    location: "ae",
  });
  const [touched, setTouched] = useState(false);

  const { suggestions, loadSuggestions } = useSearchSuggestions();
  const [searches, setSearches] = useState<SearchItem[]>([]);

  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [competitorError, setCompetitorError] = useState<string | null>(null);

  const [starting, setStarting] = useState<{ done: StartStep[]; current: StartStep | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const domain = normaliseDomain(details.website)?.domain ?? null;
  const step1Valid = !!domain && !!details.name.trim();

  function update<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  function next() {
    setError(null);
    if (step === 0) {
      setTouched(true);
      if (!step1Valid || !domain) return;
      void loadSuggestions({
        domain,
        brandName: details.brandName.trim() || details.name.trim(),
        industry: details.industry || undefined,
        location: details.location,
      });
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function addCompetitor(e: FormEvent) {
    e.preventDefault();
    setCompetitorError(null);
    const check = validateCompetitorDomain(competitorInput, domain, competitors);
    if (!check.ok) {
      setCompetitorError(check.message);
      return;
    }
    setCompetitors((list) => [...list, check.domain]);
    setCompetitorInput("");
  }

  /** Every status shown here is a real request finishing, in order. */
  async function start() {
    if (!domain) return;
    setError(null);
    const done: StartStep[] = [];
    const mark = (current: StartStep | null) => setStarting({ done: [...done], current });
    const notices: string[] = [];

    try {
      mark("project");
      const supabase = createClient();
      let agencyId: string | null = null;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
          agencyId = (profile?.agency_id as string | undefined) ?? null;
        }
      } catch {
        /* handled below */
      }
      if (!agencyId) throw new Error("Your session has ended. Sign in again to add your website.");

      const brand = details.brandName.trim() || details.name.trim();
      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .insert({
          name: details.name.trim(),
          website: domain,
          brand_name: brand,
          service_type: "geo",
          country: details.country || null,
          industry: details.industry || null,
          default_location: details.location,
          agency_id: agencyId,
        })
        .select("id")
        .single();
      if (clientErr || !client?.id) {
        throw new Error(
          clientErr?.message?.toLowerCase().includes("limit")
            ? "Your plan's project limit is reached."
            : "We couldn't create the project. Please try again.",
        );
      }
      const projectId = client.id as string;
      done.push("project");

      if (searches.length > 0) {
        mark("searches");
        const { error: kwErr } = await supabase.from("tracked_keywords").insert(
          searches.map((s) => ({
            client_id: projectId,
            agency_id: agencyId,
            keyword: s.keyword,
            domain,
            brand,
            track_type: s.trackType,
            location: details.location,
          })),
        );
        if (kwErr) notices.push("searches_not_saved");
        else done.push("searches");
      }

      if (competitors.length > 0) {
        mark("competitors");
        const saved = await addCompetitors(projectId, competitors);
        if (!saved.ok) notices.push("competitors_not_saved");
        else done.push("competitors");
      }

      mark("select");
      await fetch("/api/project/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      done.push("select");

      // The site audit is free (VSI's own crawler). Search and AI checks use
      // paid credits, so they are never started automatically.
      mark("audit");
      const audit = await fetch("/api/site-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: projectId }),
      }).catch(() => null);
      if (!audit || (!audit.ok && audit.status !== 409)) notices.push("audit_not_started");
      else done.push("audit");
      mark(null);

      const query = notices.length ? `?setup=${notices.join(",")}` : "";
      router.push(`/dashboard${query}`);
      router.refresh();
    } catch (err) {
      setStarting(null);
      setError(err instanceof Error ? err.message : "We couldn't create the project. Please try again.");
    }
  }

  return (
    <PageContainer className="max-w-[880px]">
      <header className="space-y-2">
        <h1 className="text-title font-semibold text-ink">Add your website</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          One website powers every part of VSI: Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks, Reports and AI
          Chat. You set it up once.
        </p>
      </header>

      <ol className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 sm:grid-cols-4" aria-label="Setup steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-caption",
                i < step ? "bg-ink text-white" : i === step ? "border-2 border-ink text-ink" : "border border-line-strong text-ink-3",
              )}
            >
              {i < step ? <Check size={12} strokeWidth={2.5} aria-hidden /> : i + 1}
            </span>
            <span className={cn("text-support", i === step ? "font-medium text-ink" : "text-ink-3")}>{label}</span>
          </li>
        ))}
      </ol>

      {error && <Notice tone="critical" title={error} />}

      {/* Step 1: website */}
      {step === 0 && (
        <StepBody
          title="Tell us about your website"
          why="VSI audits this website, looks for it in Google and AI answers, and uses the name to recognise when AI mentions you."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Website" htmlFor="website" error={touched && !domain ? "Enter a website like example.com" : undefined}>
              <input id="website" inputMode="url" autoComplete="url" placeholder="example.com" value={details.website} onChange={(e) => update("website", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Business name" htmlFor="name" error={touched && !details.name.trim() ? "Enter your business name" : undefined}>
              <input id="name" autoComplete="organization" placeholder="Your business" value={details.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Where are your customers?" htmlFor="location" hint="VSI checks Google and AI answers as they appear there.">
              <select id="location" value={details.location} onChange={(e) => update("location", e.target.value as Location)} className={inputClass}>
                {(Object.entries(LOCATIONS) as [Location, (typeof LOCATIONS)[Location]][]).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="What does your business do?" htmlFor="industry" hint="Optional. Helps VSI suggest searches.">
              <select id="industry" value={details.industry} onChange={(e) => update("industry", e.target.value)} className={inputClass}>
                <option value="">Choose one</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Disclosure summary="More details (optional)">
            <div className="grid gap-5 pt-3 sm:grid-cols-2">
              <Field label="Name customers know you by" htmlFor="brand" hint="If it's different from the business name.">
                <input id="brand" value={details.brandName} onChange={(e) => update("brandName", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Country" htmlFor="country">
                <select id="country" value={details.country} onChange={(e) => update("country", e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Disclosure>
        </StepBody>
      )}

      {/* Step 2: searches */}
      {step === 1 && (
        <StepBody
          title="What searches matter to your business?"
          why="These are the searches VSI checks in Google and in AI answers. Choose the ones your customers really use. You can change them later."
        >
          <SearchPicker value={searches} onChange={setSearches} suggestions={suggestions} domain={domain} />
        </StepBody>
      )}

      {/* Step 3: competitors */}
      {step === 2 && (
        <StepBody
          title="Who do you compete with?"
          why="VSI compares you with these businesses in Google and AI answers, and shows where they appear and you don't. It also finds other competitors on its own."
        >
          <form onSubmit={addCompetitor} className="flex max-w-xl flex-col gap-2 sm:flex-row">
            <label htmlFor="competitor" className="sr-only">
              Competitor website
            </label>
            <input id="competitor" inputMode="url" value={competitorInput} onChange={(e) => setCompetitorInput(e.target.value)} placeholder="competitor.com" className={inputClass} />
            <Button type="submit" variant="secondary" disabled={!competitorInput.trim() || competitors.length >= MAX_COMPETITORS}>
              <Plus size={15} strokeWidth={2} aria-hidden />
              Add competitor
            </Button>
          </form>
          {competitorError && (
            <p role="alert" className="text-support text-critical">
              {competitorError}
            </p>
          )}
          {competitors.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {competitors.map((c) => (
                <li key={c} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface pl-3 pr-1 text-support text-ink">
                  {c}
                  <button type="button" onClick={() => setCompetitors((list) => list.filter((d) => d !== c))} aria-label={`Remove ${c}`} className="rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink">
                    <X size={13} strokeWidth={1.75} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-support text-ink-3">Optional. You can add competitors later on the Competitors page. Up to {MAX_COMPETITORS}.</p>
          )}
        </StepBody>
      )}

      {/* Step 4: start */}
      {step === 3 && (
        <StepBody title="Start understanding your visibility" why="Here's what VSI will set up. Nothing that uses paid credits runs without you.">
          <dl className="divide-y divide-line border-y border-line">
            <Summary label="Website">
              {details.name.trim()} · {domain}
            </Summary>
            <Summary label="Searches">{searches.length > 0 ? `${searches.length} ${searches.length === 1 ? "search" : "searches"}` : "None yet. You can add them later."}</Summary>
            <Summary label="Competitors">{competitors.length > 0 ? competitors.join(", ") : "None yet. VSI will still find the ones that appear in your checks."}</Summary>
          </dl>

          {starting ? (
            <ul className="space-y-2" aria-live="polite">
              {(Object.keys(START_LABEL) as StartStep[])
                .filter((k) => (k === "searches" ? searches.length > 0 : k === "competitors" ? competitors.length > 0 : true))
                .map((k) => {
                  const isDone = starting.done.includes(k);
                  const isCurrent = starting.current === k;
                  return (
                    <li key={k} className={cn("flex items-center gap-2.5 text-body", isDone || isCurrent ? "text-ink" : "text-ink-3")}>
                      {isDone ? (
                        <CheckCircle2 size={17} strokeWidth={1.75} className="text-positive" aria-label="Done" />
                      ) : isCurrent ? (
                        <Loader2 size={17} strokeWidth={1.75} className="animate-spin text-info" aria-label="In progress" />
                      ) : (
                        <Circle size={17} strokeWidth={1.75} className="text-line-strong" aria-label="Waiting" />
                      )}
                      {START_LABEL[k]}
                    </li>
                  );
                })}
            </ul>
          ) : (
            <div className="space-y-2 rounded-panel bg-surface-2 p-5 text-support text-ink-2">
              <p className="font-medium text-ink">When you start, VSI will:</p>
              <ul className="space-y-1.5">
                <li className="flex gap-2"><Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-positive" aria-hidden />Create your project and make it the one every page uses</li>
                <li className="flex gap-2"><Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-positive" aria-hidden />Save your website, searches and competitors</li>
                <li className="flex gap-2"><Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-positive" aria-hidden />Run the free site audit</li>
              </ul>
              <p className="pt-1">Search and AI checks use search credits, so you start them yourself from the Overview when you&apos;re ready.</p>
            </div>
          )}
        </StepBody>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        {step > 0 && !starting ? (
          <Button variant="quiet" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={next}>
            {step === 1 && searches.length === 0 ? "Skip for now" : step === 2 && competitors.length === 0 ? "Skip for now" : "Continue"}
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden />
          </Button>
        ) : (
          <Button variant="primary" onClick={start} disabled={!!starting || !step1Valid}>
            {starting ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
            Start VSI
          </Button>
        )}
      </div>
    </PageContainer>
  );
}

function StepBody({ title, why, children }: { title: string; why: string; children: ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-section font-semibold text-ink">{title}</h2>
        <p className="max-w-[65ch] text-support text-ink-2">{why}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-support font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-critical">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

function Summary({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-support text-ink-3">{label}</dt>
      <dd className="text-body text-ink">{children}</dd>
    </div>
  );
}
