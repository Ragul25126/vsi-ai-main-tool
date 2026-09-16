"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  BookOpen,
  Sparkles,
  Zap,
  Globe,
  Bot,
  Terminal,
  ShieldCheck,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Send,
  Layers,
  BarChart2,
  TrendingUp,
  Users,
  CheckSquare,
  Sliders,
  Compass,
} from "lucide-react";
import {
  GoogleLogo,
  OpenAILogo,
  GeminiLogo,
  PerplexityLogo,
} from "@/components/ui/ai-logos";

type HelpCategory =
  | "all-features"
  | "ai-visibility"
  | "site-audit"
  | "prompts"
  | "tasks-reports"
  | "glossary"
  | "faqs"
  | "contact";

interface HelpArticle {
  id: string;
  category: HelpCategory;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  content: React.ReactNode;
}

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>("all-features");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>("feat-visibility");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const categories = [
    {
      id: "all-features" as HelpCategory,
      label: "Platform & Features Guide",
      icon: Compass,
      desc: "What each page & tool does",
    },
    {
      id: "ai-visibility" as HelpCategory,
      label: "AI Search & GEO Doubts",
      icon: Sparkles,
      desc: "How ChatGPT, Google & Perplexity work",
    },
    {
      id: "site-audit" as HelpCategory,
      label: "Site Audit & Technical Fixes",
      icon: ShieldCheck,
      desc: "Fixing robots.txt & schema issues",
    },
    {
      id: "prompts" as HelpCategory,
      label: "Prompt Management",
      icon: Terminal,
      desc: "Testing queries & simulation",
    },
    {
      id: "tasks-reports" as HelpCategory,
      label: "Tasks & Client Reports",
      icon: FileText,
      desc: "Action board & exporting strategy PDFs",
    },
    {
      id: "glossary" as HelpCategory,
      label: "Plain-English Glossary",
      icon: BookOpen,
      desc: "Definitions of terms & metrics",
    },
    {
      id: "faqs" as HelpCategory,
      label: "Frequently Asked Questions",
      icon: HelpCircle,
      desc: "Common doubts & instant answers",
    },
    {
      id: "contact" as HelpCategory,
      label: "Contact Support",
      icon: MessageSquare,
      desc: "Ask our engineering team",
    },
  ];

  const articles: HelpArticle[] = [
    // Feature Guides
    {
      id: "feat-visibility",
      category: "all-features",
      title: "Where Your Brand Appears (AI Visibility View)",
      subtitle: "Understand how your website is ranked on Google Search vs AI assistants",
      icon: BarChart2,
      badge: "Core Feature",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            This page provides a unified summary of how your brand shows up when people search on Google or ask AI engines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border space-y-1">
              <span className="font-bold text-slate-900 dark:text-foreground">Direct AI Citations</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                When an AI model (like ChatGPT, Gemini, or Perplexity) generates an answer and links directly to your website as a clickable source link.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border space-y-1">
              <span className="font-bold text-slate-900 dark:text-foreground">Organic SERP Rank</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                Your standard numerical ranking on traditional Google search results for target keywords (e.g. Position #1 or #3).
              </p>
            </div>
          </div>
          <p className="pt-1">
            <strong>How to use this page:</strong> Filter by keyword or status (Winning, Opportunity, Missing) to see where you need to publish content or add structured schema.
          </p>
        </div>
      ),
    },
    {
      id: "feat-audit",
      category: "all-features",
      title: "Site Audit & AI Bot Diagnostics",
      subtitle: "Find out if AI search crawlers can read and index your pages",
      icon: ShieldCheck,
      badge: "Technical",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            Traditional search bots (Googlebot) read HTML. Modern AI search bots (like <code>GPTBot</code>, <code>PerplexityBot</code>, and <code>ClaudeBot</code>) require permission in your <code>robots.txt</code> file and clean structured data to cite you.
          </p>
          <div className="bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 p-3.5 rounded-2xl space-y-1 text-orange-950 dark:text-orange-200">
            <p className="font-bold">Common Doubt: &quot;Why is my AI audit score low?&quot;</p>
            <p className="text-[11px] text-orange-800 dark:text-orange-300">
              The most common reason is a wildcard <code>Disallow: /</code> in your robots.txt file blocking AI user-agents, or missing JSON-LD Organization and FAQ schema.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "feat-next-actions",
      category: "all-features",
      title: "Next Actions & Citation Opportunities",
      subtitle: "Prioritized recommendations to win citations from competitors",
      icon: Zap,
      badge: "Strategy",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            The Next Actions engine analyzes search gaps where competitors are being cited by AI models instead of your brand, and calculates the easiest fixes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
            <li><strong>Add Comparison Tables:</strong> AI models love clear Markdown/HTML comparison tables for &quot;best vs&quot; queries.</li>
            <li><strong>Publish Structured FAQs:</strong> Direct Q&amp;A format is the #1 format extracted by Google AI Overviews.</li>
            <li><strong>Claim Directory Citations:</strong> AI models look up trusted aggregators (G2, Trustpilot, Crunchbase, Wikipedia).</li>
          </ul>
        </div>
      ),
    },
    {
      id: "feat-prompts",
      category: "all-features",
      title: "AI Prompt Management",
      subtitle: "Test what ChatGPT, Gemini, and Perplexity say about your brand",
      icon: Terminal,
      badge: "Testing",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            Instead of manually typing queries into multiple AI tools, VSI lets you evaluate prompts across all major LLM engines in 3 steps:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-[11.5px]">
            <li>Select an AI model (Google AIO, ChatGPT, Gemini, Perplexity).</li>
            <li>Enter your target search phrase (e.g. <em>best saas platform</em>) and website domain.</li>
            <li>Click <strong>Run Test Prompt</strong> to simulate the live answer and see if your website link appears in citations.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "feat-tasks",
      category: "all-features",
      title: "Tasks & Action Board",
      subtitle: "Track SEO and GEO optimization tickets from idea to execution",
      icon: CheckSquare,
      badge: "Workflow",
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            The Action Board is a Kanban workspace designed for SEO strategists and developers. You can convert diagnostic audit findings directly into actionable tasks, assign them to team members, and track status (To Do, In Progress, Completed).
          </p>
        </div>
      ),
    },

    // AI Visibility & GEO Doubts
    {
      id: "geo-citation-vs-mention",
      category: "ai-visibility",
      title: "What is the difference between an AI Citation and an AI Mention?",
      subtitle: "Understanding how AI models reference your brand",
      icon: Sparkles,
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            <strong>AI Mention:</strong> When an AI writes your brand name in text (e.g. &quot;ValGrow Labs is a popular search intelligence tool&quot;) but does <em>not</em> provide a clickable link.
          </p>
          <p>
            <strong>Direct AI Citation:</strong> When the AI model provides a live, clickable source link directly to your website URL at the top or bottom of its response. Citations drive high-intent referral traffic and establish domain authority.
          </p>
        </div>
      ),
    },
    {
      id: "geo-how-llms-choose",
      category: "ai-visibility",
      title: "How do LLMs (ChatGPT, Gemini, Perplexity) choose who to recommend?",
      subtitle: "The mechanics of AI Search Retrieval-Augmented Generation (RAG)",
      icon: Bot,
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            When a user asks a question, modern AI models do not rely solely on their training data. They perform a <strong>Live Web Grounding Search</strong>:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-[11.5px]">
            <li>The AI executes 3–5 real-time background search queries on search indexes.</li>
            <li>It extracts top matching paragraphs from high-authority websites.</li>
            <li>It synthesizes a direct answer and adds source citations to the pages that provided the clearest, most reliable data.</li>
          </ol>
        </div>
      ),
    },

    // Site Audit Doubts
    {
      id: "audit-robots-txt",
      category: "site-audit",
      title: "How do I unblock AI bots in robots.txt?",
      subtitle: "Ensuring GPTBot, PerplexityBot, and Google-Extended can index your site",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <p>
            If your site audit shows an AI crawler block, check your website&apos;s <code>robots.txt</code> file (located at <code>yourwebsite.com/robots.txt</code>).
          </p>
          <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed">
            User-agent: GPTBot<br />
            Allow: /<br /><br />
            User-agent: PerplexityBot<br />
            Allow: /<br /><br />
            User-agent: ClaudeBot<br />
            Allow: /
          </div>
          <p className="text-[11px] text-slate-500">
            Adding the snippet above allows AI search engines to crawl and cite your content in real-time answers.
          </p>
        </div>
      ),
    },

    // Glossary
    {
      id: "glossary-terms",
      category: "glossary",
      title: "Plain-English Glossary of Search & AI Terms",
      subtitle: "Quick definitions of common industry acronyms",
      icon: BookOpen,
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border">
              <span className="font-bold text-slate-900 dark:text-foreground">GEO (Generative Engine Optimization)</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                The modern evolution of SEO focused on getting recommended and cited inside AI-generated responses (ChatGPT, Google AI, Perplexity).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border">
              <span className="font-bold text-slate-900 dark:text-foreground">AI Overview (AIO)</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                Google&apos;s AI-generated snapshot shown at the very top of Google Search results, summarizing information from multiple web sources.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border">
              <span className="font-bold text-slate-900 dark:text-foreground">Citation Share of Voice</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                The percentage of times your website is cited by AI models compared to your competitors for target keyword clusters.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border">
              <span className="font-bold text-slate-900 dark:text-foreground">JSON-LD Schema Markup</span>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                Hidden machine-readable code on your webpage that explicitly tells AI models who you are, what products you sell, and your verified pricing.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Filter articles based on active category and search query
  const filteredArticles = articles.filter((art) => {
    const matchesCategory = activeCategory === "all-features" || art.category === activeCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    setTicketSent(true);
    setContactSubject("");
    setContactMessage("");
    setTimeout(() => setTicketSent(false), 5000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background text-foreground overflow-hidden font-sans">
      
      {/* ── 1. HELP CENTER SIDEBAR ── */}
      <aside className="w-72 border-r border-slate-200 dark:border-border hidden md:flex flex-col bg-white dark:bg-card/70 shrink-0 select-none">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-border space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center font-bold shadow-2xs">
              <HelpCircle size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-foreground">
                Help &amp; Doubts Hub
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium">
                Guides, FAQs &amp; Explanations
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedArticleId(null);
                }}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? "bg-[#FFF9F5] dark:bg-orange-950/30 border-2 border-[#FF5A1F] shadow-2xs text-[#FF5A1F]"
                    : "bg-transparent hover:bg-slate-50 dark:hover:bg-muted/50 text-slate-600 dark:text-slate-300 border border-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-orange-100 dark:bg-orange-900/50 text-[#FF5A1F]"
                    : "bg-slate-100 dark:bg-muted text-slate-500"
                }`}>
                  <Icon size={16} className="stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-extrabold truncate ${isActive ? "text-[#FF5A1F]" : "text-slate-900 dark:text-foreground"}`}>
                    {cat.label}
                  </p>
                  <p className="text-[10.5px] text-slate-400 dark:text-muted-foreground font-medium truncate mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Assistant Callout */}
        <div className="p-4 border-t border-slate-100 dark:border-border">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border border-orange-200/80 dark:border-orange-900/40 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-foreground">
              <Bot size={15} className="text-[#FF5A1F]" />
              <span>Have an instant question?</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium leading-tight">
              Ask our AI Assistant to explain any metric or ranking issue in real-time.
            </p>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#FF5A1F] hover:underline pt-0.5"
            >
              <span>Ask in AI Chat</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

      </aside>

      {/* ── 2. MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        
        {/* Top Search Bar & Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 via-white to-transparent dark:from-muted/20 dark:via-background dark:to-transparent border-b border-slate-200/70 dark:border-border space-y-4">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5A1F]">
              <Sparkles size={14} />
              <span>VSI Help &amp; Understanding Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
              Got doubts? Everything is explained simply here.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-normal max-w-2xl">
              Search any tool, metric, or concept on the site to see what it does and how to get the most value for your business.
            </p>

            {/* Instant Search Bar */}
            <div className="pt-2 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any doubt (e.g. 'what is a citation', 'site audit score', 'how to test prompts')..."
                className="w-full bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl pl-11 pr-4 py-3 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Category View */}
        <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6 flex-1">
          
          {/* Quick Category Tabs Pills on Mobile */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#FF5A1F] text-white"
                    : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* CONTACT SUPPORT VIEW */}
          {activeCategory === "contact" ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-foreground">
                  💬 Contact Support &amp; Technical Help
                </h2>
                <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
                  Still have doubts or need custom setup assistance? Send our team a message.
                </p>
              </div>

              {ticketSent && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Support request submitted! We will respond to your email within 2-4 hours.</span>
                </div>
              )}

              <form onSubmit={handleSendTicket} className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-foreground block mb-1">
                    Subject / What you need help with
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Help understanding my citation ranking results"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-[#FF5A1F] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-foreground block mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or doubt..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-[#FF5A1F] shadow-2xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04D16] text-white text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Send size={13} />
                    <span>Send Support Ticket</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ARTICLES ACCORDION LIST */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-foreground">
                  {categories.find((c) => c.id === activeCategory)?.label || "Guides & Doubts"}
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
                </span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-10 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No articles found matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-slate-400">
                    Try searching for terms like &apos;citation&apos;, &apos;audit&apos;, &apos;prompts&apos;, or &apos;rank&apos;.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((art) => {
                    const isExpanded = expandedArticleId === art.id;
                    const Icon = art.icon;

                    return (
                      <div
                        key={art.id}
                        className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-2xs overflow-hidden transition-all"
                      >
                        {/* Accordion Header */}
                        <button
                          type="button"
                          onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                          className="w-full p-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center shrink-0 shadow-2xs">
                              <Icon size={18} className="stroke-[2.2]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-foreground truncate">
                                  {art.title}
                                </h3>
                                {art.badge && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-[#FF5A1F] dark:bg-orange-950/60 px-2 py-0.5 rounded-full shrink-0">
                                    {art.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium truncate mt-0.5">
                                {art.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-muted text-slate-400 flex items-center justify-center shrink-0">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="p-5 pt-2 border-t border-slate-100 dark:border-border/60 bg-slate-50/30 dark:bg-muted/10 animate-fadeIn">
                            {art.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
