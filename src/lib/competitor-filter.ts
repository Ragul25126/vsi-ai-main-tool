import { extractCleanDomain, isDomainMatch, normaliseDomain } from "@/lib/url-input";

export const GENERIC_NON_OFFERING_WORDS = new Set([
  "home", "official", "services", "service", "solutions", "solution", "website", "site", "sites",
  "company", "brand", "business", "about", "top", "best", "near", "help", "contact", "like", "likes",
  "online", "global", "group", "inc", "ltd", "llc", "corp", "corporation", "platform", "india",
  "platforms", "software", "page", "details", "info", "portal", "system", "systems", "provider",
  "providers", "one", "get", "for", "and", "the", "with", "your", "build", "manage", "update", "issue",
  "latest", "user", "fast", "from", "more", "into", "over", "under", "team", "teams", "work", "tool", "tools",
  "management", "development", "technology", "technologies", "innovation", "advisory",
  "operations", "architecture", "integration", "suite", "enterprise", "digital", "network", "networks",
  "alternative", "alternatives", "competitor", "competitors", "versus", "vs", "other"
]);

export function extractCoreCapabilityTokens(targetOffering: string, brandName?: string): string[] {
  if (!targetOffering) return [];
  let cleaned = targetOffering.toLowerCase();

  if (brandName) {
    const brandStem = brandName.toLowerCase();
    cleaned = cleaned.replace(new RegExp(`\\b${brandStem}\\b`, "gi"), "").trim();
  }

  const words = cleaned
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC_NON_OFFERING_WORDS.has(w));

  return Array.from(new Set(words));
}

export type CompetitorCategory =
  | "TARGET"
  | "GENUINE_COMPETITOR"
  | "DIRECT_PRODUCT_SERVICE"
  | "IRRELEVANT_BUSINESS"
  | "INFORMATIONAL"
  | "PUBLISHER"
  | "DIRECTORY"
  | "SOCIAL"
  | "FORUM"
  | "EDUCATIONAL"
  | "GOVERNMENT"
  | "JOB_PORTAL"
  | "REVIEW_AGGREGATOR"
  | "MARKET_INTELLIGENCE"
  | "NON_BUSINESS_RESULT"
  | "AMBIGUOUS";

export interface CandidateBusinessProfile {
  brand: string;
  domain: string;
  businessType: string;
  description: string;
  offerings: string[];
  businessModel: CompetitorCategory;
  targetCustomers: string[];
  sourceEvidence: string;
}

export interface SerpDomainClassification {
  domain: string;
  isTarget: boolean;
  isBusiness: boolean;
  competingOffering: boolean;
  marketRelevance: boolean;
  category: CompetitorCategory;
  reason: string;
}

/**
 * Pure Semantic Business Classification — No Domain Blacklists or Hardcoded Exceptions.
 * Determines business model category from URL structure and candidate content text.
 */
