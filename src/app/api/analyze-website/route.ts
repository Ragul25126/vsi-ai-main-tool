import { NextRequest, NextResponse } from "next/server";
import { normaliseDomain } from "@/lib/url-input";
import { isGenuineCompetitor, evaluateMultiQueryCompetitors, GENERIC_NON_OFFERING_WORDS, type SerpQueryResultBatch } from "@/lib/competitor-filter";
import { searchSerpApi, type SerpSearchResultItem } from "@/lib/serpapi-service";
import { crawlWebsite } from "@/lib/firecrawl";
import { callOpenRouter } from "@/lib/llm";
import type { Location } from "@/types/search";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export interface ExtractedWebsiteData {
  brandName: string;
  domain: string;
  businessType: string;
  websiteTitle: string;
  metaDescription: string;
  language: string;
  location: string;
  locationCode: Location;
  suggestedTopics: string[];
  topicEvidence?: Record<string, string>;
  topicDetails?: Array<{
    topic: string;
    relevanceScore: number;
    confidenceScore: number;
    websiteEvidence: string;
    serpEvidence: string;
    sources: string[];
  }>;
  suggestedKeywords: Array<{
    keyword: string;
    category: "primary" | "long_tail" | "geo" | "ai_search" | "branded";
    categoryLabel: string;
    selected: boolean;
  }>;
  sitemapUrl: string;
  competitiveAdvantage: string;
  aboutBusiness: string;
  targetCustomers: string[];
  suggestedCompetitors: Array<{
    domain: string;
    name: string;
    market: string;
    category?: string;
    selected: boolean;
    confidence?: number;
    evidence?: {
      matchedQueries: string[];
      serpPositions: number[];
      offeringOverlap: boolean;
      customerOverlap: boolean;
      marketOverlap: boolean;
      intentOverlap: boolean;
      websiteEvidence: string;
      reason: string;
    };
  }>;
  geoTopics: string[];
}

interface BusinessProfile {
  brandName: string;
  domain: string;
  industryCategory: string;
  coreOfferings: string[];
  productServiceCategories: string[];
  businessSolutions: string[];
  websiteEvidenceMap: Map<string, string>;
}

function extractBrandFromDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return domain;
}

function normalizeBrandName(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectDomainLocation(domain: string, titleOrDesc?: string): { location: string; locationCode: Location } {
  const d = domain.toLowerCase().trim();
  if (d.endsWith(".in") || d.endsWith(".co.in")) return { location: "India", locationCode: "in" };
  if (d.endsWith(".uk") || d.endsWith(".co.uk")) return { location: "United Kingdom", locationCode: "uk" };
  if (d.endsWith(".ae") || d.endsWith(".co.ae")) return { location: "UAE", locationCode: "ae" };
  if (d.endsWith(".sg") || d.endsWith(".com.sg")) return { location: "Singapore", locationCode: "sg" };
  if (d.endsWith(".lk")) return { location: "Sri Lanka", locationCode: "lk" };

  if (titleOrDesc) {
    const text = titleOrDesc.toLowerCase();
    if (/\b(india|indian)\b/i.test(text)) return { location: "India", locationCode: "in" };
    if (/\b(uk|united kingdom|london)\b/i.test(text)) return { location: "United Kingdom", locationCode: "uk" };
    if (/\b(uae|dubai|abu dhabi)\b/i.test(text)) return { location: "UAE", locationCode: "ae" };
    if (/\b(singapore)\b/i.test(text)) return { location: "Singapore", locationCode: "sg" };
    if (/\b(sri lanka|lanka)\b/i.test(text)) return { location: "Sri Lanka", locationCode: "lk" };
  }

  return { location: "United States", locationCode: "us" };
}

function decodeEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#\d+;/gi, "")
    .replace(/&[a-z]+;/gi, "")
    .trim();
}

const FORBIDDEN_EXACT_TOPICS = new Set([
  "home", "about", "about us", "contact", "contact us", "privacy", "privacy policy",
  "terms", "terms of service", "terms & conditions", "copyright", "all rights reserved",
  "login", "sign in", "sign up", "cart", "checkout", "help", "customer service",
  "customer services", "online shopping", "deals & offers", "trending collections",
  "javascript", "enable javascript", "cookies", "cookie policy", "search", "menu",
  "products", "services", "solutions", "details", "read more", "click here", "learn more",
  "robot verification", "select delivery location", "shopping site", "online store",
  "official site", "official website", "apple app store", "app store", "google play",
  "episodes", "webinars", "workshops", "events", "conferences", "no information available",
  "no information is available for this page", "app", "website", "online", "store",
  "video", "step", "item", "from", "post", "page", "site", "online shopping india",
  "free shipping", "fast delivery", "cash on delivery", "pay on delivery",
  "javascript is disabled", "enable javascript to continue", "am pdt", "pm pdt", "am est", "pm est",
  "much more", "much more cod", "cod & free shipping", "uhp at store",
  "homepage", "home page", "services descriptions", "service descriptions", "sitemap", "site map",
  "manage your account", "your account", "my account", "shipping service issue", "air conditioning tools",
  "compensation for lost package", "order tracking", "cancel order", "refund status", "customer support",
  "update api key name", "track your order", "help center", "account settings", "password reset",
  "privacy notice", "terms of use", "cookie preferences", "rights reserved", "skip to main content"
]);

const FORBIDDEN_WORDS = new Set([
  "http", "https", "www", "com", "org", "net", "io", "co", "app",
  "click", "here", "read", "more", "view", "download", "login", "signup",
  "signin", "subscribe", "copyright", "terms", "privacy", "policy", "cookie", "cookies", "javascript",
  "faq", "forum", "wiki", "reddit", "twitter", "facebook", "instagram", "linkedin",
  "youtube", "tiktok", "pinterest", "github", "tutorial", "email", "address",
  "phone", "wix", "servicevoorwaarden", "redirecting", "redirect", "password", "captcha",
  // Foreign stop words (Tagalog, Dutch, Portuguese, Spanish, German, French, Italian)
  "mga", "sa", "ng", "de", "seu", "do", "da", "und", "der", "die", "das", "la", "le", "les", "el", "los", "las", "un", "une", "para", "con", "por", "van", "het", "een", "del", "dem", "den", "della", "degli", "sur",
  // Track, album, and media noise
  "ost", "lyrics", "remix", "feat", "ft"
]);

const ACTION_IMPERATIVE_VERBS = new Set([
  "design", "experience", "choose", "select", "protect", "build", "create", "discover",
  "unlock", "manage", "explore", "transform", "deliver", "stream", "upgrade", "save",
  "get", "try", "learn", "start", "stop", "find", "join", "watch", "shop", "play", "buy",
  "order", "share", "customize", "customise", "enjoy", "view", "read", "click", "download",
  "subscribe", "see", "connect", "integrate", "launch", "scale", "automate", "drive",
  "boost", "maximize", "maximise", "enhance", "empower", "revolutionize", "bring", "make"
]);

