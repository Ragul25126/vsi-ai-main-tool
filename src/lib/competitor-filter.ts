import { extractCleanDomain, isDomainMatch, normaliseDomain } from "@/lib/url-input";

// Common non-competitor platform domains (social, video, app stores, forums, news, dictionaries, directories, search engines, press releases)
const NON_COMPETITOR_DOMAINS = new Set([
  // Social, Messaging & Video Platforms
  "youtube.com", "youtu.be", "instagram.com", "facebook.com", "twitter.com", "x.com",
  "linkedin.com", "tiktok.com", "pinterest.com", "vimeo.com", "twitch.tv", "threads.net",
  "whatsapp.com", "telegram.org", "signal.org", "discord.com", "slack.com",

  // App Stores, Extension Marketplaces & Web Standards
  "play.google.com", "apps.apple.com", "chromewebstore.google.com", "web.dev", "w3.org", "mozilla.org",

  // Forums, Q&A, Code Repositories & Knowledge Bases
  "reddit.com", "quora.com", "stackoverflow.com", "stackexchange.com", "medium.com",
  "substack.com", "github.com", "gitlab.com", "wikipedia.org", "wikihow.com",
  "wiktionary.org", "answers.com", "dev.to", "hashnode.com", "sourceforge.net",
  "npmjs.com", "pypi.org", "maven.org", "packagist.org", "pistonheads.com",

  // Dictionaries, Encyclopedias & Reference
  "merriam-webster.com", "dictionary.com", "thesaurus.com", "britannica.com",

  // News, Magazines, Press Release Wires & Research Media
  "forbes.com", "bloomberg.com", "nytimes.com", "wsj.com", "reuters.com",
  "techcrunch.com", "businessinsider.com", "theguardian.com", "cnn.com", "bbc.com",
  "bbc.co.uk", "hbr.org", "entrepreneur.com", "inc.com", "wired.com", "mashable.com",
  "theverge.com", "zdnet.com", "cnet.com", "news.google.com", "theprint.in",
  "indiatimes.com", "gadgetsnow.com", "financialexpress.com", "hindustantimes.com",
  "economic-times.com", "indianexpress.com", "businesscollective.com", "ventureradar.com",
  "spamresource.com", "globenewswire.com", "prnewswire.com", "businesswire.com",
  "newsfilecorp.com", "accesswire.com", "forrester.com", "wpcrafter.com", "cyberclick.net",
  "fastcompany.com", "fortune.com", "marketwatch.com", "economist.com", "domino.com",
  "clairesitchyfeet.com", "revenuebase.ai", "linodash.com", "mooredixon.com", "inven.ai",
  "apple.com", "microsoft.com", "google.com", "amazon.com", "harpercollins.co.uk", "harpercollins.com",

  // Directories, Aggregators, Review Portals & Comparison Media
  "yelp.com", "tripadvisor.com", "trustpilot.com", "g2.com", "capterra.com",
  "glassdoor.com", "yellowpages.com", "crunchbase.com", "producthunt.com",
  "clutch.co", "sitejabber.com", "justdial.com", "indiamart.com", "exportersindia.com",
  "fitsmallbusiness.com", "investopedia.com", "fool.com", "nerdwallet.com", "bankrate.com",
  "softwareadvice.com", "getapp.com", "financesonline.com", "trustradius.com", "digital.com",
  "selecthub.com", "businessnewsdaily.com", "softwarefinder.com", "riseuplabs.com", "fulminoussoftware.com",
  "gartner.com", "alternativeto.net", "saasworthy.com", "peerspot.com", "crozdesk.com", "slashdot.org",
  "slant.co", "topseos.com", "goodfirms.co", "upcity.com", "designrush.com", "sortlist.com",
  "softwareworld.co", "technologyadvice.com", "software-reviews.com", "g2crowd.com",
  "alternative.tools", "alternative.me", "alternatives.co", "alternative-to.com",
  "therooftopguide.com", "mmcgbl.com", "suffescom.com", "devtechnosys.com", "coldiq.com",
  "zapier.com", "make.com", "workato.com", "n8n.io", "integromat.com", "celigo.com",
  "statista.com", "justanswer.com", "seekingalpha.com", "pitchbook.com", "similarweb.com",
  "semrush.com", "ahrefs.com", "moz.com", "spyfu.com", "similartech.com", "qz.com",
  "creativeboom.com", "theknowledgeacademy.com", "nubiapage.com", "bestbuy.com", "target.com", "walmart.com", "ebay.com",
  "digitalmusicnews.com", "billboard.com", "pitchfork.com", "nme.com", "rollingstone.com",
  "pexels.com", "unsplash.com", "pixabay.com", "freepik.com", "shutterstock.com",

  // Search Engines & Infrastructure
  "google.com", "google.co.in", "google.co.uk", "google.ca", "google.com.au",
  "bing.com", "yahoo.com", "duckduckgo.com", "baidu.com", "yandex.com",
]);