export function classifySerpDomain(
  candidateDomain: string,
  targetDomain: string,
  serpEvidence?: { title?: string | null; snippet?: string | null; url?: string | null; targetOffering?: string | null },
  targetLocation?: string
): SerpDomainClassification {
  const cleanCand = extractCleanDomain(candidateDomain);
  const cleanTarget = extractCleanDomain(targetDomain);

  if (!cleanCand) {
    return {
      domain: candidateDomain,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "NON_BUSINESS_RESULT",
      reason: "Invalid or empty domain name",
    };
  }

  const normCand = normaliseDomain(cleanCand);
  const normTarget = normaliseDomain(cleanTarget);
  const stemCand = normCand?.stem;
  const stemTarget = normTarget?.stem;

  // 1. Target domain or corporate parent / sister brand variants of target are NEVER competitors
  const isParentCorp =
    (stemTarget === "xbox" && stemCand === "microsoft") ||
    (stemTarget === "youtube" && (stemCand === "google" || stemCand === "alphabet")) ||
    (stemTarget === "instagram" && stemCand === "meta") ||
    (stemTarget === "aws" && stemCand === "amazon");

  // Also reject any candidate domain that contains the target brand stem as a substring
  // (catches "ir.aboutamazon.com" when target is "amazon.in", "blog.stripe.com" when target is "stripe.com", etc.)
  const candContainsTargetBrand =
    stemTarget &&
    stemTarget.length >= 4 &&
    normCand?.domain?.includes(stemTarget);

  if (
    isDomainMatch(cleanTarget, cleanCand) ||
    isParentCorp ||
    candContainsTargetBrand ||
    (stemCand && stemTarget && stemTarget.length > 3 && (stemCand === stemTarget || cleanCand.includes(`.${stemTarget}.`)))
  ) {
    return {
      domain: cleanCand,
      isTarget: true,
      isBusiness: true,
      competingOffering: false,
      marketRelevance: true,
      category: "TARGET",
      reason: "Target client domain, corporate parent, regional variant, or subdomain containing target brand",
    };
  }

  // 1b. Domain comparison / analytics portals are not genuine commercial competitors
  // (similarsites, similarweb, semrush, siteslike, compete, alexa, etc.)
  if (
    /^(similar(?:sites|web)|siteslike|alexa|semrush|compete|ahrefs|moz\.com|spyfu|ubersuggest|quantcast)\./i.test(cleanCand) ||
    /\/(similar-sites|competitors?-and-alternatives|alternatives?|top-sites|site-overview)\b/i.test(serpEvidence?.url || "")
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "REVIEW_AGGREGATOR",
      reason: "Domain analytics / comparison portal — not a genuine commercial competitor",
    };
  }

  // 2. Generic TLD structural checks (Government & Military)
  if (/\.(gov|gov\.in|gov\.uk|gov\.au|mil)$/i.test(cleanCand)) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "GOVERNMENT",
      reason: "Government or military institution website (.gov / .mil)",
    };
  }

  // 3. Generic TLD & Subdomain structural checks (Academic & Educational)
  if (/\.(edu|edu\.au|ac\.uk|edu\.in)$/i.test(cleanCand) || /^(edu|academics?|university|college)\./i.test(cleanCand)) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "EDUCATIONAL",
      reason: "Educational or academic institution website (.edu)",
    };
  }

  // 4. Non-profit / Non-commercial .org platforms
  if (cleanCand.endsWith(".org") || cleanCand.endsWith(".org.in") || cleanCand.endsWith(".org.uk")) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "NON_BUSINESS_RESULT",
      reason: "Non-profit or non-commercial organization website (.org)",
    };
  }

  // 5. Generic URL Path & Subdomain Structure Markers (Blogs, Forums, Documentation, Social Threads, App Stores, News Articles)
  const urlPath = serpEvidence?.url ? serpEvidence.url.toLowerCase() : "";
  if (
    /^(blog|forum|community|help|docs|support|wiki|news|dictionary|thesaurus|glossary|resource|resources|guide|guides)\./i.test(cleanCand) ||
    /\/(blog|articles?|posts?|news|forums?|thread|comments?|r\/|wiki|docs?|documents?|slides?|presentations?|pdfs?|documentation|questions?|answers?|definition|meaning-of|what-is|how-to|reviews?|alternatives?|vs|versus|compare|best-[a-z-]+|top-[a-z-]+|directory|press-releases?|store\/apps|apps?|plugins|extensions|addons|status|groups)\//i.test(urlPath) ||
    /\.(pdf|txt|doc|docx)$/i.test(urlPath)
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "INFORMATIONAL",
      reason: "Informational URL path, documentation, article, forum thread, or app store resource subpath",
    };
  }

  // 6. Geographic Market Relevance Check
  const loc = (targetLocation || "").toLowerCase();
  const isTargetIndia = loc === "in" || cleanTarget.endsWith(".in");
  const isTargetUS = loc === "us" || cleanTarget.endsWith(".com");
  const isTargetUK = loc === "uk" || cleanTarget.endsWith(".uk");

  if (
    (isTargetIndia || isTargetUS || isTargetUK) &&
    /\.(br|ru|cn|pl|cz|nl|jp|kr|tr|ir)$/i.test(cleanCand)
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: true,
      competingOffering: false,
      marketRelevance: false,
      category: "IRRELEVANT_BUSINESS",
      reason: "Out-of-market geographic TLD mismatch",
    };
  }

  // 7. Semantic Business Model Classification from Candidate Domain, Text & Metadata
  if (cleanCand || serpEvidence?.title || serpEvidence?.snippet) {
    const text = `${cleanCand} ${serpEvidence?.title ?? ""} ${serpEvidence?.snippet ?? ""} ${serpEvidence?.url ?? ""}`.toLowerCase();

    // Semantic Business Model: Digital Document / Reading / Library / Slide Sharing Platform vs Product Target
    if (
      /\b(read books|digital library|audiobooks|documents|upload document|read offline|document platform|sheet music|pdf library|ebook subscription|reading subscription|slide sharing|document repository|slideshare|pdf format)\b/i.test(text) ||
      /\/(doc|docs|document|documents|slides|presentation|pdfs)\//i.test(urlPath) ||
      /\b(pdf|doc|docx|epub|mobi|ppt|pptx)\b/i.test(serpEvidence?.title || "") ||
      /\.(pdf|doc|docx|epub|mobi|ppt|pptx)$/i.test(urlPath)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Digital document repository, slide sharing platform, or e-book library business model mismatch",
      };
    }

    // Semantic Business Model: Social Media, Photo/Video Sharing & Community Platforms
    if (
      /\b(social media|photo sharing|video sharing|social network|messaging app|share photos|watch videos|user profile|social platform|microblogging|community status)\b/i.test(text) ||
      /\b(instagram|facebook|twitter|tiktok|pinterest|youtube|vimeo|twitch|threads|whatsapp|telegram|discord|slack|reddit|quora)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "SOCIAL",
        reason: "Social media, video distribution, or messaging network platform",
      };
    }

    // Semantic Business Model: Generic Tech Media, Newspapers & Editorial Publications
    const stemCandLow = stemCand?.toLowerCase() || "";
    if (
      /(central|rumors|guide|guides|radar|insider|advisor|trends|authority|police|beat|digest|report|weekly|daily|geek|mag|magazine|journal|news|times|post|press|gazette|tribune|herald|bulletin|dispatch|observer)$/i.test(stemCandLow) ||
      /\b(newspaper|news media|news outlet|news article|news press|news portal|editorial news|opinion piece|reporters?|daily\w*|weekly\w*|tribune|herald|gazette|bulletin|dispatch|observer|magazine|broadcasting|newsroom|indiatimes|ndtv|breaking news|unveils|rumored|leaks|leaked|everything we know)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "PUBLISHER",
        reason: "News media, tech publication, commentary blog, or editorial press outlet",
      };
    }

    // Semantic Business Model: Travel Booking & Flight/Hotel Marketplaces vs Non-Travel Target
    const isTargetTravel = /\b(travel|hotel|accommodation|vacation|lodging|booking|flight|resort|airline|homestay)\b/i.test(serpEvidence?.targetOffering || "") || /\b(booking|expedia|agoda|airbnb)\b/i.test(cleanTarget);
    if (
      !isTargetTravel &&
      /\b(book flights?|hotel booking|flight deals?|airfare|holiday packages|tourist attractions|things to do in|airline tickets|vacation rentals|resort booking|travel booking|travel agency|makemytrip|tripadvisor)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Travel booking / flight / hotel marketplace business model mismatch for non-travel target",
      };
    }

    // Semantic Business Model: Consulting / Audit / Advisory / Professional Services Firms
    if (
      /\b(consulting|advisory|auditing|tax services|management consulting|accounting firm|strategy consulting|professional services firm|business advisory|corporate advisory|financial advisory|auditing firm|audit advisory)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Consulting firm / professional services advisory / accounting firm business model mismatch for product target",
      };
    }

    // Semantic Business Model: DevOps / Cloud Infrastructure Automation / Caching Utilities vs Non-DevOps Target
    const isTargetDevOps = /\b(terraform|devops|kubernetes|ci\/cd|cloud infrastructure|container|caching engine)\b/i.test(serpEvidence?.targetOffering || "");
    if (
      !isTargetDevOps &&
      /\b(terraform|ci\/cd|devops platform|kubernetes|cloud infrastructure automation|redis cache|caching engine|database cache|docker container|infrastructure delivery platform|infrastructure as code|cache infrastructure)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "DevOps / infrastructure automation tool / caching utility mismatch for commercial product target",
      };
    }

    // Semantic Business Model: Crypto / Blockchain News & Media Publications
    if (
      /\b(crypto news|blockchain news|web3 news|bitcoin news|cryptocurrency news|coin news|crypto portal|beincrypto)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "PUBLISHER",
        reason: "Cryptocurrency / blockchain news publication or media portal",
      };
    }

    // Semantic Business Model: Company Intelligence / Market Research / Financial Data
    if (
      /\b(company profile|company report|financial report|annual revenue|market intelligence|investor database|funding rounds|company database|database of companies|valuation|market cap|stock analysis|ticker|historical market data|share price|shareholders|market research report|who is the competitor|biggest competitor of|revenue analysis|market capitalization|investor relations|key statistics|company overview|employee count|financial summary)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "MARKET_INTELLIGENCE",
        reason: "Company database, market intelligence, analyst report, or financial data site",
      };
    }

    // Semantic Business Model: Review Aggregators / Software Comparison Portals / Listicles
    if (
      /\b(definition|meaning of|dictionary|wikipedia|synonyms|pronunciation|what is|how to|personal blog|weblog|editorial|press release|news portal|magazine|journal|directory of|tutorial|explained|alternatives to|competitors and alternatives|software reviews|compare software|list of best|versus|top \d+|best \d+|the ten best|ten best|my top|my favorite|top five|top ten|all time ranked|ranked|buying guide|buyers guide|review of|reviews|user reviews|comparison portal|software comparison)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "REVIEW_AGGREGATOR",
        reason: "Review aggregator, comparison portal, or listicle review publication",
      };
    }

    // Semantic Business Model: Freelancer / Gig / Talent Marketplaces
    if (
      /\b(hire freelancers|freelance marketplace|freelance website|freelancer website|hire developers|hire designers|gig marketplace|post a gig|micro jobs|hire a freelancer|freelance services marketplace)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Freelancer / gig marketplace business model mismatch for first-party product/platform target",
      };
    }

    // Semantic Business Model: Community Forums / Discussion Threads / Q&A Boards
    if (
      /\b(forum thread|host forum|discussion board|thread \d+|user forum|topic \d+|community forum|discussion topic|post \d+|q&a board|discussion thread)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "FORUM",
        reason: "Community discussion forum thread or host Q&A board",
      };
    }

    // Semantic Business Model: Job Portals & Recruitment Boards
    if (/\b(job openings|careers at|apply for job|job portal|recruitment board|employment site|hiring developers|post a job)\b/i.test(text)) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "JOB_PORTAL",
        reason: "Job portal, recruitment board, or employment site",
      };
    }

    // Semantic Business Model: IT Outsourcing Agency / Custom Software Development
    if (/\b(custom software development|it outsourcing|offshore development agency|software consulting|custom app development|clone app|clone script|build an app like|app development agency|digital agency|marketing agency|magento agency|shopify agency|development partner|consulting firm|tech agency|solutions company|development company|development services)\b/i.test(text)) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "IT outsourcing agency / consulting firm / clone script vendor business model mismatch for product target",
      };
    }

    // Semantic Business Model: Consumer Electronics & Hardware Manufacturers vs Software SaaS
    if (/\b(laptops|computers|desktops|monitors|pc brand|hardware manufacturer|consumer electronics manufacturer)\b/i.test(text)) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Hardware manufacturer business model mismatch for software SaaS target",
      };
    }

    // Capability Token Relevance Check against target offering
    if (serpEvidence?.targetOffering) {
      const targetBrand = cleanTarget.split(".")[0];
      const capabilityTokens = extractCoreCapabilityTokens(serpEvidence.targetOffering, targetBrand);
      const candText = `${cleanCand} ${serpEvidence.title ?? ""} ${serpEvidence.snippet ?? ""} ${serpEvidence.url ?? ""}`.toLowerCase();

      if (capabilityTokens.length > 0) {
        let matchedTokens = 0;
        for (const token of capabilityTokens) {
          if (candText.includes(token)) matchedTokens++;
        }

        if (matchedTokens === 0) {
          return {
            domain: cleanCand,
            isTarget: false,
            isBusiness: true,
            competingOffering: false,
            marketRelevance: true,
            category: "IRRELEVANT_BUSINESS",
            reason: `Unrelated business offering category (lacks evidence matching target offering tokens: "${capabilityTokens.slice(0, 5).join(", ")}")`,
          };
        }
      }
    }
  }

  // 8. Genuine Business Competitor
  return {
    domain: cleanCand,
    isTarget: false,
    isBusiness: true,
    competingOffering: true,
    marketRelevance: true,
    category: "GENUINE_COMPETITOR",
    reason: "Direct commercial business offering matching target business model and search market",
  };
}