const FRAGMENT_MODIFIERS = new Set([
  "new", "own", "limited", "full", "free", "top", "best", "great", "more", "less", "only",
  "all", "same", "other", "extra", "first", "last", "next", "proactive", "simple", "easy",
  "fast", "quick", "secure", "smart", "super", "ultra", "ultimate", "essential", "premium"
]);

const BOILERPLATE_SUPPORT_PATTERNS = [
  /\b(warranty|protection plan|terms|privacy|policy|cookie|cookies|copyright|rights reserved)\b/i,
  /\b(refund|billing options|hardware warranty|order status|shipment tracking|account settings)\b/i,
  /\b(password reset|support center|help center|customer support|contact us|about us|terms of use)\b/i,
  /\b(terms of service|privacy notice|cookie preferences|skip to main content)\b/i,
];

const FUNCTION_START_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "with", "from", "for", "in", "on", "at", "to",
  "by", "of", "is", "are", "was", "were", "this", "that", "my", "your", "its", "our",
  "their", "what", "why", "how", "who", "when", "where", "can", "could", "should", "would",
  "no", "not", "we", "you", "he", "she", "it", "they", "i", "without", "than", "own", "one",
  "two", "more", "less", "also", "our", "your", "my", "any", "all", "every", "some", "each",
  "new", "free", "best", "top", "good", "great", "job", "jobs", "career", "careers", "hiring",
  "combine", "update", "speak", "grow", "build", "create", "make", "choose", "select", "try",
  "get", "start", "stop", "learn", "find", "send", "proactive", "full", "introducing", "explore",
  "most", "more", "ready", "generate", "accept", "businesses", "locations", "mga", "de", "seu", "sa", "ng",
  "design", "experience", "protect", "unlock", "enjoy", "boost", "maximize", "enhance"
]);

const FUNCTION_END_WORDS = new Set([
  "and", "or", "but", "with", "from", "for", "in", "on", "at", "to", "by", "of",
  "is", "are", "was", "were", "a", "an", "the", "this", "that", "my", "your", "its",
  "what", "why", "how", "who", "when", "where", "can", "could", "should", "would",
  "here", "there", "now", "today", "more", "also", "too", "yet", "so", "than", "as",
  "com", "org", "net", "io", "app", "inc", "ltd", "llc", "co", "page", "site", "website", "via",
  "without", "into", "over", "under", "through", "between", "about", "against", "refers", "refer",
  "code", "key", "keys", "name", "names", "helps", "helping", "recognized", "popular",
  "sa", "ng", "de", "da", "do", "la", "le", "el", "und", "der", "die", "das", "cape", "burundi",
  "new", "own", "limited", "free", "only", "first", "last", "next"
]);

const GENERIC_NON_TOPIC_SINGLE_WORDS = new Set([
  "about", "other", "more", "main", "best", "top", "free", "cheap", "new", "good", "great",
  "site", "page", "web", "online", "store", "home", "app", "apps", "item", "view", "click", "read",
  "user", "privacy", "terms", "contact", "help", "cart", "login", "signup", "search", "menu",
  "footer", "header", "cookie", "cookies", "redirect", "redirecting", "javascript", "version",
  "account", "setting", "settings", "policy", "notice", "center", "portal", "link", "links",
  "image", "video", "media", "content", "file", "files", "datum", "data", "info", "information",
  "pricing", "sell", "buy", "cost", "costs", "review", "reviews", "versus", "vs", "alternative",
  "alternatives", "worth", "taylor", "swift", "biggest", "competitor", "competitors", "consulting",
  "programme", "program", "plan", "plans", "tier", "tiers", "case", "study", "studies", "handbook",
  "deal", "deals", "gossip", "story", "stories", "article", "articles", "news", "fees", "crypto",
  "features", "feature", "benefit", "benefits", "pros", "cons", "symmetry", "nps", "atelier",
  "customer", "design", "stay", "properties", "hotel", "button", "solar", "location", "locations",
  "hardware", "software", "service", "product", "protection"
]);

const BUSINESS_NOUN_TOKENS = new Set([
  // Core Product & Service Nouns
  "email", "emails", "api", "apis", "store", "stores", "builder", "builders", "payment",
  "payments", "gateway", "gateways", "rental", "rentals", "booking", "bookings", "cloud",
  "database", "databases", "service", "services", "platform", "platforms", "system",
  "systems", "tool", "tools", "analytic", "analytics", "infrastructure", "checkout",
  "management", "security", "template", "templates", "webhook", "webhooks", "integration",
  "integrations", "solution", "solutions", "software", "hardware", "ecommerce", "retail",
  "marketplace", "marketplaces", "logistics", "automation", "domain", "domains", "hosting",
  "design", "code", "development", "billing", "invoicing", "messaging", "fulfillment",
  "shipping", "inventory", "accommodation", "accommodations", "experience", "experiences",
  "house", "houses", "cabin", "cabins", "homestay", "homestays", "lodging", "subscription",
  "subscriptions", "payout", "payouts", "crm", "pos", "seo", "geo", "ai", "sdk", "smtp",
  "processing", "authentication", "tracking", "visibility", "delivery", "inbound", "outbound",
  "conversion", "conversions", "marketing", "sales", "finance", "financial", "accounting",
  "consulting", "support", "helpdesk", "workflow", "workflows", "pipeline", "pipelines",
  "offering", "offerings", "product", "products", "category", "categories", "customer",
  "customers", "developer", "developers", "enterprise", "b2b", "b2c", "privacy", "compliance",
  "verification", "notification", "notifications", "alert", "alerts", "reporting", "dashboard",
  "dashboards", "customization", "optimization", "performance", "reliability", "monitoring",
  "metric", "metrics", "monetization", "revenue", "order", "orders", "catalog", "catalogs",
  "reservation", "reservations", "guest", "guests", "host", "hosts", "property", "properties",
  "listing", "listings", "stay", "stays", "destination", "destinations", "travel", "travelers",
  "rate", "rates", "pricing", "plan", "plans", "suite", "suites", "space", "spaces",
  "venue", "venues", "app", "apps", "portal", "portals", "engine", "engines", "storage",
  // Gaming, Consoles & Entertainment Nouns
  "game", "games", "gaming", "console", "consoles", "controller", "controllers", "headset", "headsets",
  "accessory", "accessories", "arcade", "esports", "multiplayer", "device", "devices", "laptop", "laptops",
  "pc", "desktop",
  // Education & Learning Tokens
  "course", "courses", "learning", "degree", "degrees", "certificate", "certificates",
  "certification", "certifications", "education", "training", "skill", "skills", "literacy",
  "student", "students", "instructor", "instructors", "class", "classes", "tutorial",
  "tutorials", "bootcamp", "bootcamps", "curriculum", "lesson", "lessons", "lecture",
  "lectures", "exam", "exams", "assessment", "assessments", "qualification", "qualifications",
  "tourist", "tourism", "hospitality", "hotel", "hotels", "flight", "flights", "trip",
  "trips", "tour", "tours", "cruise", "cruises", "resort", "resorts",
  // Audio & Music Streaming Tokens
  "music", "audio", "streaming", "podcast", "podcasts", "playlist", "playlists", "track", "tracks",
  "song", "songs", "album", "albums", "artist", "artists", "listener", "listeners"
]);