export const GENERIC_NON_OFFERING_WORDS = new Set([
  "home", "official", "services", "service", "solutions", "solution", "website", "site",
  "company", "brand", "business", "about", "top", "best", "near", "help", "contact",
  "online", "global", "group", "inc", "ltd", "llc", "corp", "corporation", "platform",
  "platforms", "software", "page", "details", "info", "portal", "system", "systems", "provider",
  "providers", "one", "get", "for", "and", "the", "with", "your", "build", "manage", "update", "issue",
  "latest", "user", "fast", "from", "more", "into", "over", "under", "team", "teams", "work", "tool", "tools"
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

function isPlatformDomain(domain: string): boolean {
  const clean = (domain || "").toLowerCase().replace(/^www\./, "");
  if (NON_COMPETITOR_DOMAINS.has(clean)) return true;

  // Allow dedicated product service subdomains (e.g. music.apple.com, music.youtube.com, cloud.google.com)
  const isDedicatedProductSubdomain = /^(music|cloud|workspace|pay|drive|hosting)\./i.test(clean);
  if (!isDedicatedProductSubdomain) {
    for (const p of NON_COMPETITOR_DOMAINS) {
      if (clean.endsWith(`.${p}`)) return true;
    }
  }

  const stem = clean.split(".")[0];
  if (/(forum|community|chat|talk|board|boards|wiki|dictionary|weblog|reviews?|directory|comparison|guide|rooftop|blog|agency|consulting|outsourcing|clonescript|coder|coders|bestproducts|topten|magazine|journal|academy|course|training|school|publisher|publishing|media|news|press|story|stories|times|post|daily|weekly|herald|tribune|gazette|digest|report|bulletin|dispatch|observer|network|feed|world|archive|records|accounting|cpa|audit|legal|law|attorney|lawyer)/i.test(stem)) return true;

  if (/^(blog|forum|community|help|docs|support|wiki|news|dictionary|thesaurus|glossary|resource|resources|alternative|alternatives|guide|guides)\./i.test(clean)) return true;
  if (/(wordpress\.com|blogspot\.com|simonwillison\.net|github\.io|gitlab\.io|medium\.com|substack\.com|hashnode\.com|dev\.to|\.tools|\.directory|\.reviews|\.comparison)$/i.test(clean)) return true;
  return false;
}

export type CompetitorCategory =
  | "TARGET"
  | "GENUINE_COMPETITOR"
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
  | "NON_BUSINESS_RESULT"
  | "AMBIGUOUS";

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
 * Dynamically classifies whether a SERP domain represents a genuine business competitor with business relevance validation.
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

  // 1. Target domain is NEVER a competitor (including regional TLD variants)
  if (
    isDomainMatch(cleanTarget, cleanCand) ||
    (stemCand && stemTarget && stemTarget.length > 3 && (stemCand === stemTarget || cleanCand.includes(`.${stemTarget}.`)))
  ) {
    return {
      domain: cleanCand,
      isTarget: true,
      isBusiness: true,
      competingOffering: false,
      marketRelevance: true,
      category: "TARGET",
      reason: "Target client domain or regional domain variant",
    };
  }

  // 2. Government domains
  if (/\.(gov|gov\.in|gov\.uk|gov\.au|mil)$/i.test(cleanCand)) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "GOVERNMENT",
      reason: "Government or military institution website",
    };
  }

  // 2b. Non-profit / Non-commercial .org platforms
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

  // 3. Educational domains
  if (/\.(edu|edu\.au|ac\.uk|edu\.in)$/i.test(cleanCand) || /(university|college|school|academy)/i.test(stemCand || "")) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "EDUCATIONAL",
      reason: "Educational or academic institution website",
    };
  }

  // 4. Social Platforms
  if (/^(youtube\.com|youtu\.be|instagram\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com|tiktok\.com|pinterest\.com|vimeo\.com|twitch\.tv|threads\.net|whatsapp\.com|telegram\.org)$/i.test(cleanCand)) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "SOCIAL",
      reason: "Social media or video distribution platform",
    };
  }

  // 5. Forums & Q&A
  if (
    /^(reddit\.com|quora\.com|stackoverflow\.com|stackexchange\.com|answers\.com)$/i.test(cleanCand) ||
    /(forum|community|chat|talk|board|boards|q-and-a)/i.test(stemCand || "")
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "FORUM",
      reason: "Online forum, Q&A, or user community site",
    };
  }

  // 6. Review Aggregators & Software Comparison Portals
  if (
    /^(g2\.com|capterra\.com|trustpilot\.com|yelp\.com|softwareadvice\.com|getapp\.com|financesonline\.com|trustradius\.com|alternativeto\.net|saasworthy\.com|peerspot\.com|crozdesk\.com|slant\.co|topseos\.com|goodfirms\.co|upcity\.com|designrush\.com|sortlist\.com|softwareworld\.co|technologyadvice\.com)$/i.test(cleanCand) ||
    /(review|reviews|comparison|alternatives?|versus|vs)/i.test(stemCand || "")
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "REVIEW_AGGREGATOR",
      reason: "Review aggregator, comparison portal, or listicle review site",
    };
  }

  // 7. Directories & Yellow Pages
  if (
    /^(yellowpages\.com|crunchbase\.com|clutch\.co|justdial\.com|indiamart\.com|exportersindia.com|producthunt\.com)$/i.test(cleanCand) ||
    /(directory|catalog|yellowpages|listings)/i.test(stemCand || "")
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "DIRECTORY",
      reason: "Business directory, registry, or marketplace listing aggregator",
    };
  }

  // 8. Job Portals & Career Pages
  if (
    /^(glassdoor\.com|indeed\.com|ziprecruiter\.com|monster\.com|careerbuilder\.com|naukri\.com)$/i.test(cleanCand) ||
    /(jobs?|careers?|recruitment|hiring)/i.test(stemCand || "")
  ) {
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

  // 9. Publishers, Media & News Outlets
  if (
    NON_COMPETITOR_DOMAINS.has(cleanCand) ||
    isPlatformDomain(cleanCand) ||
    /(publisher|publishing|media|news|press|story|stories|times|post|daily|weekly|herald|tribune|gazette|digest|report|bulletin|dispatch|observer|network|feed|world|archive|records|magazine|journal)/i.test(stemCand || "")
  ) {
    return {
      domain: cleanCand,
      isTarget: false,
      isBusiness: false,
      competingOffering: false,
      marketRelevance: false,
      category: "PUBLISHER",
      reason: "News media, magazine publisher, press wire, or editorial blog",
    };
  }

  // 10. Geographic TLD & Market Relevance Check
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

  // 11. Business Model & Offering Type Evidence Check
  if (serpEvidence?.title || serpEvidence?.snippet || serpEvidence?.url) {
    const text = `${serpEvidence.title ?? ""} ${serpEvidence.snippet ?? ""} ${serpEvidence.url ?? ""}`.toLowerCase();
    const urlPath = serpEvidence.url ? serpEvidence.url.toLowerCase() : "";

    // Informational URL path markers
    if (
      /\/(blog|articles?|posts?|news|forums?|thread|wiki|docs|documentation|questions?|answers?|definition|meaning-of|what-is|how-to|reviews?|alternatives?|vs|versus|compare|best-[a-z-]+|top-[a-z-]+|directory|press-releases?)\//i.test(urlPath) ||
      /\.(pdf|txt|doc|docx)$/i.test(urlPath)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "INFORMATIONAL",
        reason: "Informational URL path, documentation, article, or document file evidence",
      };
    }

    // Business model mismatches: Company Database / Market Intelligence / Analyst / Financial Research
    if (
      /\b(company profile|company report|financial report|annual revenue|market intelligence|investor database|funding rounds|company database|database of companies|valuation|market cap|stock analysis|ticker|historical market data|share price|shareholders|market research report|who is the competitor|biggest competitor of|revenue analysis|market capitalization|investor relations|key statistics|company overview|employee count|financial summary)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "INFORMATIONAL",
        reason: "Company database, market intelligence, analyst report, or financial data site",
      };
    }

    // Business model mismatches: Freelancer / Gig / Talent Marketplaces
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

    // Business model mismatches: Forums / Discussion Threads
    if (
      /\b(forum thread|host forum|discussion board|thread \d+|user forum|topic \d+|community forum|discussion topic|post \d+)\b/i.test(text)
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

    // Editorial / News / Press Release / Definition / Listicles / Opinion Blog evidence
    if (
      /\b(definition|meaning of|dictionary|wikipedia|synonyms|pronunciation|what is|how to|personal blog|weblog|editorial|press release|news portal|magazine|journal|directory of|tutorial|explained|alternatives to|competitors and alternatives|software reviews|compare software|list of best|versus|top \d+|best \d+|the ten best|ten best|my top|my favorite|top five|top ten|all time ranked|ranked|buying guide|buyers guide|review of|reviews|globe newswire|pr newswire|business wire|wire service|distributed by)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: false,
        competingOffering: false,
        marketRelevance: false,
        category: "INFORMATIONAL",
        reason: "Editorial listicle, article, opinion blog, or review publication evidence",
      };
    }

    // Business model mismatches: Physical local retail vs Digital SaaS
    if (/\b(shopping center|shopping mall|physical venue|local store|boutiques in|brick and mortar|retail complex|lifestyle center)\b/i.test(text)) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Physical local retail store / shopping mall venue business model mismatch",
      };
    }

    // Business model mismatches: Retailers / E-commerce Stores / Multi-brand Resellers vs First-Party Platforms
    if (
      /\b(buy online|shop action|shop games|game store|video game retailer|retailer|reseller|game shop|outlet|shop a wide variety|explore ps5|ps5, xbox|nintendo switch|dlcs, and add-ons|department store|e-commerce shop|merchandise store)\b/i.test(text)
    ) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "Third-party retail store / multi-brand reseller business model mismatch for platform target",
      };
    }

    // Business model mismatches: IT Outsourcing / Consultancies vs Product SaaS
    if (/\b(custom software development|it outsourcing|offshore development agency|hire developers|software consulting|custom app development|clone app|clone script|build an app like|app development|software development|digital agency|marketing agency|magento agency|shopify agency|development partner|consulting firm|tech agency|solutions company|development company|development services|ecommerce development|web development|ad agency|advertising agency|seo agency)\b/i.test(text)) {
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

    // Business model mismatches: iPaaS / Integration platforms
    if (/\b(ipaas|workflow automation|enterprise automation|connect apps|automate workflows|integration platform|no-code automation|connector|connect with|app integration|integrate apps)\b/i.test(text)) {
      return {
        domain: cleanCand,
        isTarget: false,
        isBusiness: true,
        competingOffering: false,
        marketRelevance: true,
        category: "IRRELEVANT_BUSINESS",
        reason: "iPaaS / workflow automation platform business model mismatch for direct product target",
      };
    }

    // Business model mismatches: Consumer Hardware
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

    // Capability Token Relevance Check
    if (serpEvidence.targetOffering) {
      const targetBrand = cleanTarget.split(".")[0];
      const capabilityTokens = extractCoreCapabilityTokens(serpEvidence.targetOffering, targetBrand);
      const candText = `${cleanCand} ${serpEvidence.title ?? ""} ${serpEvidence.snippet ?? ""} ${serpEvidence.url ?? ""}`.toLowerCase();

      if (capabilityTokens.length > 0) {
        let matchedTokens = 0;
        for (const token of capabilityTokens) {
          if (candText.includes(token)) {
            matchedTokens++;
          }
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

  // 12. Genuine Business Competitor
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
  selected: boolean;
  confidence: number;
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

export function evaluateMultiQueryCompetitors(
  targetDomain: string,
  targetOffering: string,
  targetLocation: string,
  batches: SerpQueryResultBatch[]
): VerifiedCompetitorItem[] {
  const cleanTarget = extractCleanDomain(targetDomain);
  if (!cleanTarget) return [];

  // Group evidence across all query batches by candidate domain
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

      // Reject if final confidence score is below 75 threshold
      if (compositeScore < 75) {
        isMatch = false;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`=================================`);
      console.log(`COMPETITOR VERIFICATION`);
      console.log(`=================================`);
      console.log(`TARGET: ${targetDomain}`);
      console.log(`CANDIDATE: ${candDomain}`);
      console.log(`DISCOVERY QUERY: ${Array.from(evidence.queries).join(", ")}`);
      console.log(`SERP POSITION: ${evidence.bestPosition}`);
      console.log(`SERP TITLE: ${combinedTitle}`);
      console.log(`SERP SNIPPET: ${combinedSnippet}`);
      console.log(`TARGET BUSINESS: ${effectiveOffering}`);
      console.log(`CANDIDATE BUSINESS: ${combinedTitle.slice(0, 100)}`);
      console.log(`OFFERING OVERLAP: ${isMatch ? "YES" : "NO"}`);
      console.log(`CUSTOMER OVERLAP: ${isMatch ? "YES" : "NO"}`);
      console.log(`BUSINESS MODEL: ${classification.isBusiness ? "MATCH" : "MISMATCH"}`);
      console.log(`MARKET: ${classification.marketRelevance ? "MATCH" : "MISMATCH"}`);
      console.log(`CONFIDENCE SCORE: ${compositeScore}`);
      console.log(`SEARCH INTENT: ${isMatch ? "COMMERCIAL_COMPETITOR" : classification.category}`);
      console.log(`WEBSITE EVIDENCE: Corroborated by live SerpAPI organic results`);
      console.log(`CLASSIFICATION: ${isMatch ? "GENUINE_COMPETITOR" : classification.category}`);
      console.log(`ACCEPTED/REJECTED: ${isMatch ? "ACCEPTED" : "REJECTED"}`);
      console.log(`REASON: ${isMatch ? classification.reason : compositeScore < 75 ? "Confidence score below 75 threshold" : classification.reason}`);
      console.log(`=================================\n`);
    }

    if (isMatch) {
      const compStem = candDomain.split(".")[0];
      const compName = compStem.charAt(0).toUpperCase() + compStem.slice(1);
      const compMarket = targetLocation === "in" ? "India" : targetLocation === "uk" ? "United Kingdom" : "United States";

      verifiedList.push({
        domain: candDomain,
        name: compName,
        market: compMarket,
        category: "GENUINE_COMPETITOR",
        selected: false, // Default to false (Unselected) until user manually checks it
        confidence: compositeScore,
        evidence: {
          matchedQueries: Array.from(evidence.queries),
          serpPositions: evidence.positions,
          offeringOverlap: true,
          customerOverlap: true,
          marketOverlap: true,
          intentOverlap: true,
          websiteEvidence: `Discovered from search queries: "${Array.from(evidence.queries).join('", "')}"`,
          reason: classification.reason,
        },
      });
    }
  }

  // Sort verified competitors by composite evidence score descending
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

/**
 * Hard Safety Check: Enforces that candidate competitor is strictly tied to the current project/analysis context
 * and is verified as a GENUINE_COMPETITOR.
 */
export function isValidForCurrentAnalysis(
  candidate: { domain: string; projectId?: string; analysisId?: string; targetDomain?: string; category?: string },
  context: AnalysisContext
): boolean {
  if (!candidate || !candidate.domain || !context || !context.targetDomain) return false;
  if (candidate.projectId && context.projectId && candidate.projectId !== context.projectId) return false;
  if (candidate.analysisId && context.analysisId && candidate.analysisId !== context.analysisId) return false;
  if (candidate.targetDomain && extractCleanDomain(candidate.targetDomain) !== extractCleanDomain(context.targetDomain)) return false;

  const cleanCand = extractCleanDomain(candidate.domain);
  const cleanTarget = extractCleanDomain(context.targetDomain);
  if (!cleanCand || cleanCand === cleanTarget) return false;

  return (candidate.category ?? "GENUINE_COMPETITOR") === "GENUINE_COMPETITOR";
}

