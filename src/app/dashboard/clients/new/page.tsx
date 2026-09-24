"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageContainer } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { cn } from "@/lib/utils";
import { addCompetitors } from "@/lib/competitor-client";
import { addSearches } from "@/lib/keyword-client";
import { createWorkspace } from "@/lib/workspace";
import type { Location } from "@/types/search";

import { WebsiteUrlStep } from "@/components/project-creation/WebsiteUrlStep";
import { AnalysisProgress } from "@/components/project-creation/AnalysisProgress";
import { BusinessSummary, type BusinessData } from "@/components/project-creation/BusinessSummary";
import { CompetitorSelection, detectMarketFromDomain, type CompetitorItem } from "@/components/project-creation/CompetitorSelection";
import { AnalysisSetup, type KeywordSetupItem } from "@/components/project-creation/AnalysisSetup";
import { StepFooter } from "@/components/project-creation/StepFooter";
import { AnalysisStartModal } from "@/components/project-creation/AnalysisStartModal";
import type { ExtractedWebsiteData } from "@/app/api/analyze-website/route";

const STEP_LABELS = ["Website", "Business", "Competitors", "SEO Setup"] as const;

export default function NewProjectPage() {
  const router = useRouter();

  // Wizard state: 1: Website Input/Analysis, 2: Business Summary, 3: Competitor Websites, 4: SEO Setup
  const [step, setStep] = useState<number>(1);
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [isProgressShowing, setIsProgressShowing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Business summary data state
  const [businessData, setBusinessData] = useState<BusinessData>({
    brandName: "",
    domain: "",
    businessType: "E-commerce & Services",
    websiteTitle: "",
    metaDescription: "",
    language: "English",
    location: "United States",
    locationCode: "us",
    suggestedTopics: [],
    sitemapUrl: "",
    competitiveAdvantage: "",
    aboutBusiness: "",
    targetCustomers: [],
  });

  // Competitor list state
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);

  // Keywords & SEO setup state
  const [keywords, setKeywords] = useState<KeywordSetupItem[]>([]);
  const [geoTopics, setGeoTopics] = useState<string[]>([]);

  // Start analysis job submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Step 1: Trigger backend website analysis */
  async function handleAnalyzeWebsite(url: string) {
    setIsAnalyzingWebsite(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "We couldn't access this website. Please check the URL and try again.");
      }

      const extracted: ExtractedWebsiteData = json.data;
      const targetLocation = extracted.location || "United States";

      // Populate wizard states
      setBusinessData({
        brandName: extracted.brandName,
        domain: extracted.domain,
        businessType: extracted.businessType,
        websiteTitle: extracted.websiteTitle,
        metaDescription: extracted.metaDescription,
        language: extracted.language,
        location: targetLocation,
        locationCode: extracted.locationCode,
        suggestedTopics: extracted.suggestedTopics,
        sitemapUrl: extracted.sitemapUrl,
        competitiveAdvantage: extracted.competitiveAdvantage,
        aboutBusiness: extracted.aboutBusiness,
        targetCustomers: extracted.targetCustomers,
      });

      const mappedCompetitors = (extracted.suggestedCompetitors || []).map((c) => ({
        ...c,
        market: detectMarketFromDomain(c.domain, targetLocation),
      }));

      setCompetitors(mappedCompetitors);
      setKeywords(extracted.suggestedKeywords || []);
      setGeoTopics(extracted.geoTopics || []);

      // Switch to smooth animated progress checklist state
      setIsAnalyzingWebsite(false);
      setIsProgressShowing(true);
    } catch (err) {
      setIsAnalyzingWebsite(false);
      setAnalysisError(err instanceof Error ? err.message : "We couldn't access this website. Please check the URL and try again.");
    }
  }

  /** Step 1 analysis progress finished -> Move to Step 2 */
  function handleProgressComplete() {
    setIsProgressShowing(false);
    setStep(2);
  }

  /** Final Step: Save project & run analysis jobs */
  async function handleStartAnalysis() {
    setSubmitError(null);

    // Validation of required project information
    if (!businessData.domain || !businessData.domain.trim()) {
      setSubmitError("Website URL is required. Please go back to Step 1 to enter your website.");
      return;
    }
    const selectedKw = keywords.filter((k) => k.selected);
    if (selectedKw.length === 0) {
      setSubmitError("Please select at least one search query or topic to analyze in Step 4.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (!user || authErr) {
        throw new Error("Your session has ended. Please sign in again to add your website.");
      }

      let agencyId: string | null = null;
      try {
        const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
        agencyId = (profile?.agency_id as string | undefined) ?? null;
      } catch {
        agencyId = null;
      }

      const brand = businessData.brandName.trim() || businessData.domain || "My Organization";

      // If user profile does not have an agency_id assigned, attempt auto-creation
      if (!agencyId) {
        const wsResult = await createWorkspace(supabase, { name: brand });
        if (wsResult.status === "created" || wsResult.status === "already_set_up") {
          const { data: updatedProfile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
          agencyId = (updatedProfile?.agency_id as string | undefined) ?? null;
        }

        if (!agencyId) {
          // Fallback: check if any existing agency can be linked
          const { data: existingAgency } = await supabase.from("agencies").select("id").limit(1).maybeSingle();
          if (existingAgency?.id) {
            agencyId = existingAgency.id;
            await supabase.from("profiles").update({ agency_id: agencyId }).eq("id", user.id);
          }
        }

        if (!agencyId) {
          throw new Error("We couldn't set up your organization workspace. Please refresh or sign in again.");
        }
      }

      // 1. Create client project
      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .insert({
          name: brand,
          website: businessData.domain,
          brand_name: brand,
          service_type: "seo_geo",
          country: businessData.location || null,
          industry: businessData.businessType || null,
          default_location: businessData.locationCode || "us",
          agency_id: agencyId,
        })
        .select("id")
        .single();

      if (clientErr || !client?.id) {
        throw new Error(
          clientErr?.message?.toLowerCase().includes("limit")
            ? "Your plan's project limit is reached."
            : "We couldn't create the project. Please try again."
        );
      }

      const projectId = client.id as string;

      // 2. Save selected keywords
      if (selectedKw.length > 0) {
        await addSearches(
          projectId,
          selectedKw.map((k) => ({
            keyword: k.keyword,
            trackType: "both",
            location: businessData.locationCode,
          }))
        );
      }

      // 3. Save selected competitors
      const selectedComp = competitors.filter((c) => c.selected).map((c) => c.domain);
      if (selectedComp.length > 0) {
        await addCompetitors(projectId, selectedComp);
      }

      // 4. Select active project context
      await fetch("/api/project/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      // 5. Trigger multi-stage analysis background job
      await fetch("/api/jobs/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: projectId }),
      }).catch(() => null);

      // 6. Move user to the real-time Analysis Process Screen
      router.push(`/dashboard/clients/${projectId}/analysis`);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : "We couldn't set up the project. Please try again.");
    }
  }

  function handleStartModalFinished() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <PageContainer className="max-w-[1020px]">
      {/* Step Stepper Header */}
      <div className="space-y-4">
        <ol className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line pb-4 sm:grid-cols-4" aria-label="Setup steps">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isCurrent = stepNum === step;
            const isPast = stepNum < step;

            return (
              <li key={label} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-caption font-semibold transition-colors",
                    isPast
                      ? "bg-ink text-white"
                      : isCurrent
                      ? "border-2 border-brand text-brand-strong bg-brand-soft"
                      : "border border-line-strong text-ink-3"
                  )}
                >
                  {isPast ? <Check size={14} strokeWidth={2.5} aria-hidden /> : stepNum}
                </span>
                <span className={cn("text-support font-medium", isCurrent ? "text-ink font-semibold" : "text-ink-3")}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {submitError && <Notice tone="critical" title={submitError} />}

      {/* STEP 1 — Website URL & Progress */}
      {step === 1 && (
        <>
          {isProgressShowing ? (
            <AnalysisProgress onComplete={handleProgressComplete} />
          ) : (
            <WebsiteUrlStep
              initialUrl={businessData.domain}
              onAnalyze={handleAnalyzeWebsite}
              isLoading={isAnalyzingWebsite}
              error={analysisError}
            />
          )}
        </>
      )}

      {/* STEP 2 — Business Summary */}
      {step === 2 && (
        <>
          <BusinessSummary
            data={businessData}
            onUpdate={(updated) => setBusinessData((prev) => ({ ...prev, ...updated }))}
          />
          <StepFooter
            currentStep={2}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </>
      )}

      {/* STEP 3 — Competitor Websites */}
      {step === 3 && (
        <>
          <CompetitorSelection
            initialCompetitors={competitors}
            userDomain={businessData.domain}
            defaultMarket={businessData.location || "United States"}
            onChange={(updatedComps) => setCompetitors(updatedComps)}
          />
          <StepFooter
            currentStep={3}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            onSkip={() => setStep(4)}
          />
        </>
      )}

      {/* STEP 4 — Search & SEO Setup */}
      {step === 4 && (
        <>
          <AnalysisSetup
            topics={businessData.suggestedTopics}
            keywords={keywords}
            location={businessData.location}
            locationCode={businessData.locationCode as Location}
            language={businessData.language}
            targetCustomers={businessData.targetCustomers}
            competitors={competitors.filter((c) => c.selected).map((c) => c.domain)}
            sitemapUrl={businessData.sitemapUrl}
            geoTopics={geoTopics}
            onKeywordsChange={(newKw) => setKeywords(newKw)}
            onLocationChange={(code, name) =>
              setBusinessData((prev) => ({ ...prev, locationCode: code, location: name }))
            }
            onLanguageChange={(lang) =>
              setBusinessData((prev) => ({ ...prev, language: lang }))
            }
          />
          <StepFooter
            currentStep={4}
            nextLabel="Start Analysis"
            isSubmitting={isSubmitting}
            onBack={() => setStep(3)}
            onNext={handleStartAnalysis}
          />
        </>
      )}

      {/* Final Analysis Start Progress Modal */}
      <AnalysisStartModal
        isOpen={showStartModal}
        onFinished={handleStartModalFinished}
      />
    </PageContainer>
  );
}