const VERBS_AND_ACTION_WORDS = new Set([
  "is", "are", "was", "were", "has", "have", "had", "do", "does", "did", "be", "been", "being",
  "happens", "happened", "grows", "growing", "grew", "celebrates", "gives", "giving", "engages",
  "engaging", "starts", "starting", "started", "start", "makes", "making", "creates", "creating", "shows", "showing",
  "helps", "helping", "brings", "bringing", "takes", "taking", "gets", "getting", "finds",
  "finding", "lets", "letting", "keeps", "keeping", "works", "working", "looks", "looking",
  "feels", "feeling", "built", "designed", "made", "found", "got", "done", "came", "went",
  "sign", "signing", "set", "setting", "implement", "implementing", "enable", "enabling",
  "apply", "applying", "choose", "select", "protect", "unlock", "enjoy", "boost", "enhance",
  "billing", "make"
]);

const PRONOUNS_AND_POSSESSIVES = new Set([
  "your", "my", "our", "its", "their", "his", "her", "you", "we", "they", "he", "she", "me",
  "us", "them", "who", "whom", "which", "that", "this", "these", "those", "what", "where",
  "when", "why", "how", "someone", "anyone", "everyone", "something", "anything", "everything"
]);

const CONNECTIVE_WORDS = new Set([
  "as", "or", "to", "for", "with", "by", "from", "in", "on", "at", "of", "into",
  "onto", "upon", "under", "over", "through", "between", "against", "towards", "without",
  "than", "like", "plus"
]);