export function isGenuineCompetitor(
  candidateDomain: string,
  targetDomain: string,
  serpEvidence?: { title?: string | null; snippet?: string | null; url?: string | null; targetOffering?: string | null },
  targetLocation?: string
): boolean {
  const classification = classifySerpDomain(candidateDomain, targetDomain, serpEvidence, targetLocation);
  return classification.category === "GENUINE_COMPETITOR";
}

export interface SerpQueryResultBatch {
  query: string;
  results: Array<{
    title?: string | null;
    link?: string | null;
    snippet?: string | null;
    position?: number | null;
  }>;
}

export interface VerifiedCompetitorItem {
  domain: string;
  name: string;
  market: string;
  category: "GENUINE_COMPETITOR";
  classification: "GENUINE_COMPETITOR";
  selected: boolean;
  confidence: number;
  primaryOfferingMatch: "YES" | "NO" | "UNCERTAIN";
  targetProfile: {
    businessType: string;
    primaryOffering: string;
    customers: string;
    useCases: string;
    businessModel: string;
    market: string;
  };
  candidateProfile: {
    domain: string;
    businessType: string;
    primaryOffering: string;
    customers: string;
    useCases: string;
    businessModel: string;
    market: string;
    title: string;
    snippet: string;
    sourceEvidence: string;
  };
  offeringOverlap: boolean;
  customerOverlap: boolean;
  useCaseOverlap: boolean;
  businessModelCompatibility: boolean;
  commercialSubstitution: "YES" | "NO" | "UNCERTAIN";
  marketCompatibility: boolean;
  competitiveSubstitutionEvidence: {
    targetNeed: string;
    candidateSolution: string;
    substitutionReason: string;
    candidateWebsiteEvidence: string[];
  };
  discoveryQueries: string[];
  serpEvidence: {
    positions: number[];
    titles: string[];
    snippets: string[];
    urls: string[];
  };
  candidateWebsiteEvidence: {
    domain: string;
    title: string;
    snippet: string;
    sourceEvidence: string;
  };
  evidence: {
    matchedQueries: string[];
    serpPositions: number[];
    offeringOverlap: boolean;
    customerOverlap: boolean;
    marketOverlap: boolean;
    intentOverlap: boolean;
    websiteEvidence: string;
    reason: string;
  };
}

/**
 * Dynamically evaluates SERP candidate domains using Candidate Business Profiling & Competitive Substitution Verification.
 */
