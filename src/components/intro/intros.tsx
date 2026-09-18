import type { ReactNode } from "react";
import {
  ArrowUpDown,
  Bot,
  CheckCircle2,
  FileText,
  HeartPulse,
  Kanban,
  LineChart,
  Lightbulb,
  Link2,
  ListOrdered,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { COMING_SOON_ENGINES, ENGINES } from "@/lib/geo";
import {
  ActionsScene,
  AnswerScene,
  BoardScene,
  ChatScene,
  CompareScene,
  ReportScene,
  SearchScene,
  SiteAuditScene,
} from "@/components/illustrations";
import { FeatureIntro, type Capability } from "./FeatureIntro";
import { CHAT_QUESTIONS, type StoryKey } from "./story";

export type IntroKey = Exclude<StoryKey, never>;

export interface IntroContent {
  page: string;
  category?: string;
  headline: string;
  description: string;
  capabilities?: { title: string; items: Capability[]; example?: boolean };
  steps: string[];
  stepsTitle?: string;
  /** Example questions (AI Chat only). Shown as quotes, never as answers. */
  questions?: string[];
}

/** Engines VSI checks today, read from the same list the product uses. */
export const ENGINE_COVERAGE = {
  live: ENGINES.map((e) => (e.id === "ai_overviews" ? `${e.label} (optional)` : e.label)),
  soon: COMING_SOON_ENGINES,
};

export { CHAT_QUESTIONS };

/** All first-use copy in one place. Plain words, no em-dashes, one CTA label. */
export const INTROS: Record<IntroKey, IntroContent> = {
  audit: {
    page: "Site Audit",
    headline: "Find problems that could be hurting your website.",
    description: "VSI checks your website and shows you what needs attention, in plain language, with what to do about each problem.",
    capabilities: {
      title: "What we check",
      items: [
        { Icon: HeartPulse, title: "Website health", text: "Make sure visitors can use your website easily.", detail: "Secure connection, pages that fail to load, broken links, mobile layout" },
        { Icon: Search, title: "Search readiness", text: "Help search engines understand your pages.", detail: "Pages search engines may show, sitemap, page titles, page descriptions" },
        { Icon: Bot, title: "AI readiness", text: "Help AI systems understand and use your content.", detail: "AI crawlers allowed, business details, answer-style content" },
        { Icon: FileText, title: "Content", text: "Find pages that could explain things more clearly.", detail: "Page headings and image descriptions" },
      ],
    },
    steps: ["Add your website", "VSI checks your pages", "We find important issues", "You get simple recommendations"],
  },
  search: {
    page: "Search Visibility",
    headline: "See where your website appears in search.",
    description: "Track important searches and understand what is improving, dropping, and worth your attention.",
    capabilities: {
      title: "What you can track",
      items: [
        { Icon: ListOrdered, title: "Search rankings", text: "Track where your pages appear for each search." },
        { Icon: ArrowUpDown, title: "Ranking changes", text: "See what improved or dropped since the last check." },
        { Icon: Target, title: "Important searches", text: "Focus on the searches that matter to your business." },
      ],
    },
    steps: ["Add searches", "VSI checks", "See changes", "Act on what matters"],
  },
  ai: {
    page: "AI Visibility",
    category: "Generative Engine Optimization (GEO)",
    headline: "See whether AI systems mention your business.",
    description: "Understand how your business appears in AI-generated answers, and where competitors are mentioned instead.",
    capabilities: {
      title: "What you'll discover",
      items: [
        { Icon: MessageSquareText, title: "AI mentions", text: "See when your business appears in an AI answer." },
        { Icon: Link2, title: "AI citations", text: "See when an AI answer links to your website as a source." },
        { Icon: Users, title: "Competitor presence", text: "See when competitors appear instead of you." },
        { Icon: Lightbulb, title: "Opportunities", text: "Find searches where your business could be more visible." },
      ],
    },
    steps: ["Choose important searches", "VSI checks AI answers", "Compare your visibility", "Find ways to improve"],
  },
  competitors: {
    page: "Competitors",
    headline: "See where competitors appear, and where you can win.",
    description: "Compare your business with the competitors your customers are already considering, in Google and in AI answers.",
    capabilities: {
      title: "What you can see",
      items: [
        { Icon: Search, title: "Search visibility", text: "Who shows up on Google for your searches." },
        { Icon: MessageSquareText, title: "AI visibility", text: "Who AI answers mention or link to." },
        { Icon: Lightbulb, title: "Content opportunities", text: "Searches where a competitor appears and you don't." },
      ],
    },
    steps: ["Add competitors", "VSI compares visibility", "Find the gaps", "Turn gaps into actions"],
  },
  actions: {
    page: "Next Actions",
    headline: "Know what to work on next.",
    description: "VSI turns website, search and AI findings into clear actions you can take, most important first.",
    capabilities: {
      title: "What actions look like",
      example: true,
      items: [
        { Icon: Wrench, title: "Fix website issues", text: "Some pages link to addresses that no longer exist." },
        { Icon: FileText, title: "Improve important pages", text: "A key page doesn't answer the question customers ask." },
        { Icon: MessageSquareText, title: "Strengthen AI visibility", text: "AI answers for a search link to a competitor, not to you." },
        { Icon: TrendingUp, title: "Improve search visibility", text: "A search is close to Google's first page." },
      ],
    },
    stepsTitle: "How an action is made",
    steps: ["VSI finds something", "Explains why it matters", "Recommends what to do", "You create a task", "Track progress"],
  },
  tasks: {
    page: "Tasks",
    headline: "Turn recommendations into work your team can finish.",
    description: "Create tasks from VSI findings and keep track of what has been completed.",
    capabilities: {
      title: "What you can do",
      items: [
        { Icon: Plus, title: "Create tasks", text: "Turn any finding into a task in one step." },
        { Icon: UserRound, title: "Assign work", text: "Give each task an owner: writer, developer, SEO or outreach." },
        { Icon: Kanban, title: "Track progress", text: "Move tasks from to do, to in progress, to done." },
        { Icon: CheckCircle2, title: "Mark completed", text: "Record when the work is finished." },
        { Icon: RefreshCw, title: "Verify improvements", text: "VSI checks again and tells you whether it worked." },
      ],
    },
    steps: ["Open a finding", "Create a task", "Do the work", "VSI checks the result"],
  },
  reports: {
    page: "Reports",
    headline: "Understand your progress over time.",
    description: "Bring your website, search and AI visibility together in clear reports you can share.",
    capabilities: {
      title: "What reports show",
      items: [
        { Icon: HeartPulse, title: "Website health", text: "Your latest site audit score and how it changed." },
        { Icon: Search, title: "Search visibility", text: "Searches that moved up or down on Google." },
        { Icon: MessageSquareText, title: "AI visibility", text: "Searches where AI answers started or stopped citing you." },
        { Icon: Users, title: "Competitor insights", text: "Searches where competitors appear and you don't." },
        { Icon: CheckCircle2, title: "Completed actions", text: "Tasks your team finished in the period." },
        { Icon: LineChart, title: "Progress over time", text: "Each report compares this period with the one before." },
      ],
    },
    steps: ["Add your website", "Run your checks", "Create a report", "Share the link"],
  },
  chat: {
    page: "AI Chat",
    headline: "Ask questions about your website and visibility.",
    description: "Ask VSI about your website, search visibility, AI visibility, competitors and recommended actions.",
    questions: CHAT_QUESTIONS,
    steps: ["Add your website", "Run your first checks", "Ask a question", "Get answers from your own data"],
  },
};

const ILLUSTRATIONS: Record<IntroKey, () => ReactNode> = {
  audit: () => <SiteAuditScene />,
  search: () => <SearchScene />,
  ai: () => <AnswerScene />,
  competitors: () => <CompareScene />,
  actions: () => <ActionsScene />,
  tasks: () => <BoardScene />,
  reports: () => <ReportScene />,
  chat: () => <ChatScene />,
};

export function introIllustration(key: IntroKey): ReactNode {
  return ILLUSTRATIONS[key]();
}

function EngineNote() {
  return (
    <p>
      Checked today in {ENGINE_COVERAGE.live.join(", ")}. Coming soon: {ENGINE_COVERAGE.soon.join(" and ")}.
    </p>
  );
}

function ExampleQuestions({ questions }: { questions: string[] }) {
  return (
    <section className="space-y-6">
      <h2 className="text-section font-semibold text-ink">Questions you can ask</h2>
      <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {questions.map((q) => (
          <li key={q} className="border-l-2 border-line-strong pl-4 text-body text-ink-2">
            &ldquo;{q}&rdquo;
          </li>
        ))}
      </ul>
      <p className="text-support text-ink-3">Add your website first, so VSI can answer questions about it from your own data.</p>
    </section>
  );
}

/** The complete first-use page for one feature. */
export function Intro({ name }: { name: IntroKey }) {
  const c = INTROS[name];
  return (
    <FeatureIntro
      page={c.page}
      category={c.category}
      headline={c.headline}
      description={c.description}
      illustration={introIllustration(name)}
      capabilities={c.capabilities && { ...c.capabilities, note: name === "ai" ? <EngineNote /> : undefined }}
      middle={c.questions ? <ExampleQuestions questions={c.questions} /> : undefined}
      steps={c.steps}
      stepsTitle={c.stepsTitle}
      story={name}
    />
  );
}