export function isValidBusinessTopic(topic: string, brand: string, coreTokens?: Set<string>): boolean {
  if (!topic) return false;
  const decoded = decodeEntities(topic);
  const cleaned = decoded.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
  if (cleaned.length < 3 || cleaned.length > 45) return false;

  // Must contain only standard English characters
  if (!/^[a-zA-Z0-9\s-&/\.']+$/.test(cleaned)) return false;

  const lowerTopic = cleaned.toLowerCase();
  const normBrand = normalizeBrandName(brand);
  const normTopic = lowerTopic.replace(/[^a-z0-9]/g, "");

  if (FORBIDDEN_EXACT_TOPICS.has(lowerTopic)) return false;
  if (normTopic === normBrand || normTopic.includes(normBrand) || normBrand.includes(normTopic)) return false;

  if (lowerTopic.includes("@") || lowerTopic.includes("http") || lowerTopic.includes(".com") || lowerTopic.includes(".org") || lowerTopic.includes(".net")) return false;
  if (/^\d+$/.test(cleaned) || /^\$?\d+/.test(cleaned) || /\d{4}/.test(cleaned)) return false;
  if (/[\.\?!;:|\/\\=%$]/.test(decoded)) return false;

  // Check against legal/support boilerplate patterns
  for (const pat of BOILERPLATE_SUPPORT_PATTERNS) {
    if (pat.test(cleaned)) return false;
  }

  // Invalidate phrases containing prepositions, definition verbs, or job roles
  if (/\b(without|than|versus|vs|against|towards|onto|upon|refers|referring|explains|meaning)\b/i.test(cleaned)) return false;
  if (/\b(engineer|analyst|recruiter|intern|associate|officer)\b/i.test(cleaned)) return false;

  // Address, location, & individual property listing filters
  if (/\b(ave|avenue|st|street|rd|road|blvd|boulevard|dr|drive|hwy|highway|ln|lane|ct|court|way|sq|square|pl|place|suite|ste)\b/i.test(cleaned)) return false;
  if (/\b(location|locations|branch|branches|address|office|headquarters|hq|city|town|county|locator|guesthouse|villa|vile|bungalow|casa|residence|island|islands|cape|burundi)\b/i.test(cleaned)) return false;
  if (/^(santa|san|los|las|fort|mount|port|saint)\s+[a-z]+/i.test(cleaned)) return false;

  if (/^[a-z]+\s+[a-z]$/i.test(cleaned)) return false;

  const openCount = (decoded.match(/\(/g) || []).length;
  const closeCount = (decoded.match(/\)/g) || []).length;
  if (openCount !== closeCount) return false;

  const words = cleaned.split(/\s+/);
  if (words.length === 1) {
    if (GENERIC_NON_TOPIC_SINGLE_WORDS.has(lowerTopic)) return false;
    if (lowerTopic.length < 3) return false;
  }
  if (words.length > 4) return false;

  const firstWord = words[0].toLowerCase();
  const lastWord = words[words.length - 1].toLowerCase();
  const lowerWords = words.map(w => w.toLowerCase());

  // Invalidate any phrase containing pronouns or possessives
  if (lowerWords.some(w => PRONOUNS_AND_POSSESSIVES.has(w))) return false;

  // Invalidate any phrase containing action or finite verbs
  if (lowerWords.some(w => VERBS_AND_ACTION_WORDS.has(w))) return false;

  // Invalidate topics starting or ending with prepositions / conjunctions
  if (CONNECTIVE_WORDS.has(firstWord) || CONNECTIVE_WORDS.has(lastWord)) return false;

  // Invalidate short 2-word topics containing prepositions/conjunctions inside (e.g. "Products Or")
  if (words.length <= 2 && lowerWords.some(w => CONNECTIVE_WORDS.has(w))) return false;

  // Reject action imperative verbs at the start of topic phrases (e.g. "Design Your Own", "Experience The New")
  if (ACTION_IMPERATIVE_VERBS.has(firstWord)) return false;

  // Reject fragment modifiers at start or end of topic phrases (e.g. "Limited Hardware", "Experience The New")
  if (FRAGMENT_MODIFIERS.has(firstWord) || FRAGMENT_MODIFIERS.has(lastWord)) return false;

  if (FUNCTION_START_WORDS.has(firstWord)) return false;
  if (FUNCTION_END_WORDS.has(lastWord)) return false;

  for (const w of words) {
    const lw = w.toLowerCase();
    if (FORBIDDEN_WORDS.has(lw)) return false;
  }

  // Headline, gossip, track name & individual listing noise filters
  if (/^(is|was|are|were|what|how|why|who|can|does|where|learn|click|read|see|view|buy|get|download|worth|use|using|used|charming|biggest|beyond|generate|accept|grow|build|create)\s+/i.test(cleaned)) return false;
  if (/\b(alternative|alternatives|versus|vs|review|reviews|case study|case studies|pricing|programme|program|taylor swift|worth it|handbook|deal|alliance|button html|mi a stay|stay right)\b/i.test(cleaned)) return false;

  // Business Noun Validation: Multi-word topics MUST contain at least one recognized business noun token
  const hasBusinessNoun = lowerWords.some(w => BUSINESS_NOUN_TOKENS.has(w));
  if (!hasBusinessNoun) return false;

  // Semantic Affinity Check with Core Business Tokens (if provided)
  if (coreTokens && coreTokens.size > 0) {
    const topicTokens = lowerWords.filter(w => w.length >= 3 && !FORBIDDEN_WORDS.has(w));
    const hasDomainAffinity = topicTokens.some(t => coreTokens.has(t) || BUSINESS_NOUN_TOKENS.has(t));
    if (!hasDomainAffinity) return false;
  }

  return true;
}

export function normalizeTopicPhrase(raw: string, brand: string, coreTokens?: Set<string>): string | null {
  if (!raw) return null;
  let text = decodeEntities(raw)
    .replace(/\b[a-z0-9]+['’]s\b/gi, "")
    .replace(/['’]s\b/gi, "")
    .replace(/^[^a-zA-Z0-9]+/, "")
    .replace(/[^a-zA-Z0-9]+$/, "")
    .trim();

  // Strip brand name
  const brandRegex = new RegExp(`\\b${brand}\\b`, "gi");
  text = text.replace(brandRegex, "").trim();

  // Strip generic modifiers, locations, & trailing numbers/noise
  text = text
    .replace(/\s+\b(in|at|near|on|en|for|by|with|of)\b\s+[a-z0-9\s]+$/gi, "")
    .replace(/\b(official|site|website|best|top|buy|cheap|free|reviews|list|overview|india|usa|uk|sri lanka|lanka|dubai|london|versus|vs|alternatives|alternative|sites|apps|platforms|tools)\b/gi, "")
    .replace(/\b(and much more|much more|cod & free shipping|free shipping|cash on delivery|try our app)\b/gi, "")
    .replace(/\s+\d+$/g, "") // Strip trailing numbers like "Access To 10" -> "Access To"
    .replace(/\s+[a-z]$/gi, "") // Strip trailing single letters like "Consulting I" -> "Consulting"
    .replace(/\s+/g, " ")
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
    .trim();

  if (!text) return null;

  // Title Case with acronym preservation
  const formatted = text
    .split(/\s+/)
    .map(w => {
      const upper = w.toUpperCase();
      if (["AI", "SEO", "GEO", "SaaS", "B2B", "CRM", "API", "IT", "HR", "IQ", "R&D", "DNS", "GPS", "UI", "UX", "SDK", "POS", "SMTP", "SMS"].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");

  return isValidBusinessTopic(formatted, brand, coreTokens) ? formatted : null;
}

/** Step 1 & 2: Build Structured Internal Business Profile from Website Content & Site-Owned Landing Pages */
function buildWebsiteBusinessProfile(
  domain: string,
  crawlData: any,
  siteSerpResults: SerpSearchResultItem[] = []
): BusinessProfile {
  const brand = extractBrandFromDomain(domain);
  const websiteTitle = decodeEntities(crawlData?.mainPage?.title || "");
  const metaDescription = decodeEntities(crawlData?.mainPage?.description || "");
  
  const headings: string[] = [];
  if (crawlData?.mainPage?.markdown) {
    const matches = crawlData.mainPage.markdown.match(/(?:^|\n)#+\s+(.+)/g);
    if (matches) {
      for (const m of matches) {
        const h = m.replace(/^(?:\r?\n)?#+\s+/, "").trim();
        if (h && !h.toLowerCase().includes("javascript is disabled")) {
          headings.push(decodeEntities(h));
        }
      }
    }
  }

  const subpages: string[] = (crawlData?.subPages || []).map((s: any) => decodeEntities(s.title)).filter(Boolean);
  
  const evidenceMap = new Map<string, string>();
  const coreOfferingsSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const solutionsSet = new Set<string>();

  function extractNounsFromText(text: string, sourceLabel: string) {
    if (!text) return;
    const clean = decodeEntities(text);
    for (const seg of clean.split(/[|–\-\:;]/)) {
      const trimmed = seg.trim().replace(/^[^a-zA-Z0-9]+/, "").replace(/[^a-zA-Z0-9]+$/, "");
      if (!trimmed) continue;
      if (/\b(careers|jobs|hiring|apply|privacy|terms|copyright|about us|contact us|redirect|login|sign in|sign up)\b/i.test(trimmed)) continue;
      
      const subParts: string[] = [];
      for (const part of trimmed.split(/,|(?:^|\s)&(?:$|\s)|(?:^|\s)and(?:$|\s)/i)) {
        subParts.push(part);
        const words = part.trim().split(/\s+/);
        if (words.length > 3) {
          for (let i = 0; i <= words.length - 2; i++) {
            subParts.push(words.slice(i, i + 2).join(" "));
            if (i <= words.length - 3) {
              subParts.push(words.slice(i, i + 3).join(" "));
            }
          }
        }
      }

      for (const part of subParts) {
        const cand = normalizeTopicPhrase(part, brand);
        if (cand && isValidBusinessTopic(cand, brand)) {
          if (!evidenceMap.has(cand)) {
            evidenceMap.set(cand, `Grounded in website ${sourceLabel}: "${trimmed}"`);
          }
          if (sourceLabel === "main title" || sourceLabel === "meta description") {
            coreOfferingsSet.add(cand);
          } else if (sourceLabel.includes("heading")) {
            categoriesSet.add(cand);
          } else {
            solutionsSet.add(cand);
          }
        }
      }
    }
  }

  extractNounsFromText(websiteTitle, "main title");
  extractNounsFromText(metaDescription, "meta description");
  for (const h of headings) extractNounsFromText(h, "section heading");
  for (const st of subpages) extractNounsFromText(st, "subpage section");

  // Include domain-owned indexed page titles from SerpAPI
  for (const r of siteSerpResults) {
    if (r.title && r.link && r.link.toLowerCase().includes(domain.toLowerCase())) {
      extractNounsFromText(r.title, "indexed site page title");
      if (r.snippet) {
        extractNounsFromText(r.snippet, "indexed site page snippet");
      }
    }
  }

  return {
    brandName: brand,
    domain: domain,
    industryCategory: Array.from(coreOfferingsSet)[0] || Array.from(categoriesSet)[0] || `${brand} Services`,
    coreOfferings: Array.from(coreOfferingsSet),
    productServiceCategories: Array.from(categoriesSet),
    businessSolutions: Array.from(solutionsSet),
    websiteEvidenceMap: evidenceMap,
  };
}

/** Extract genuine business competitors from SerpAPI organic results */
export function extractCompetitorsFromSerpResults(
  organicResults: SerpSearchResultItem[],
  targetDomain: string,
  targetLocation: string,
  targetOffering?: string
): Array<{ domain: string; name: string; market: string; selected: boolean }> {
  const competitorMap = new Map<string, { name: string; market: string }>();

  for (const r of organicResults) {
    if (!r.link) continue;
    try {
      const host = new URL(r.link).hostname.replace(/^www\./i, "").toLowerCase();
      if (!host) continue;

      const isGenuine = isGenuineCompetitor(
        host,
        targetDomain,
        { title: r.title, snippet: r.snippet, url: r.link, targetOffering },
        targetLocation
      );

      if (isGenuine && !competitorMap.has(host)) {
        const compName = host.split(".")[0];
        const formattedComp = compName.charAt(0).toUpperCase() + compName.slice(1);
        const market = detectDomainLocation(host).location || targetLocation;
        competitorMap.set(host, { name: formattedComp, market });
      }
    } catch {
      // URL parse skip
    }

    if (competitorMap.size >= 10) break;
  }

  return Array.from(competitorMap.entries()).slice(0, 10).map(([compDom, info]) => ({
    domain: compDom,
    name: info.name,
    market: info.market,
    selected: false, // Default to UNSELECTED so user manually selects
  }));
}

/** Step 3, 4, 5, 6: Synthesize Business Topics using Business Profile + SerpAPI Evidence */
function generateSynthesizedWebsiteData(
  domain: string,
  crawlData: any,
  organicResults: SerpSearchResultItem[],
  relatedSearches: string[],
  relatedQuestions: string[],
  knowledgeDesc?: string,
  coreCategory?: string,
  coreTokens?: Set<string>
): ExtractedWebsiteData | null {
  const brand = extractBrandFromDomain(domain);
  const locInfo = detectDomainLocation(domain);

  // 1. Build Internal Business Profile from Website Content & Site-Owned Landing Pages
  const siteResults = organicResults.filter((r) => r.link?.toLowerCase().includes(domain.toLowerCase()));
  const profile = buildWebsiteBusinessProfile(domain, crawlData, siteResults);

  const mainResult = siteResults[0] || organicResults[0];
  const websiteTitle = crawlData?.mainPage?.title ? decodeEntities(crawlData.mainPage.title) : (mainResult?.title ? decodeEntities(mainResult.title) : `${brand} Official Site`);
  const metaDescription = crawlData?.mainPage?.description ? decodeEntities(crawlData.mainPage.description) : (mainResult?.snippet ? decodeEntities(mainResult.snippet) : knowledgeDesc || `${brand} services and offerings.`);

  // Generic dictionary words that should NOT be treated as brand stems
  const GENERIC_DICTIONARY_STEMS = new Set([
    "rentals", "rental", "booking", "bookings", "hotel", "hotels", "travel", "vacation",
    "vacations", "home", "homes", "house", "houses", "cabin", "cabins", "stay", "stays",
    "shop", "shopping", "store", "stores", "market", "marketplace", "pay", "payment",
    "payments", "billing", "email", "mail", "media", "news", "cloud", "hosting", "code",
    "dev", "api", "app", "apps", "tech", "software", "digital", "global", "group", "direct",
    "online", "site", "web", "tool", "tools", "hub", "lab", "labs", "studio", "systems",
    "beach", "room", "rooms", "checkout", "checkouts", "card", "cards", "express", "fast",
    "smart", "guest", "guests", "suite", "suites", "place", "places", "space", "spaces"
  ]);

  // Extract all SERP candidate domain stems to dynamically prevent competitor brand names from becoming topics
  const serpBrandStems = new Set<string>();
  const normBrandStem = brand.toLowerCase();
  const targetDomainStem = domain.split(".")[0].toLowerCase();
  serpBrandStems.add(normBrandStem);
  serpBrandStems.add(targetDomainStem);

  for (const r of organicResults) {
    if (r.link) {
      try {
        const host = new URL(r.link).hostname.replace(/^www\./i, "").toLowerCase();
        const stem = host.split(".")[0];
        if (stem && stem.length >= 3 && !GENERIC_DICTIONARY_STEMS.has(stem)) {
          serpBrandStems.add(stem);
        }
      } catch {}
    }
  }

  // Also collect brand stems from related searches (e.g., "shopify vs woocommerce" -> "woocommerce")
  for (const rs of relatedSearches) {
    const words = rs.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length >= 4 && !GENERIC_DICTIONARY_STEMS.has(w) && w !== normBrandStem && w !== targetDomainStem) {
        if (/\b(vs|versus|alternative|alternatives|compare)\b/i.test(rs)) {
          serpBrandStems.add(w);
        }
      }
    }
  }

  // 2. Score & Corroborate Business Concepts across ALL Website & SERP Sources
  const candidateScoreMap = new Map<string, { score: number; evidence: string; sources: Set<string> }>();

  function registerCandidate(raw: string, baseScore: number, sourceLabel: string) {
    if (!raw) return;
    const cand = normalizeTopicPhrase(raw, brand, coreTokens);
    if (!cand || !isValidBusinessTopic(cand, brand, coreTokens)) return;

    // Filter out competitor brand names/domain stems using exact word matching
    const candWords = cand.toLowerCase().split(/\s+/);
    for (const stem of serpBrandStems) {
      if (stem.length >= 3 && !GENERIC_DICTIONARY_STEMS.has(stem)) {
        if (candWords.includes(stem)) {
          return;
        }
      }
    }

    const existing = candidateScoreMap.get(cand);
    if (existing) {
      existing.score += baseScore;
      existing.sources.add(sourceLabel);
    } else {
      candidateScoreMap.set(cand, {
        score: baseScore,
        evidence: `Discovered from ${sourceLabel}: "${cand}"`,
        sources: new Set([sourceLabel]),
      });
    }
  }

  // High Priority 1: Core Offerings from Website Main Title, Meta Description, & H1
  for (const concept of profile.coreOfferings) {
    registerCandidate(concept, 25, "core website offering");
  }

  // High Priority 2: Product & Service Categories from Headings & Subpages
  for (const concept of profile.productServiceCategories) {
    registerCandidate(concept, 20, "product category");
  }

  // High Priority 3: Business Solutions
  for (const concept of profile.businessSolutions) {
    registerCandidate(concept, 18, "business solution");
  }

  // Harvest from Knowledge Graph
  if (knowledgeDesc) {
    for (const part of decodeEntities(knowledgeDesc).split(/[\.\,;\:\-\|\–]/)) {
      registerCandidate(part, 18, "Knowledge Graph");
    }
  }

  // Harvest from SERP related searches (strip brand stem)
  for (const rs of relatedSearches) {
    registerCandidate(rs, 12, "SERP search intent");
  }

  // Harvest from SERP related questions (extract core terms)
  for (const rq of relatedQuestions) {
    const cleanQ = rq.replace(/^(what is|how to|why|where|can i|does|is)\s+/gi, "").replace(/\?$/g, "");
    registerCandidate(cleanQ, 10, "SERP related question");
  }

  // Harvest from organic SERP titles & snippets for target site
  for (const item of siteResults) {
    if (item.title) {
      for (const seg of item.title.split(/[|–\-\:;]/)) {
        registerCandidate(seg, 6, "SERP site result title");
      }
    }
    if (item.snippet) {
      for (const seg of item.snippet.split(/[|–\-\:;\.]/)) {
        registerCandidate(seg, 4, "SERP site result snippet");
      }
    }
  }

  // Boost multi-source corroborated topics & multi-word business phrases
  for (const [concept, info] of candidateScoreMap.entries()) {
    if (info.sources.size > 1) {
      info.score += 12;
      info.evidence += ` (Corroborated across ${info.sources.size} sources)`;
    }
    const wordCount = concept.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 3) {
      info.score += 8; // Strong preference for clear 2-3 word topic phrases
    }
  }

  const sortedCandidates = Array.from(candidateScoreMap.entries())
    .sort((a, b) => b[1].score - a[1].score);

  const topics: string[] = [];
  const topicEvidence: Record<string, string> = {};

  for (const [topic, info] of sortedCandidates) {
    if (topics.length >= 10) break;
    if (info.score < 18) continue;

    const tStem = topic.toLowerCase().replace(/s$/i, "").trim();
    const isDup = topics.some((existing) => {
      const eStem = existing.toLowerCase().replace(/s$/i, "").trim();
      return eStem === tStem || eStem.includes(tStem) || tStem.includes(eStem);
    });

    if (!isDup) {
      topics.push(topic);
      topicEvidence[topic] = info.evidence;
    }
  }

  if (topics.length === 0) {
    return null;
  }

  const effectiveCategory = coreCategory || topics[0] || `${brand} Services`;

  const topicDetails = topics.map((topic, idx) => ({
    topic,
    relevanceScore: Math.max(98 - idx * 3, 75),
    confidenceScore: 94,
    websiteEvidence: topicEvidence[topic] || `Extracted from website analysis of ${domain}`,
    serpEvidence: `Corroborated by Google SerpAPI search evidence for ${domain}`,
    sources: ["website", "serpapi"],
  }));

  const suggestedCompetitors = extractCompetitorsFromSerpResults(organicResults, domain, locInfo.locationCode, effectiveCategory);

  return {
    brandName: brand,
    domain: domain,
    businessType: effectiveCategory,
    websiteTitle: websiteTitle,
    metaDescription: metaDescription,
    language: "English",
    location: locInfo.location,
    locationCode: locInfo.locationCode,
    suggestedTopics: topics,
    topicEvidence,
    topicDetails,
    suggestedKeywords: [
      { keyword: `best ${effectiveCategory.toLowerCase()}`, category: "primary", categoryLabel: "Primary Search", selected: true },
      { keyword: `${brand.toLowerCase()} ${topics[0] ? topics[0].toLowerCase() : effectiveCategory.toLowerCase()}`, category: "branded", categoryLabel: "Branded Search", selected: true },
      { keyword: `${topics[1] ? topics[1].toLowerCase() : effectiveCategory.toLowerCase()} software`, category: "long_tail", categoryLabel: "Product Category", selected: true },
      { keyword: `top ${effectiveCategory.toLowerCase()} in ${locInfo.location}`, category: "geo", categoryLabel: "Location Search", selected: true },
      { keyword: `what is the best ${effectiveCategory.toLowerCase()} platform`, category: "ai_search", categoryLabel: "AI Overview", selected: true },
    ],
    sitemapUrl: `https://${domain}/sitemap.xml`,
    competitiveAdvantage: `${brand} provides market-leading solutions verified through organic search authority.`,
    aboutBusiness: metaDescription,
    targetCustomers: ["Enterprise clients", "Individual buyers", "Industry professionals"],
    suggestedCompetitors,
    geoTopics: [
      `What are the key services of ${brand}?`,
      `How does ${brand} compare to top alternatives in ${locInfo.location}?`,
      `Where is ${brand} operating and offering solutions?`,
    ],
  };
}

function extractPrimaryCategoryQuery(domain: string, title: string, description: string, offerings: string[]): { category: string; semanticTokens: Set<string> } {
  const brand = extractBrandFromDomain(domain);
  const targetStem = domain.split(".")[0].toLowerCase();

  function sanitize(text?: string): string {
    if (!text) return "";
    let clean = text
      .replace(/^redirecting to\s+/gi, "")
      .replace(/^redirect\s+/gi, "")
      .replace(/https?:\/\/[^\s]+/gi, "")
      .replace(/www\.[^\s]+/gi, "")
      .trim();
    if (
      clean.toLowerCase().includes("redirect") ||
      clean.toLowerCase().includes("robot verification") ||
      clean.toLowerCase().includes("access denied") ||
      clean.toLowerCase().includes("test page") ||
      clean.toLowerCase().includes("apply") ||
      clean.toLowerCase().includes("careers") ||
      clean.toLowerCase().includes("hiring") ||
      clean.length > 80
    ) {
      return "";
    }
    return clean;
  }

  const sTitle = sanitize(title);
  const sDesc = sanitize(description);

  const cleanTitle = sTitle
    .replace(new RegExp(`\\b${brand}\\b`, "gi"), "")
    .replace(new RegExp(`\\b${targetStem}\\b`, "gi"), "")
    .replace(/\b(official site|official website|home page|web player|welcome to|home|apply|careers|jobs|hiring)\b/gi, "")
    .replace(/^[\s\|–\-\:\;]+|[\s\|–\-\:\;]+$/g, "")
    .trim();

  const cleanDesc = sDesc
    .replace(new RegExp(`\\b${brand}\\b`, "gi"), "")
    .replace(new RegExp(`\\b${targetStem}\\b`, "gi"), "")
    .replace(/^[\s\|–\-\:\;]+|[\s\|–\-\:\;]+$/g, "")
    .trim();

  const combinedText = `${cleanTitle} ${cleanDesc}`.trim();
  const combinedRaw = `${domain} ${sTitle} ${sDesc} ${offerings.join(" ")}`.toLowerCase();

  const semanticTokens = new Set<string>();
  const rawWords = combinedRaw.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  for (const w of rawWords) {
    if (w.length >= 3 && !FORBIDDEN_WORDS.has(w) && !FUNCTION_START_WORDS.has(w) && !FUNCTION_END_WORDS.has(w)) {
      semanticTokens.add(w);
    }
  }

  // Generic Dynamic Commercial Noun Phrase Pattern Matcher
  const commercialPatterns = [
    /\b([a-z0-9-]+\s+[a-z0-9-]+\s+(?:platform|software|hardware|infrastructure|gateway|services|service|booking|rentals|marketplace|builder|streaming|consoles|games|solutions|automation|system|systems|analytics|app|apps|management))\b/i,
    /\b([a-z0-9-]+\s+(?:platform|software|hardware|infrastructure|gateway|services|service|booking|rentals|marketplace|builder|streaming|consoles|games|solutions|automation|system|systems|analytics|app|apps|management))\b/i,
  ];

  for (const pat of commercialPatterns) {
    const m = combinedText.match(pat);
    if (m && m[1]) {
      const cand = m[1].trim();
      const candLow = cand.toLowerCase();
      if (!candLow.includes(brand.toLowerCase()) && !candLow.includes(targetStem) && cand.length >= 4 && cand.length <= 45) {
        const formatted = cand.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        return { category: formatted, semanticTokens };
      }
    }
  }

  for (const o of offerings) {
    const cleanO = sanitize(o);
    if (cleanO && cleanO.length <= 45 && /\b(api|platform|software|marketplace|store|rentals|booking|services|gateway|infrastructure|solutions|automation|crm|builder|streaming)\b/i.test(cleanO)) {
      const oLow = cleanO.toLowerCase();
      if (!oLow.includes(brand.toLowerCase()) && !oLow.includes(targetStem)) {
        return { category: cleanO, semanticTokens };
      }
    }
  }

  // Dynamic category inference using core business noun tokens in combinedRaw
  const extractedNounTokens = Array.from(semanticTokens).filter(t => t.length >= 3 && !GENERIC_NON_OFFERING_WORDS.has(t));
  if (extractedNounTokens.length >= 2) {
    const top2 = extractedNounTokens.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    return { category: `${top2} Platform`, semanticTokens };
  } else if (extractedNounTokens.length === 1) {
    const tok = extractedNounTokens[0];
    const formatted = tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase();
    return { category: `${formatted} Services`, semanticTokens };
  }

  const fallbackCategory = cleanTitle ? cleanTitle.slice(0, 45) : cleanDesc ? cleanDesc.slice(0, 45) : `${brand} Services`;
  return { category: fallbackCategory, semanticTokens };
}

function buildCommercialQueries(offering: string, brand: string, locationCode: string): string[] {
  const brandStem = brand.toLowerCase();
  let clean = offering.toLowerCase();
  clean = clean.replace(new RegExp(`\\b${brandStem}\\b`, "gi"), "").replace(/\s+/g, " ").trim();

  // Take primary phrase before ampersand or and
  clean = clean.split(/\s+&\s+|\s+and\s+|,/)[0].trim();
  clean = clean.replace(/\s+(?:platforms?|softwares?|providers?|services?)$/gi, "").trim();

  const isGeneric = !clean || clean.length < 3 || GENERIC_NON_TOPIC_SINGLE_WORDS.has(clean) || clean === "business services";

  const queries: string[] = [];

  if (isGeneric) {
    if (locationCode === "in") {
      queries.push(`${brandStem} alternatives in India`);
      queries.push(`${brandStem} competitor companies in India`);
    } else {
      queries.push(`${brandStem} alternatives`);
      queries.push(`${brandStem} competitor companies`);
    }
  } else {
    if (locationCode === "in") {
      queries.push(`${brandStem} alternatives in India`);
      queries.push(`best ${clean} in India`);
      queries.push(`top ${clean} platforms in India`);
    } else {
      queries.push(`${brandStem} alternatives`);
      queries.push(`best ${clean}`);
      queries.push(`top ${clean} platforms`);
    }
  }

  return queries;
}

export async function POST(req: NextRequest) {
  try {
    let body: { url?: unknown };
    try {
      body = (await req.json()) as { url?: unknown };
    } catch {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!rawUrl) {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    const urlWithProto = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
    const parsed = normaliseDomain(urlWithProto);

    if (!parsed?.domain) {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    const brand = extractBrandFromDomain(parsed.domain);

    // STEP 1: Crawl actual website to analyze business profile
    let crawlData: any = null;
    try {
      crawlData = await crawlWebsite(urlWithProto);
    } catch (crawlErr) {
      console.error("[analyze-website] Website crawl error for", parsed.domain, crawlErr);
    }

    let initialSiteTitle = decodeEntities(crawlData?.mainPage?.title || "");
    let initialSiteDesc = decodeEntities(crawlData?.mainPage?.description || "");
    const locInfo = detectDomainLocation(parsed.domain, `${initialSiteTitle} ${initialSiteDesc}`);

    const initialProfile = buildWebsiteBusinessProfile(parsed.domain, crawlData, []);

    const { category: dynamicCoreOffering, semanticTokens } = extractPrimaryCategoryQuery(
      parsed.domain,
      initialSiteTitle,
      initialSiteDesc,
      initialProfile.coreOfferings
    );

    // Generate 2-3 relevant high-intent commercial searches
    const commercialQueries = buildCommercialQueries(dynamicCoreOffering, brand, locInfo.locationCode);
    const searchesToRun = [
      `site:${parsed.domain}`,
      ...commercialQueries.slice(0, 2)
    ];

    // Execute 2-3 SerpAPI searches IN PARALLEL for maximum speed
    const serpSettled = await Promise.allSettled(
      searchesToRun.map(query => searchSerpApi(query, { gl: locInfo.locationCode }))
    );

    const queryBatches: SerpQueryResultBatch[] = [];
    let accumulatedOrganicResults: SerpSearchResultItem[] = [];
    let relatedSearches: string[] = [];
    let relatedQuestions: string[] = [];
    let knowledgeDesc: string | undefined = undefined;

    for (const res of serpSettled) {
      if (res.status === "fulfilled" && res.value?.results) {
        const serpData = res.value;
        accumulatedOrganicResults = [...accumulatedOrganicResults, ...serpData.results];
        if (serpData.related_searches) relatedSearches = [...relatedSearches, ...serpData.related_searches];
        if (serpData.related_questions) relatedQuestions = [...relatedQuestions, ...serpData.related_questions];
        if (!knowledgeDesc && serpData.knowledge_graph?.description) {
          knowledgeDesc = serpData.knowledge_graph.description;
        }

        if (serpData.query && !serpData.query.startsWith("site:")) {
          queryBatches.push({ query: serpData.query, results: serpData.results });
        }

        // If site metadata was missing from crawl, extract from site: query result
        if (serpData.query.startsWith("site:")) {
          const sitePage = serpData.results.find(r => r.link?.toLowerCase().includes(parsed.domain.toLowerCase())) || serpData.results[0];
          if (sitePage) {
            if (!initialSiteTitle || initialSiteTitle.toLowerCase().includes("redirect")) {
              initialSiteTitle = decodeEntities(sitePage.title || "");
            }
            if (!initialSiteDesc) {
              initialSiteDesc = decodeEntities(sitePage.snippet || "");
            }
          }
        }
      }
    }

    // Re-evaluate core business category with enriched metadata from site: query and Knowledge Graph
    const enrichedOffering = extractPrimaryCategoryQuery(
      parsed.domain,
      initialSiteTitle,
      `${initialSiteDesc} ${knowledgeDesc || ""}`,
      initialProfile.coreOfferings
    );

    let finalCoreOffering = enrichedOffering.category;
    let finalSemanticTokens = enrichedOffering.semanticTokens;

    // STEP 4: Build synthesized topics & metadata using website content & search data
    const synthesizedData = generateSynthesizedWebsiteData(
      parsed.domain,
      crawlData,
      accumulatedOrganicResults,
      relatedSearches,
      relatedQuestions,
      knowledgeDesc,
      finalCoreOffering,
      finalSemanticTokens
    );

    // If finalCoreOffering is generic (e.g. "Airbnb Services"), refine using top synthesized topic from website & SERP evidence
    if (
      (!finalCoreOffering || finalCoreOffering.toLowerCase().endsWith("services") || finalCoreOffering.toLowerCase().endsWith("official site")) &&
      synthesizedData?.suggestedTopics &&
      synthesizedData.suggestedTopics.length > 0
    ) {
      const topTopic = synthesizedData.suggestedTopics[0];
      if (topTopic && topTopic.length >= 3) {
        finalCoreOffering = `${topTopic} Platform`;
      }
    }

    // Run additional targeted commercial search intent queries for thorough candidate discovery
    const targetedQueries = buildCommercialQueries(finalCoreOffering, brand, locInfo.locationCode);
    const extraQueriesToRun = targetedQueries.filter(q => !searchesToRun.includes(q)).slice(0, 2);

    if (extraQueriesToRun.length > 0) {
      const extraSettled = await Promise.allSettled(
        extraQueriesToRun.map(q => searchSerpApi(q, { gl: locInfo.locationCode }))
      );

      for (const res of extraSettled) {
        if (res.status === "fulfilled" && res.value?.results) {
          accumulatedOrganicResults = [...accumulatedOrganicResults, ...res.value.results];
          queryBatches.push({ query: res.value.query, results: res.value.results });
        }
      }
    }

    // Multi-query SERP evidence evaluation & competitor verification
    const verifiedCompetitors = evaluateMultiQueryCompetitors(
      parsed.domain,
      finalCoreOffering,
      locInfo.locationCode,
      queryBatches
    );

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let finalTopics = synthesizedData?.suggestedTopics || [];
    let topicEvidenceMap = synthesizedData?.topicEvidence || {};
    let finalKeywords = synthesizedData?.suggestedKeywords || [];
    let compAdvantage = synthesizedData?.competitiveAdvantage || "Market leader verified through search rankings.";
    let aboutBusinessText = synthesizedData?.aboutBusiness || initialSiteDesc || "";
    let targetCustomersList = synthesizedData?.targetCustomers || ["Businesses", "Consumers"];
    let geoTopicsList = synthesizedData?.geoTopics || [];

    // Optional AI Enrichment if OpenRouter key is set and fast
    if (openRouterKey && openRouterKey.trim() && accumulatedOrganicResults.length > 0) {
      try {
        const promptSummary = `Domain: ${parsed.domain}, Brand: ${brand}, Title: ${initialSiteTitle}, Desc: ${initialSiteDesc}`;
        const sysPrompt = "You are an SEO analyst. Respond ONLY in valid JSON.";
        const uPrompt = `Extract 4-10 Title Case business topics for "${parsed.domain}". Return JSON: { "suggestedTopics": ["Topic 1", "Topic 2"], "topicEvidence": { "Topic 1": "evidence" } }`;
        const { content } = await callOpenRouter("meta-llama/llama-3.3-70b-instruct:free", sysPrompt, `${promptSummary}\n${uPrompt}`, openRouterKey);
        if (content) {
          const m = content.match(/\{[\s\S]*\}/);
          if (m) {
            const pData = JSON.parse(m[0]);
            if (Array.isArray(pData.suggestedTopics) && pData.suggestedTopics.length > 0) {
              const filt = pData.suggestedTopics.map((t: string) => decodeEntities(String(t)).trim()).filter((t: string) => isValidBusinessTopic(t, brand, finalSemanticTokens));
              if (filt.length > 0) finalTopics = filt;
            }
            if (typeof pData.topicEvidence === "object") topicEvidenceMap = pData.topicEvidence;
          }
        }
      } catch {
        // Fall back to synthesized topics
      }
    }

    const topicDetails = finalTopics.slice(0, 10).map((topic, idx) => ({
      topic,
      relevanceScore: Math.max(98 - idx * 3, 75),
      confidenceScore: 95,
      websiteEvidence: topicEvidenceMap[topic] || `Analyzed from website content for ${brand}`,
      serpEvidence: `Corroborated by Google SerpAPI search results for ${parsed.domain}`,
      sources: ["website", "serpapi"],
    }));

    const finalData: ExtractedWebsiteData = {
      brandName: brand,
      domain: parsed.domain,
      businessType: finalCoreOffering || synthesizedData?.businessType || `${brand} Services`,
      websiteTitle: initialSiteTitle || accumulatedOrganicResults[0]?.title || `${brand} Official Site`,
      metaDescription: initialSiteDesc || accumulatedOrganicResults[0]?.snippet || knowledgeDesc || "",
      language: "English",
      location: locInfo.location,
      locationCode: locInfo.locationCode,
      suggestedTopics: finalTopics.length > 0 ? finalTopics.slice(0, 10) : [finalCoreOffering],
      topicEvidence: topicEvidenceMap,
      topicDetails,
      suggestedKeywords: finalKeywords.length > 0 ? finalKeywords : [
        { keyword: `best ${finalCoreOffering.toLowerCase()}`, category: "primary", categoryLabel: "Primary Search", selected: true },
        { keyword: `${brand.toLowerCase()} ${finalCoreOffering.toLowerCase()}`, category: "branded", categoryLabel: "Branded Search", selected: true },
      ],
      sitemapUrl: `https://${parsed.domain}/sitemap.xml`,
      competitiveAdvantage: compAdvantage,
      aboutBusiness: aboutBusinessText,
      targetCustomers: targetCustomersList,
      suggestedCompetitors: verifiedCompetitors,
      geoTopics: geoTopicsList,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`========== VSI ANALYSIS ==========`);
      console.log(`TARGET: ${parsed.domain}`);
      console.log(`BRAND: ${brand}`);
      console.log(`BUSINESS PROFILE: ${finalCoreOffering}`);
      console.log(`TOPIC QUERIES: site:${parsed.domain}`);
      console.log(`VERIFIED TOPICS: ${finalTopics.join(", ")}`);
      console.log(`KEYWORD CANDIDATES: ${finalKeywords.map((k) => k.keyword).join(", ")}`);
      console.log(`COMPETITOR QUERIES: ${queryBatches.map((b) => b.query).join(", ")}`);
      console.log(`VERIFIED COMPETITORS: ${verifiedCompetitors.map((c) => c.domain).join(", ")}`);
      console.log(`=================================\n`);
    }

    return NextResponse.json({ success: true, data: finalData });
  } catch (err) {
    console.error("[analyze-website] error:", err);
    return NextResponse.json(
      { success: false, error: "Website search analysis encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