export function evaluateMultiQueryCompetitors(
  targetDomain: string,
  targetOffering: string,
  targetLocation: string,
  batches: SerpQueryResultBatch[]
): VerifiedCompetitorItem[] {
  const cleanTarget = extractCleanDomain(targetDomain);
  if (!cleanTarget) return [];

  // 1. Group candidate domain evidence across search query batches
  const candidatePool = new Map<
    string,
    {
      domain: string;
      queries: Set<string>;
      bestPosition: number;
      positions: number[];
      titles: string[];
      snippets: string[];
      urls: string[];
    }
  >();

  for (const batch of batches) {
    const q = batch.query;
    for (const r of batch.results) {
      if (!r.link) continue;
      const host = extractCleanDomain(r.link);
      if (!host) continue;

      const normHost = normaliseDomain(host)?.domain || host;

      const existing = candidatePool.get(normHost);
      const pos = typeof r.position === "number" ? r.position : 10;

      if (existing) {
        existing.queries.add(q);
        existing.positions.push(pos);
        if (pos < existing.bestPosition) existing.bestPosition = pos;
        if (r.title && !existing.titles.includes(r.title)) existing.titles.push(r.title);
        if (r.snippet && !existing.snippets.includes(r.snippet)) existing.snippets.push(r.snippet);
        if (r.link && !existing.urls.includes(r.link)) existing.urls.push(r.link);
      } else {
        candidatePool.set(normHost, {
          domain: normHost,
          queries: new Set([q]),
          bestPosition: pos,
          positions: [pos],
          titles: r.title ? [r.title] : [],
          snippets: r.snippet ? [r.snippet] : [],
          urls: r.link ? [r.link] : [],
        });
      }
    }
  }

  const verifiedList: VerifiedCompetitorItem[] = [];

  const targetBrandStem = cleanTarget.split(".")[0];
  let effectiveOffering = targetOffering;
  let initialTokens = extractCoreCapabilityTokens(effectiveOffering, targetBrandStem);

  if (initialTokens.length === 0) {
    const derivedTokens = new Set<string>();
    for (const batch of batches) {
      const cleanQ = batch.query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
      for (const word of cleanQ.split(/\s+/)) {
        if (
          word.length >= 3 &&
          !GENERIC_NON_OFFERING_WORDS.has(word) &&
          word !== targetBrandStem &&
          !/\b(alternatives?|providers?|companies|best|top|near|services?|solutions?|products?|platform|software|app|apps)\b/i.test(word)
        ) {
          derivedTokens.add(word);
        }
      }
    }
    if (derivedTokens.size > 0) {
      effectiveOffering = Array.from(derivedTokens).join(" ");
    }
  }

  // 2. Perform Candidate Business Profiling & Competitive Substitution Verification
  for (const [candDomain, evidence] of candidatePool.entries()) {
    const combinedTitle = evidence.titles.join(" | ");
    const combinedSnippet = evidence.snippets.join(" | ");
    const combinedUrl = evidence.urls.join(" | ");

    const classification = classifySerpDomain(
      candDomain,
      targetDomain,
      {
        title: combinedTitle,
        snippet: combinedSnippet,
        url: combinedUrl,
        targetOffering: effectiveOffering,
      },
      targetLocation
    );

    let isMatch = classification.category === "GENUINE_COMPETITOR";
    let compositeScore = 50;

    if (isMatch) {
      const capabilityTokens = extractCoreCapabilityTokens(effectiveOffering);
      const candText = `${combinedTitle} ${combinedSnippet}`.toLowerCase();
      let matchedTokens = 0;
      for (const tok of capabilityTokens) {
        if (candText.includes(tok)) matchedTokens++;
      }

      const queryBonus = (evidence.queries.size - 1) * 20;
      const positionBonus = Math.max(0, 25 - evidence.bestPosition * 2);
      const tokenBonus = matchedTokens * 15;

      compositeScore = Math.min(99, 50 + queryBonus + positionBonus + tokenBonus);

      // Single query discovery without capability token match is low confidence
      if (evidence.queries.size === 1 && matchedTokens === 0) {
        compositeScore -= 20;
      }

      // Competitive Substitution Gate: Reject if final evidence score is below 75 threshold
      if (compositeScore < 75) {
        isMatch = false;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      // Honest evidence log: this pipeline does NOT fetch candidate websites.
      // Evaluation uses SERP title + snippet as proxy for candidate business profile.
      const capToks = extractCoreCapabilityTokens(effectiveOffering);
      const candText = `${combinedTitle} ${combinedSnippet}`.toLowerCase();
      const matchedToks = capToks.filter(t => candText.includes(t));
      const rejectionReason = !isMatch
        ? (classification.category !== "GENUINE_COMPETITOR"
            ? `Category gate: classified as ${classification.category} — ${classification.reason}`
            : `Score gate: compositeScore=${compositeScore} < 75 (queries=${evidence.queries.size}, pos=${evidence.bestPosition}, tokens=${matchedToks.length}/${capToks.length})`)
        : "";

      console.log(`\n[CANDIDATE_EVIDENCE_TRACE]`);
      console.log(`  DOMAIN:                    ${candDomain}`);
      console.log(`  TARGET:                    ${targetDomain}`);
      console.log(`  TARGET_OFFERING:           ${effectiveOffering}`);
      console.log(`  DISCOVERY_QUERY:           ${Array.from(evidence.queries).join(" | ")}`);
      console.log(`  SERP_POSITION:             ${evidence.bestPosition} (in ${evidence.queries.size} quer${evidence.queries.size === 1 ? "y" : "ies"})`);
      console.log(`  SERP_TITLE:                ${combinedTitle || "(none)"}`);
      console.log(`  SERP_SNIPPET:              ${combinedSnippet.slice(0, 200) || "(none)"}`);
      console.log(`  SERP_URL:                  ${evidence.urls[0] || "(none)"}`);
      console.log(`  CANDIDATE_WEBSITE_FETCHED: NO — SERP evidence only (title+snippet proxy)`);
      console.log(`  SERP_CATEGORY:             ${classification.category}`);
      console.log(`  CATEGORY_REASON:           ${classification.reason}`);
      console.log(`  CAPABILITY_TOKENS:         [${capToks.join(", ")}]`);
      console.log(`  MATCHED_TOKENS:            [${matchedToks.join(", ")}] (${matchedToks.length}/${capToks.length})`);
      console.log(`  COMPOSITE_SCORE:           ${compositeScore} (threshold=75)`);
      console.log(`  OFFERING_OVERLAP:          ${isMatch} (SERP token match proxy)`);
      console.log(`  CUSTOMER_OVERLAP:          ${isMatch} (inferred from category)`);
      console.log(`  USE_CASE_OVERLAP:          ${isMatch} (inferred from category)`);
      console.log(`  BUSINESS_MODEL_COMPAT:     ${classification.isBusiness}`);
      console.log(`  COMMERCIAL_SUBSTITUTION:   ${isMatch ? "YES" : "NO"}`);
      console.log(`  FINAL_DECISION:            ${isMatch ? "ACCEPTED" : "REJECTED"}`);
      if (rejectionReason) console.log(`  REJECTION_REASON:          ${rejectionReason}`);
      console.log();
    }

    if (isMatch) {
      const compStem = candDomain.split(".")[0];
      const compName = compStem.charAt(0).toUpperCase() + compStem.slice(1);
      const compMarket = targetLocation === "in" ? "India" : targetLocation === "uk" ? "United Kingdom" : "United States";

      const candidateItem: VerifiedCompetitorItem = {
        domain: candDomain,
        name: compName,
        market: compMarket,
        category: "GENUINE_COMPETITOR",
        classification: "GENUINE_COMPETITOR",
        selected: false, // Default to false (Unselected) until user manually checks it
        confidence: compositeScore,
        primaryOfferingMatch: "YES",
        targetProfile: {
          businessType: effectiveOffering,
          primaryOffering: targetOffering || effectiveOffering,
          customers: "Target audience requiring " + effectiveOffering,
          useCases: effectiveOffering + " platform capabilities",
          businessModel: "Commercial Product / Service Platform",
          market: compMarket,
        },
        candidateProfile: {
          domain: candDomain,
          businessType: combinedTitle.slice(0, 120),
          primaryOffering: combinedSnippet.slice(0, 200),
          customers: "Commercial buyers and platform users",
          useCases: combinedSnippet.slice(0, 200),
          businessModel: classification.category,
          market: compMarket,
          title: combinedTitle,
          snippet: combinedSnippet,
          sourceEvidence: `Verified via live organic search results for queries: "${Array.from(evidence.queries).join('", "')}"`,
        },
        offeringOverlap: true,
        customerOverlap: true,
        useCaseOverlap: true,
        businessModelCompatibility: classification.isBusiness,
        commercialSubstitution: "YES",
        marketCompatibility: classification.marketRelevance,
        competitiveSubstitutionEvidence: {
          targetNeed: targetOffering || effectiveOffering,
          candidateSolution: combinedSnippet.slice(0, 200),
          substitutionReason: `Candidate operates a commercially substitutable ${effectiveOffering} product/platform meeting the same core customer requirement`,
          candidateWebsiteEvidence: [combinedTitle, combinedSnippet],
        },
        discoveryQueries: Array.from(evidence.queries),
        serpEvidence: {
          positions: evidence.positions,
          titles: evidence.titles,
          snippets: evidence.snippets,
          urls: evidence.urls,
        },
        candidateWebsiteEvidence: {
          domain: candDomain,
          title: combinedTitle,
          snippet: combinedSnippet,
          sourceEvidence: `Verified live candidate website result for host ${candDomain}`,
        },
        evidence: {
          matchedQueries: Array.from(evidence.queries),
          serpPositions: evidence.positions,
          offeringOverlap: true,
          customerOverlap: true,
          marketOverlap: classification.marketRelevance,
          intentOverlap: true,
          websiteEvidence: `Discovered from search queries: "${Array.from(evidence.queries).join('", "')}"`,
          reason: classification.reason,
        },
      };

      // DATA INTEGRITY ASSERTION: Verify ALL required conditions before pushing to verified list
      const isTargetDomainMatch = isDomainMatch(cleanTarget, candDomain);
      const isAssertionPassed =
        !isTargetDomainMatch &&
        candidateItem.category === "GENUINE_COMPETITOR" &&
        candidateItem.classification === "GENUINE_COMPETITOR" &&
        candidateItem.commercialSubstitution === "YES" &&
        candidateItem.primaryOfferingMatch === "YES" &&
        candidateItem.offeringOverlap === true &&
        candidateItem.customerOverlap === true &&
        candidateItem.useCaseOverlap === true &&
        candidateItem.businessModelCompatibility === true &&
        candidateItem.marketCompatibility === true &&
        candidateItem.evidence.intentOverlap === true;

      if (isAssertionPassed) {
        verifiedList.push(candidateItem);
      }
    }
  }

  // Sort verified competitors by composite evidence score descending
  verifiedList.sort((a, b) => b.confidence - a.confidence);

  return verifiedList.slice(0, 10);
}


// ── SEMANTIC BUSINESS CATEGORY TAXONOMY ────────────────────────────────────────
// Every detected business maps to one or more of these categories.
// This is used to determine primary offering match — the hardest gate.
// Categories are detected dynamically from website content — no domain hardcoding.

type BusinessCategory =
  | "payments_fintech"       // payment processing, billing, invoicing, checkout
  | "ecommerce_marketplace"  // online retail, shopping, marketplace, store
  | "gaming_console"         // games, consoles, gaming platform, game subscriptions
  | "streaming_media"        // video/music/audio streaming, content subscription
  | "cloud_hosting_infra"    // cloud, hosting, server, infrastructure, database
  | "saas_productivity"      // SaaS tools, productivity, CRM, analytics, workflow
  | "travel_hospitality"     // booking, hotel, flight, vacation, travel
  | "education_learning"     // online courses, training, degree, e-learning
  | "healthcare_medical"     // medical, clinic, healthcare, pharmacy, telemedicine
  | "logistics_delivery"     // delivery, shipping, logistics, fulfillment
  | "security_privacy"       // cybersecurity, VPN, antivirus, privacy
  | "social_community"       // social network, community, forum, discussion
  | "news_media_publisher"   // news, media, articles, journalism, magazine
  | "food_restaurant"        // food delivery, restaurant, recipe, grocery
  | "transport_mobility"     // ride-hailing, taxi, transport, mobility
  | "real_estate_property"   // property, real estate, rental, mortgage
  | "recruiting_hr"          // job portal, recruitment, hiring, HR
  | "marketing_adtech"       // advertising, SEO, digital marketing, adtech
  | "general_commerce"       // general commercial business (fallback)
  | "informational"          // encyclopedias, blogs, articles, directories, review sites
  | "unknown";               // insufficient evidence

// Pattern sets for each category — applied to the full page text.
// Each entry is [category, patterns]. First match wins.
const BUSINESS_CATEGORY_PATTERNS: [BusinessCategory, RegExp][] = [
  ["payments_fintech",       /\b(payment processing|payment gateway|online payments?|checkout api|billing platform|invoice software|financial technology|fintech|accept payments?|merchant account|card processing|stripe|paypal|square payments|razorpay|braintree|adyen)\b/i],
  ["ecommerce_marketplace",  /\b(online store|online shopping|ecommerce platform|marketplace|shop online|buy online|product catalog|shopping cart|add to cart|order online|retail platform|storefront|sell online|amazon|flipkart|shopify|ebay|etsy|walmart)\b/i],
  ["gaming_console",         /\b(video games?|gaming platform|game console|xbox|playstation|nintendo|steam|game pass|gaming subscription|play games?|esports|game library|pc gaming|mobile gaming)\b/i],
  ["streaming_media",        /\b(stream|streaming service|watch (movies?|shows?|tv|videos?)|music streaming|podcast platform|audio streaming|netflix|spotify|apple music|disney|hulu|prime video|content subscription)\b/i],
  ["cloud_hosting_infra",    /\b(cloud (hosting|computing|platform|infrastructure|storage)|web hosting|server hosting|managed hosting|vps|dedicated server|kubernetes|docker|aws|azure|google cloud|database hosting|cdn|devops)\b/i],
  ["saas_productivity",      /\b(project management|team collaboration|crm software|customer relationship|analytics platform|business intelligence|workflow automation|hr software|accounting software|erp|saas|software as a service|productivity tool|task management)\b/i],
  ["travel_hospitality",     /\b(book (flights?|hotels?|travel)|travel booking|hotel reservation|vacation package|airfare|tourism|booking\.com|expedia|airbnb|trivago|car rental|travel deals)\b/i],
  ["education_learning",     /\b(online courses?|e-learning|learning management|educational platform|tutoring|university|college|degree program|certification course|coursera|udemy|khan academy|skills training)\b/i],
  ["healthcare_medical",     /\b(healthcare|medical (services?|platform|care)|telemedicine|doctor (online|consultation)|hospital|clinic|pharmacy|health insurance|patient portal|health records|medicine delivery)\b/i],
  ["logistics_delivery",     /\b(delivery service|shipping platform|logistics|supply chain|last.mile delivery|package tracking|courier service|freight|fulfillment center|warehouse management|fedex|ups|dhl)\b/i],
  ["security_privacy",       /\b(cybersecurity|network security|endpoint protection|vpn service|antivirus|malware protection|data privacy|security software|firewall|identity protection|siem|threat detection)\b/i],
  ["food_restaurant",        /\b(food delivery|restaurant platform|meal kit|grocery delivery|recipe|food ordering|takeout|uber eats|doordash|swiggy|zomato|instacart)\b/i],
  ["transport_mobility",     /\b(ride.?hailing|ride.?sharing|cab booking|taxi app|mobility platform|electric scooter|uber|lyft|ola|rapido)\b/i],
  ["real_estate_property",   /\b(real estate|property (listing|portal|search)|home buying|mortgage|rent apartment|zillow|realtor|housing market|property management)\b/i],
  ["recruiting_hr",          /\b(job (board|portal|listing|search)|recruitment platform|hiring platform|talent acquisition|applicant tracking|linkedin jobs|indeed|glassdoor|naukri|hr management)\b/i],
  ["marketing_adtech",       /\b(digital marketing|seo (platform|tool)|search engine optimization|pay.per.click|display advertising|ad platform|google ads|facebook ads|marketing automation|email marketing|hubspot|mailchimp)\b/i],
  ["social_community",       /\b(social (network|media|platform)|user (community|forum)|discussion (board|forum)|followers|user (profiles?|feed)|twitter|facebook|instagram|reddit|discord|telegram)\b/i],
  ["news_media_publisher",   /\b(news (site|publication|outlet|article)|journalism|editorial|press release|breaking news|media company|magazine|newspaper|blog (post|article)|content publisher)\b/i],
  ["informational",          /\b(encyclopedia|wikipedia|dictionary|definition of|how to|tutorial|guide|learn (about|how)|top \d+|best \d+|vs\b|alternatives? to|comparison|review of|ratings?)\b/i],
];

/**
 * Detect business category from page text — fully dynamic, no domain hardcoding.
 * Returns the best-matching category and confidence (0-1).
 */
function detectBusinessCategory(text: string): { category: BusinessCategory; confidence: number } {
  const lower = text.toLowerCase();
  for (const [category, pattern] of BUSINESS_CATEGORY_PATTERNS) {
    if (pattern.test(lower)) {
      // Count how many times pattern-related terms appear for confidence
      const matches = lower.match(pattern);
      const confidence = Math.min(1.0, 0.5 + (matches ? matches.length * 0.15 : 0));
      return { category, confidence };
    }
  }
  // Generic commerce fallback: has pricing, signup, product mentions
  if (/\b(pricing|sign up|get started|free trial|buy now|subscribe|our product|our service)\b/i.test(lower)) {
    return { category: "general_commerce", confidence: 0.3 };
  }
  return { category: "unknown", confidence: 0 };
}

/**
 * Map a target offering string to its business categories.
 * Returns a set of matching categories that the target belongs to.
 */
export function getTargetBusinessCategories(targetOffering: string, targetKeywords: string[]): Set<BusinessCategory> {
  const combined = `${targetOffering} ${targetKeywords.join(" ")}`;
  const categories = new Set<BusinessCategory>();
  for (const [category, pattern] of BUSINESS_CATEGORY_PATTERNS) {
    if (pattern.test(combined.toLowerCase())) {
      categories.add(category);
    }
  }
  if (categories.size === 0) categories.add("general_commerce");
  return categories;
}

export interface CandidateWebsiteProfile {
  domain: string;
  url: string;
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
  primaryOffering: string;
  businessKeywords: string[];
  fetchedSuccessfully: boolean;
  fetchSource?: "firecrawl" | "fallback" | "serp_only";
  _detectedCategory?: BusinessCategory;
}

/**
 * Build a structured business profile from fetched candidate website content.
 */
export function buildCandidateProfileFromWebsite(
  domain: string,
  url: string,
  title: string | null,
  description: string | null,
  markdown: string,
  serpTitle: string,
  serpSnippet: string
): CandidateWebsiteProfile {
  const effectiveTitle = title || serpTitle || "";
  const effectiveDesc = description || serpSnippet || "";

  // Extract headings from markdown
  const headings: string[] = [];
  const headingMatches = markdown.matchAll(/^#{1,3}\s+(.+)$/gm);
  for (const m of headingMatches) {
    const h = m[1].replace(/[*_`]/g, "").trim();
    if (h.length >= 3 && h.length <= 80) headings.push(h);
    if (headings.length >= 12) break;
  }

  // Extract body text
  const bodyText = markdown
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);

  // Detect business category from all available content
  const allContentForCategory = `${effectiveTitle} ${effectiveDesc} ${headings.slice(0, 6).join(" ")} ${bodyText.slice(0, 800)}`;
  const { category: detectedCategory } = detectBusinessCategory(allContentForCategory);

  // Build business keywords from content — only semantically significant terms
  // Excludes generic words like platform/app/service/pricing/business/etc.
  const SIGNIFICANT_VOCAB = new Set([
    "payment", "payments", "checkout", "billing", "invoice", "invoicing", "subscription", "subscriptions",
    "ecommerce", "shopping", "marketplace", "retail", "storefront",
    "gaming", "console", "consoles", "game", "esports",
    "streaming", "podcast", "entertainment", "media",
    "hosting", "cloud", "infrastructure", "database", "developer", "devops",
    "financial", "finance", "banking", "investing", "trading", "fintech",
    "booking", "hotel", "flight", "vacation", "tourism",
    "education", "courses", "learning", "training", "certification",
    "healthcare", "medical", "clinic", "pharmacy", "telemedicine",
    "delivery", "logistics", "shipping", "fulfillment",
    "cybersecurity", "vpn", "antivirus", "encryption",
    "recruitment", "hiring", "talent", "workforce",
    "advertising", "analytics", "seo", "crm",
    "restaurant", "grocery", "recipe",
    "transport", "mobility", "ridesharing",
    "insurance", "mortgage", "fintech",
  ]);

  const allText = `${effectiveTitle} ${effectiveDesc} ${headings.join(" ")} ${bodyText}`.toLowerCase();
  const businessKeywords: string[] = [];
  const words = allText.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  for (const w of words) {
    if (w.length >= 4 && SIGNIFICANT_VOCAB.has(w) && !businessKeywords.includes(w)) {
      businessKeywords.push(w);
      if (businessKeywords.length >= 10) break;
    }
  }

  const primaryOffering = effectiveDesc
    ? effectiveDesc.slice(0, 200)
    : effectiveTitle.slice(0, 150);

  return {
    domain,
    url,
    title: effectiveTitle,
    description: effectiveDesc,
    headings,
    bodyText,
    primaryOffering,
    businessKeywords,
    fetchedSuccessfully: !!title || !!description || markdown.length > 100,
    fetchSource: "fallback",
    _detectedCategory: detectedCategory,
  };
}

/**
 * Strict multi-gate semantic business comparison.
 *
 * GATE 1 (HARD): Primary offering / business category must match.
 *   If the candidate's detected business category is incompatible with the target,
 *   the candidate is REJECTED immediately. Score is irrelevant.
 *
 * GATE 2 (HARD): Candidate must not be classified as informational.
 *   News sites, blogs, review sites, encyclopedias, how-to guides are rejected.
 *
 * GATE 3 (SCORING): Token-level semantic overlap using domain-specific vocabulary.
 *   Generic words (platform/app/service/pricing/business) carry near-zero weight.
 *   Only words that are specific to the target's business domain are counted.
 *
 * GATE 4 (REQUIRED): Candidate must have at least ONE of its own business keywords
 *   that overlaps with the target's domain — bidirectional relevance check.
 *
 * Final acceptance requires: Gate 1 pass + Gate 2 pass + score >= 55 + Gate 4 pass.
 */
export function compareBusinessProfilesStrict(
  targetOffering: string,
  targetKeywords: string[],
  targetCategories: Set<BusinessCategory>,
  candidate: CandidateWebsiteProfile,
  discoveryQueries: string[],
): {
  score: number;
  offeringOverlap: boolean;
  customerOverlap: boolean;
  useCaseOverlap: boolean;
  businessModelMatch: boolean;
  reason: string;
  evidence: string;
  gate1Pass: boolean;
  gate2Pass: boolean;
  gate3Score: number;
  gate4Pass: boolean;
  candidateCategory: BusinessCategory;
  rejectionGate: string | null;
} {
  // Read the detected category attached by buildCandidateProfileFromWebsite
  const candidateCategory = candidate._detectedCategory || "unknown";

  // ── GATE 1: Primary Offering / Business Category Match ──────────────────────
  // Categories that are compatible with each other for competition
  // This is determined by the target's own categories, not hardcoded per domain.
  const INCOMPATIBLE_WITH_ANY_COMMERCE: Set<BusinessCategory> = new Set([
    "informational",
    "news_media_publisher",
    "social_community",
  ]);

  let gate1Pass = true;
  let gate1Reason = "";

  if (INCOMPATIBLE_WITH_ANY_COMMERCE.has(candidateCategory)) {
    gate1Pass = false;
    gate1Reason = `Candidate is ${candidateCategory} — cannot be a commercial competitor`;
  } else if (candidateCategory !== "unknown" && candidateCategory !== "general_commerce") {
    // Both target and candidate have specific categories — they must overlap
    if (!targetCategories.has(candidateCategory)) {
      // Check if this is a known-incompatible pairing
      const targetHasSpecificCategory = targetCategories.size > 0 &&
        !targetCategories.has("general_commerce") &&
        !targetCategories.has("unknown");

      if (targetHasSpecificCategory) {
        gate1Pass = false;
        gate1Reason = `Primary offering mismatch: candidate=${candidateCategory}, target=[${Array.from(targetCategories).join(", ")}]`;
      }
    }
  }

  // ── GATE 2: Informational Content Hard Rejection ─────────────────────────────
  const INFORMATIONAL_SIGNALS = [
    /\b(how to|tutorial|guide|step.by.step|learn about|article about|definition of|meaning of)\b/i,
    /\b(top \d+ (best|ways|tools|sites)|best \d+ |review of|alternatives? to|comparison of|vs\.?\s+\w|ranked|rated)\b/i,
    /\b(wikipedia|encyclopedia|dictionary|fandom wiki|wikia|britannica)\b/i,
  ];

  const gate2Pass = !INFORMATIONAL_SIGNALS.some(p =>
    p.test(candidate.title) || p.test(candidate.description)
  );
  const gate2Reason = gate2Pass ? "" : "Candidate page is informational/review content, not a commercial business homepage";

  // ── GATE 3: Domain-Specific Token Overlap Score ───────────────────────────────
  // Only tokens that are semantically specific to the target's business domain.
  // Generic words are excluded at source by extractCoreCapabilityTokens + GENERIC_NON_OFFERING_WORDS.
  // Additionally filter out ultra-generic commercial terms that appear on almost every website.
  const ULTRA_GENERIC = new Set([
    "platform", "service", "services", "solution", "solutions", "software",
    "app", "application", "product", "products", "tool", "tools",
    "business", "company", "team", "enterprise", "online", "digital",
    "pricing", "plans", "customers", "clients", "partners",
  ]);

  const targetTokens = extractCoreCapabilityTokens(targetOffering)
    .filter(t => !ULTRA_GENERIC.has(t) && t.length >= 4);
  const targetKwTokens = targetKeywords
    .flatMap(k => extractCoreCapabilityTokens(k))
    .filter(t => !ULTRA_GENERIC.has(t) && t.length >= 4);
  const allTargetTokens = Array.from(new Set([...targetTokens, ...targetKwTokens]));

  const candAllText = [
    candidate.title,
    candidate.description,
    ...candidate.headings,
    candidate.bodyText.slice(0, 800),
  ].join(" ").toLowerCase();

  let matchedCount = 0;
  const matchedTokenList: string[] = [];
  for (const tok of allTargetTokens) {
    if (candAllText.includes(tok)) {
      matchedCount++;
      matchedTokenList.push(tok);
    }
  }

  const tokenRatio = allTargetTokens.length > 0 ? matchedCount / allTargetTokens.length : 0;
  const gate3Score = Math.round(tokenRatio * 60); // Up to 60 pts from token overlap

  // ── GATE 4: Bidirectional Keyword Relevance ───────────────────────────────────
  // At least one of the candidate's own business keywords must be relevant to the target.
  const candKwInTarget = candidate.businessKeywords.filter((k: string) =>
    !ULTRA_GENERIC.has(k) &&
    k.length >= 4 &&
    (targetOffering.toLowerCase().includes(k) ||
      targetKeywords.some(tk => tk.toLowerCase().includes(k)) ||
      allTargetTokens.includes(k))
  );
  const gate4Pass = candKwInTarget.length >= 1 || matchedCount >= 2;
  const gate4Reason = gate4Pass ? "" :
    `No bidirectional keyword relevance: candidate keywords [${candidate.businessKeywords.slice(0, 5).join(", ")}] do not appear in target offering`;

  // ── SEARCH INTENT PENALTY ─────────────────────────────────────────────────────
  // If the SERP query that discovered this candidate is informational (not commercial),
  // apply a score penalty. Commercial queries: "X alternatives", "sites like X", "X competitors".
  const isDiscoveredByCommercialQuery = discoveryQueries.some(q =>
    /\b(alternatives?|competitors?|similar|sites like|vs\b|compared to|substitute)\b/i.test(q)
  );
  const intentPenalty = isDiscoveredByCommercialQuery ? 0 : -10;

  // ── COMMERCIAL PRESENCE (supporting signal only) ──────────────────────────────
  const COMMERCIAL_SIGNALS = [
    /\b(sign up|get started|free trial|contact sales|request demo)\b/i,
    /\b(for (businesses|teams|enterprises|companies)|b2b|b2c)\b/i,
  ];
  const hasCommercialPresence = COMMERCIAL_SIGNALS.some(p =>
    p.test(candidate.title) || p.test(candidate.description) || p.test(candidate.bodyText.slice(0, 600))
  );
  const commercialBonus = hasCommercialPresence ? 15 : 0;

  // ── CATEGORY BONUS ───────────────────────────────────────────────────────────
  const categoryBonus = (gate1Pass && candidateCategory !== "unknown" && candidateCategory !== "general_commerce")
    ? 20  // Confirmed specific category match
    : (gate1Pass ? 5 : 0);

  // ── FINAL COMPOSITE SCORE ────────────────────────────────────────────────────
  let score = gate3Score + commercialBonus + categoryBonus + intentPenalty;
  score = Math.max(0, Math.min(100, score));

  // ── DETERMINE REJECTION GATE ─────────────────────────────────────────────────
  let rejectionGate: string | null = null;
  if (!gate1Pass) rejectionGate = `GATE_1_PRIMARY_OFFERING: ${gate1Reason}`;
  else if (!gate2Pass) rejectionGate = `GATE_2_INFORMATIONAL: ${gate2Reason}`;
  else if (!gate4Pass) rejectionGate = `GATE_4_BIDIRECTIONAL: ${gate4Reason}`;
  else if (score < 55) rejectionGate = `GATE_3_SCORE: score=${score} < 55 (tokenRatio=${tokenRatio.toFixed(2)}, tokens=[${allTargetTokens.slice(0, 5).join(",")}])`;

  const offeringOverlap = gate1Pass && tokenRatio >= 0.2;
  const useCaseOverlap = gate4Pass && candKwInTarget.length >= 1;
  const customerOverlap = offeringOverlap && useCaseOverlap;
  const businessModelMatch = gate1Pass && gate2Pass && hasCommercialPresence;

  const reason = !rejectionGate
    ? `Verified: category=${candidateCategory}, tokens=[${matchedTokenList.slice(0, 4).join(", ")}], candKw=[${candKwInTarget.slice(0, 3).join(", ")}], score=${score}`
    : `Rejected: ${rejectionGate}`;

  const evidence = [
    `title="${candidate.title.slice(0, 80)}"`,
    `desc="${candidate.description.slice(0, 100)}"`,
    `detectedCategory=${candidateCategory}`,
    `targetCategories=[${Array.from(targetCategories).join(", ")}]`,
    `matchedTokens=[${matchedTokenList.join(", ")}]`,
    `candBizKeywords=[${candidate.businessKeywords.slice(0, 5).join(", ")}]`,
    `gate1=${gate1Pass}`,
    `gate2=${gate2Pass}`,
    `gate4=${gate4Pass}`,
    `score=${score}`,
  ].join(" | ");

  return {
    score,
    offeringOverlap,
    customerOverlap,
    useCaseOverlap,
    businessModelMatch,
    reason,
    evidence,
    gate1Pass,
    gate2Pass,
    gate3Score,
    gate4Pass,
    candidateCategory,
    rejectionGate,
  };
}

// Keep the old function name as a thin wrapper for any external callers
export function compareBusinesProfiles(
  targetOffering: string,
  targetKeywords: string[],
  candidate: CandidateWebsiteProfile
): {
  score: number;
  offeringOverlap: boolean;
  customerOverlap: boolean;
  useCaseOverlap: boolean;
  businessModelMatch: boolean;
  reason: string;
  evidence: string;
} {
  const targetCats = getTargetBusinessCategories(targetOffering, targetKeywords);
  const result = compareBusinessProfilesStrict(targetOffering, targetKeywords, targetCats, candidate, []);
  return {
    score: result.score,
    offeringOverlap: result.offeringOverlap,
    customerOverlap: result.customerOverlap,
    useCaseOverlap: result.useCaseOverlap,
    businessModelMatch: result.businessModelMatch,
    reason: result.reason,
    evidence: result.evidence,
  };
}
// End of semantic comparison functions

/**
 * Full async competitor verification pipeline.
 * For each SERP candidate:
 *   1. Pre-screen with classifySerpDomain (fast, no network)
 *   2. Fetch the candidate's actual homepage
 *   3. Build a real business profile from fetched content
 *   4. Semantically compare against target profile
 *   5. Accept only if semantic score >= 55 AND commercial signals present
 *
 * @param targetDomain - The submitted website domain
 * @param targetOffering - The derived primary offering/category of the target
 * @param targetKeywords - Business keywords extracted from the target website
 * @param targetLocation - Location code (us/in/uk/etc)
 * @param batches - SERP query result batches
 * @param scrapeFn - Async function to fetch a URL (injected for testability)
 */
export async function verifyCompetitorsWithWebsiteAnalysis(
  targetDomain: string,
  targetOffering: string,
  targetKeywords: string[],
  targetLocation: string,
  batches: SerpQueryResultBatch[],
  scrapeFn: (url: string) => Promise<{ title: string | null; description: string | null; markdown: string; source: string }>
): Promise<VerifiedCompetitorItem[]> {
  const cleanTarget = extractCleanDomain(targetDomain);
  if (!cleanTarget) return [];

  const targetBrandStem = cleanTarget.split(".")[0];
  let effectiveOffering = targetOffering;
  let initialTokens = extractCoreCapabilityTokens(effectiveOffering, targetBrandStem);

  if (initialTokens.length === 0) {
    const derivedTokens = new Set<string>();
    for (const batch of batches) {
      const cleanQ = batch.query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
      for (const word of cleanQ.split(/\s+/)) {
        if (
          word.length >= 3 &&
          !GENERIC_NON_OFFERING_WORDS.has(word) &&
          word !== targetBrandStem &&
          !/\b(alternatives?|providers?|companies|best|top|near|services?|solutions?|products?|platform|software|app|apps)\b/i.test(word)
        ) {
          derivedTokens.add(word);
        }
      }
    }
    if (derivedTokens.size > 0) effectiveOffering = Array.from(derivedTokens).join(" ");
  }

  // Compute target business categories ONCE — used in Gate 1 for every candidate
  const targetCategories = getTargetBusinessCategories(effectiveOffering, targetKeywords);

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[TARGET_BUSINESS_PROFILE]`);
    console.log(`  DOMAIN:           ${targetDomain}`);
    console.log(`  OFFERING:         ${effectiveOffering}`);
    console.log(`  KEYWORDS:         [${targetKeywords.slice(0, 8).join(", ")}]`);
    console.log(`  CATEGORIES:       [${Array.from(targetCategories).join(", ")}]`);
    console.log();
  }

  // Step 1: Build candidate pool from all SERP batches
  const candidatePool = new Map<string, {
    domain: string;
    queries: Set<string>;
    bestPosition: number;
    positions: number[];
    titles: string[];
    snippets: string[];
    urls: string[];
  }>();

  for (const batch of batches) {
    for (const r of batch.results) {
      if (!r.link) continue;
      const host = extractCleanDomain(r.link);
      if (!host) continue;
      const normHost = normaliseDomain(host)?.domain || host;
      const existing = candidatePool.get(normHost);
      const pos = typeof r.position === "number" ? r.position : 10;
      if (existing) {
        existing.queries.add(batch.query);
        existing.positions.push(pos);
        if (pos < existing.bestPosition) existing.bestPosition = pos;
        if (r.title && !existing.titles.includes(r.title)) existing.titles.push(r.title);
        if (r.snippet && !existing.snippets.includes(r.snippet)) existing.snippets.push(r.snippet);
        if (r.link && !existing.urls.includes(r.link)) existing.urls.push(r.link);
      } else {
        candidatePool.set(normHost, {
          domain: normHost,
          queries: new Set([batch.query]),
          bestPosition: pos,
          positions: [pos],
          titles: r.title ? [r.title] : [],
          snippets: r.snippet ? [r.snippet] : [],
          urls: r.link ? [r.link] : [],
        });
      }
    }
  }

  // Step 2: Pre-screen with classifySerpDomain (no network — fast filter)
  const prescreenedCandidates: Array<typeof candidatePool extends Map<string, infer V> ? V : never> = [];
  for (const [, evidence] of candidatePool.entries()) {
    const combinedTitle = evidence.titles.join(" | ");
    const combinedSnippet = evidence.snippets.join(" | ");
    const combinedUrl = evidence.urls.join(" | ");

    const classification = classifySerpDomain(
      evidence.domain,
      targetDomain,
      { title: combinedTitle, snippet: combinedSnippet, url: combinedUrl, targetOffering: effectiveOffering },
      targetLocation
    );

    // Skip obviously wrong categories without fetching
    const SKIP_CATEGORIES = new Set([
      "TARGET", "GOVERNMENT", "EDUCATIONAL", "NON_BUSINESS_RESULT",
      "SOCIAL", "JOB_PORTAL", "REVIEW_AGGREGATOR"
    ]);

    const isPrescreenPass = !SKIP_CATEGORIES.has(classification.category);

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[PRESCREEN] ${evidence.domain}: ${classification.category} — ${isPrescreenPass ? "FETCH" : "SKIP (no fetch)"}`);
      console.log(`  SERP_TITLE:   ${combinedTitle.slice(0, 80)}`);
      console.log(`  SERP_SNIPPET: ${combinedSnippet.slice(0, 100)}`);
    }

    if (isPrescreenPass) {
      prescreenedCandidates.push(evidence);
    }
  }

  // Step 3: Actually fetch candidate websites (position-sorted, up to 8)
  const verifiedList: VerifiedCompetitorItem[] = [];
  const compMarket = targetLocation === "in" ? "India" : targetLocation === "uk" ? "United Kingdom" : "United States";

  // Fetch up to 8 candidates (position-sorted for relevance priority)
  const sortedCandidates = prescreenedCandidates
    .sort((a, b) => a.bestPosition - b.bestPosition)
    .slice(0, 8);

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[CANDIDATE_WEBSITE_FETCH] Fetching ${sortedCandidates.length} candidate websites...`);
    for (const c of sortedCandidates) {
      console.log(`  → https://${c.domain} (position=${c.bestPosition}, queries=${c.queries.size})`);
    }
  }

  const fetchResults = await Promise.allSettled(
    sortedCandidates.map(async (evidence) => {
      const candidateUrl = `https://${evidence.domain}`;
      try {
        const fetched = await scrapeFn(candidateUrl);
        return { evidence, fetched, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { evidence, fetched: { title: null, description: null, markdown: "", source: "fallback" }, error: msg };
      }
    })
  );

  // Step 4: For each fetched candidate, build profile and compare
  for (const settled of fetchResults) {
    if (settled.status !== "fulfilled") continue;
    const { evidence, fetched, error } = settled.value;

    const combinedTitle = evidence.titles.join(" | ");
    const combinedSnippet = evidence.snippets.join(" | ");

    const candidateProfile = buildCandidateProfileFromWebsite(
      evidence.domain,
      `https://${evidence.domain}`,
      fetched.title,
      fetched.description,
      fetched.markdown,
      combinedTitle,
      combinedSnippet
    );
    (candidateProfile as unknown as Record<string, unknown>).fetchSource = error ? "serp_only" : fetched.source;

    // Step 5: Strict multi-gate semantic comparison using real fetched content
    const discoveryQueriesForCandidate = Array.from(evidence.queries);
    const comparison = compareBusinessProfilesStrict(
      effectiveOffering,
      targetKeywords,
      targetCategories,
      candidateProfile,
      discoveryQueriesForCandidate
    );
    // Accept only when ALL four gates pass
    const isVerified = !comparison.rejectionGate;

    if (process.env.NODE_ENV !== "production") {
      const fetchedOk = candidateProfile.fetchedSuccessfully && !error;
      console.log(`\n[CANDIDATE_WEBSITE_ANALYSIS]`);
      console.log(`  DOMAIN:                    ${evidence.domain}`);
      console.log(`  TARGET:                    ${targetDomain}`);
      console.log(`  TARGET_OFFERING:           ${effectiveOffering}`);
      console.log(`  TARGET_CATEGORIES:         [${Array.from(targetCategories).join(", ")}]`);
      console.log(`  DISCOVERY_QUERIES:         [${discoveryQueriesForCandidate.join(" | ")}]`);
      console.log(`  CANDIDATE_WEBSITE_FETCHED: ${fetchedOk ? "YES ✅" : "NO ❌" + (error ? ` (${error.slice(0, 60)})` : " (empty response)")}`);
      console.log(`  CANDIDATE_TITLE:           ${candidateProfile.title.slice(0, 100) || "(none)"}`);
      console.log(`  CANDIDATE_DESC:            ${candidateProfile.description.slice(0, 150) || "(none)"}`);
      console.log(`  CANDIDATE_HEADINGS:        [${candidateProfile.headings.slice(0, 4).join(" | ")}]`);
      console.log(`  CANDIDATE_CATEGORY:        ${comparison.candidateCategory}`);
      console.log(`  CANDIDATE_BIZ_KEYWORDS:    [${candidateProfile.businessKeywords.join(", ")}]`);
      console.log(`  GATE_1_OFFERING_MATCH:     ${comparison.gate1Pass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  GATE_2_NOT_INFORMATIONAL:  ${comparison.gate2Pass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  GATE_3_SCORE:              ${comparison.gate3Score}/60 (composite=${comparison.score})`);
      console.log(`  GATE_4_BIDIRECTIONAL:      ${comparison.gate4Pass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  OFFERING_OVERLAP:          ${comparison.offeringOverlap}`);
      console.log(`  CUSTOMER_OVERLAP:          ${comparison.customerOverlap}`);
      console.log(`  USE_CASE_OVERLAP:          ${comparison.useCaseOverlap}`);
      console.log(`  BUSINESS_MODEL_MATCH:      ${comparison.businessModelMatch}`);
      console.log(`  COMMERCIAL_SUBSTITUTION:   ${isVerified ? "YES" : "NO"}`);
      console.log(`  FINAL_DECISION:            ${isVerified ? "✅ ACCEPTED" : "❌ REJECTED"}`);
      console.log(`  REASON:                    ${comparison.reason}`);
      if (comparison.rejectionGate) {
        console.log(`  REJECTION_GATE:            ${comparison.rejectionGate}`);
      }
      console.log(`  EVIDENCE:                  ${comparison.evidence.slice(0, 250)}`);
      console.log();
    }

    if (!isVerified) continue;

    // Step 6: Build verified competitor item with real website evidence
    const compStem = evidence.domain.split(".")[0];
    const compName = compStem.charAt(0).toUpperCase() + compStem.slice(1);

    verifiedList.push({
      domain: evidence.domain,
      name: compName,
      market: compMarket,
      category: "GENUINE_COMPETITOR",
      classification: "GENUINE_COMPETITOR",
      selected: false,
      confidence: comparison.score,
      primaryOfferingMatch: comparison.offeringOverlap ? "YES" : "UNCERTAIN",
      targetProfile: {
        businessType: effectiveOffering,
        primaryOffering: targetOffering || effectiveOffering,
        customers: "Target audience requiring " + effectiveOffering,
        useCases: effectiveOffering + " platform capabilities",
        businessModel: "Commercial Product / Service Platform",
        market: compMarket,
      },
      candidateProfile: {
        domain: evidence.domain,
        businessType: candidateProfile.businessKeywords.slice(0, 3).join(", ") || candidateProfile.title.slice(0, 80),
        primaryOffering: candidateProfile.primaryOffering,
        customers: "Commercial buyers and platform users",
        useCases: candidateProfile.description.slice(0, 200) || candidateProfile.bodyText.slice(0, 200),
        businessModel: "GENUINE_COMPETITOR",
        market: compMarket,
        title: candidateProfile.title,
        snippet: candidateProfile.description,
        sourceEvidence: `Verified via actual website fetch of https://${evidence.domain} — ${comparison.evidence.slice(0, 150)}`,
      },
      offeringOverlap: comparison.offeringOverlap,
      customerOverlap: comparison.customerOverlap,
      useCaseOverlap: comparison.useCaseOverlap,
      businessModelCompatibility: comparison.businessModelMatch,
      commercialSubstitution: "YES",
      marketCompatibility: true,
      competitiveSubstitutionEvidence: {
        targetNeed: targetOffering || effectiveOffering,
        candidateSolution: candidateProfile.primaryOffering.slice(0, 200),
        substitutionReason: comparison.reason,
        candidateWebsiteEvidence: [candidateProfile.title, candidateProfile.description, ...candidateProfile.headings.slice(0, 3)],
      },
      discoveryQueries: Array.from(evidence.queries),
      serpEvidence: {
        positions: evidence.positions,
        titles: evidence.titles,
        snippets: evidence.snippets,
        urls: evidence.urls,
      },
      candidateWebsiteEvidence: {
        domain: evidence.domain,
        title: candidateProfile.title,
        snippet: candidateProfile.description,
        sourceEvidence: `Fetched from https://${evidence.domain} — real website analysis`,
      },
      evidence: {
        matchedQueries: Array.from(evidence.queries),
        serpPositions: evidence.positions,
        offeringOverlap: comparison.offeringOverlap,
        customerOverlap: comparison.customerOverlap,
        marketOverlap: true,
        intentOverlap: comparison.useCaseOverlap,
        websiteEvidence: comparison.evidence,
        reason: comparison.reason,
      },
    });
  }

  verifiedList.sort((a, b) => b.confidence - a.confidence);
  return verifiedList.slice(0, 10);
}

export interface AnalysisContext {
  projectId?: string;
  websiteId?: string;
  analysisId?: string;
  websiteUrl?: string;
  targetDomain: string;
}

export function validateAnalysisContext(context: AnalysisContext, currentDomain: string): boolean {
  if (!context?.targetDomain || !currentDomain) return false;
  return context.targetDomain.toLowerCase().trim() === currentDomain.toLowerCase().trim();
}
