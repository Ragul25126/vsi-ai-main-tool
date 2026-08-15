"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Braces,
  Compass,
  FileSearch,
  Gauge,
  LayoutDashboard,
  Quote,
  Star,
  Target,
  Users,
} from "lucide-react";
import { Counter, CTAButtons, Panel, Reveal, SectionLabel } from "./primitives";

/* ---------------- Problem ---------------- */

const surfaces = ["Google", "ChatGPT", "AI Overviews", "Gemini", "Claude", "Perplexity"];

const problems = [
  {
    tag: "Traditional tracking",
    id: "001",
    title: "The dashboard illusion",
    body: "Rank trackers report stable positions while the answer above them absorbs the click. Green charts, falling pipeline.",
  },
  {
    tag: "AI interception",
    id: "002",
    title: "The real buyer journey",
    body: "The buyer asks a question, the engine summarizes competing vendors, cites three sources, and the decision is made before a SERP loads.",
  },
  {
    tag: "Omission gaps",
    id: "003",
    title: "Omitted from answers",
    body: "You can rank page one and still be absent from the generated response. Omission is invisible to every classic SEO tool.",
  },
  {
    tag: "Citation diagnostics",
    id: "004",
    title: "Invisible citation gaps",
    body: "Knowing you're missing isn't enough. VSI isolates the paragraph, entity, and source pattern the engine trusted instead.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 01">The problem</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
            Traditional SEO isn&apos;t enough anymore. Most clicks have already moved.
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {surfaces.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <motion.span
                  className="rounded-sm border border-border bg-surface/60 px-4 py-2 label-mono"
                  whileHover={{ y: -3, borderColor: "var(--signal)" }}
                >
                  {s}
                </motion.span>
                {i < surfaces.length - 1 && (
                  <motion.span
                    className="signal-text"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                  >
                    →
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="group h-full bg-background p-8 transition-colors hover:bg-surface/60">
                <div className="flex items-center justify-between">
                  <span className="label-mono text-signal">{p.tag}</span>
                  <span className="label-mono text-muted-foreground">{p.id}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-medium tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */

const features = [
  {
    icon: Activity,
    title: "AI Visibility Tracking",
    body: "Track where your brand appears across ChatGPT, Gemini, Claude, Perplexity, and Google AI Overviews.",
  },
  {
    icon: Users,
    title: "Competitor Intelligence",
    body: "See exactly who the engines recommend instead of you, and which claims earned them the slot.",
  },
  {
    icon: FileSearch,
    title: "Citation Monitoring",
    body: "Inspect the sources AI trusts, the anchors it lifts, and the domains compounding authority.",
  },
  {
    icon: Braces,
    title: "Prompt Intelligence",
    body: "Identify the real prompts driving buyer discovery and the ones quietly excluding your brand.",
  },
  {
    icon: Target,
    title: "GEO Optimization",
    body: "Generative Engine Optimization recommendations mapped to entities, schema, and evidence gaps.",
  },
  {
    icon: Compass,
    title: "Content Opportunities",
    body: "Surface answer gaps your existing library can win this quarter, ranked by citation upside.",
  },
  {
    icon: BarChart3,
    title: "AI Search Analytics",
    body: "Monitor share of voice, sentiment, and visibility trends across every engine over time.",
  },
  {
    icon: LayoutDashboard,
    title: "Executive Dashboard",
    body: "One command center for AI search performance, exportable for the board in a single click.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 02">The platform</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
            A complete search intelligence engine for the AI era.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.05}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group h-full rounded-md border border-border bg-surface/40 p-6 transition-colors hover:border-signal/50"
              >
                <f.icon className="h-5 w-5 text-signal" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-medium tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Dashboard showcase ---------------- */

const heat = [82, 61, 40, 94, 22, 55, 73, 31, 88, 47, 66, 18, 79, 35, 58, 91, 27, 64, 43, 70];

export function DashboardShowcase() {
  return (
    <section id="dashboard" className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Reveal>
              <SectionLabel id="§ 03">Command center</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                Every answer, measured. Every omission, explained.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-muted-foreground">
                VSI crawls target AI platforms on a schedule, extracts cited URLs, identifies
                competitor positions, and determines where you win, where you&apos;re mentioned, and
                where you&apos;re invisible — then converts it into shippable task cards.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
              {[
                ["Share of Voice", "41.6%"],
                ["Answer presence", "68%"],
                ["Avg. citation rank", "2.4"],
                ["Engines monitored", "9"],
              ].map(([k, v]) => (
                <div key={k} className="bg-background p-5">
                  <p className="label-mono text-muted-foreground">{k}</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: "var(--glow-signal)" }}
              >
                Open Dashboard →
              </Link>
            </div>
          </div>

          <Reveal delay={0.1}>
            <Panel className="p-1">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="label-mono text-muted-foreground">
                  VSI://CRAWLER · CLOUD
                </span>
                <span className="h-2 w-2 rounded-full bg-signal node-pulse" />
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed">
                <p className="signal-text">λ vsi analyze --domain checkout.io</p>
                <p className="mt-2 text-muted-foreground">&gt; Initializing VSI engine…</p>
                <p className="text-muted-foreground">&gt; Spawning regional crawler…</p>
                <p className="text-muted-foreground">
                  &gt; Fetching live Google AI Overviews <span className="signal-text">OK</span>
                </p>
                <p className="text-muted-foreground">&gt; Parsing citation anchors &amp; entity nodes…</p>
                <p className="mt-2">
                  <span className="signal-text">✓ Ready.</span> Network: ON · Telemetry: OFF
                </p>
              </div>
              <div className="border-t border-border p-5">
                <p className="label-mono text-muted-foreground">Prompt coverage heatmap</p>
                <div className="mt-4 grid grid-cols-10 gap-1">
                  {heat.concat(heat).map((v, i) => (
                    <motion.span
                      key={i}
                      className="aspect-square rounded-[2px]"
                      style={{
                        background: `color-mix(in oklab, var(--signal) ${v}%, var(--surface-2))`,
                      }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.012 }}
                    />
                  ))}
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why + Workflow ---------------- */

const why = [
  ["AI-first search intelligence", "Built from the answer down, not bolted onto a rank tracker."],
  ["Built for modern AI search", "Live engine crawls, not scraped SERP approximations."],
  ["Actionable recommendations", "Every finding ships as a scoped task with an owner."],
  ["Enterprise-ready reporting", "Board-ready exports, API access, and audit-grade snapshots."],
];

const steps = [
  ["Connect website", "Point VSI at your domain and competitive set. Setup takes minutes."],
  ["Scan AI search", "We query live engines on schedule and archive every response snapshot."],
  ["Discover opportunities", "Omission causes, entity gaps, and citation targets are ranked."],
  ["Grow visibility", "Ship the fixes, then watch answer presence compound week over week."],
];

export function WhyAndWorkflow() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 04">Why ValGrow</SectionLabel>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div
                className="h-full rounded-md p-px"
                style={{ background: "linear-gradient(160deg, var(--border), transparent 60%)" }}
              >
                <div className="h-full rounded-md bg-surface/50 p-6">
                  <Gauge className="h-5 w-5 text-signal" strokeWidth={1.5} />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-28">
          <Reveal>
            <SectionLabel id="§ 05">How it works</SectionLabel>
          </Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-4">
            <motion.div
              aria-hidden
              className="absolute left-0 top-4 hidden h-px bg-signal/50 md:block"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
            {steps.map(([title, body], i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="relative">
                  <span className="relative z-10 block h-2 w-2 rounded-full bg-signal node-pulse md:mt-3" />
                  <p className="mt-5 label-mono text-muted-foreground">Step 0{i + 1}</p>
                  <h3 className="mt-2 font-display text-xl font-medium tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials + stats ---------------- */

const quotes = [
  {
    quote:
      "We were ranking top three and still absent from every AI answer. VSI showed us the exact paragraphs the engines were citing instead — we fixed nine of them and answer presence doubled.",
    name: "Layla Haddad",
    role: "VP Growth, Checkout.io",
  },
  {
    quote:
      "The competitor view is brutal in the best way. It reads like a scoreboard for who the models trust, and it finally gave our content team a real target.",
    name: "Marcus Bell",
    role: "Head of SEO, Northwind",
  },
  {
    quote:
      "Board reporting used to be a week of manual screenshots. Now it's one export with citations, share of voice, and trend lines.",
    name: "Priya Nair",
    role: "CMO, Orbit Health",
  },
];

const stats = [
  { value: 95, suffix: "%", label: "Faster analysis" },
  { value: 10000, suffix: "+", label: "AI queries monitored daily" },
  { value: 500, suffix: "+", label: "Brands tracked" },
  { value: 12, suffix: "M+", label: "Search signals processed" },
];

export function Testimonials() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 06">Proof</SectionLabel>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.07}>
              <motion.figure
                whileHover={{ y: -6 }}
                className="flex h-full flex-col justify-between rounded-md border border-border bg-surface/50 p-7"
              >
                <div>
                  <Quote className="h-5 w-5 text-signal" strokeWidth={1.5} />
                  <blockquote className="mt-5 text-sm leading-relaxed text-foreground/90">
                    {q.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-semibold text-primary-foreground"
                    style={{ background: "var(--gradient-signal)" }}
                  >
                    {q.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{q.name}</p>
                    <p className="label-mono text-muted-foreground">{q.role}</p>
                  </div>
                  <span className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3 w-3 fill-signal text-signal" />
                    ))}
                  </span>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="bg-background p-8">
                <p className="font-display text-4xl font-semibold tracking-tight">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 label-mono text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Integrations ---------------- */

const integrations = [
  "OpenAI",
  "Google AI Overviews",
  "Perplexity",
  "Claude",
  "Gemini",
  "Search Console",
  "GA4 Analytics",
  "CSV Export",
  "REST API",
];

export function Integrations() {
  return (
    <section className="relative border-y border-border px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 07">Integrations</SectionLabel>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-3">
          {integrations.map((n, i) => (
            <Reveal key={n} delay={i * 0.04}>
              <motion.span
                whileHover={{ y: -4, borderColor: "var(--signal)" }}
                className="inline-block rounded-sm border border-border bg-surface/50 px-5 py-3 font-mono text-xs text-muted-foreground"
              >
                {n}
              </motion.span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

const plans = [
  {
    name: "Starter",
    price: "$249",
    blurb: "For a single brand entering AI search.",
    items: ["1 domain", "3 AI engines", "250 tracked prompts", "Weekly crawls", "CSV export"],
  },
  {
    name: "Growth",
    price: "$749",
    blurb: "For teams competing for the answer slot.",
    items: [
      "5 domains",
      "All 9 engines",
      "2,500 tracked prompts",
      "Daily crawls",
      "Competitor intelligence",
      "GEO task cards",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For portfolios, agencies, and regulated teams.",
    items: [
      "Unlimited domains",
      "Custom engine coverage",
      "API + data warehouse sync",
      "Snapshot archive & audit trail",
      "Dedicated strategist",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel id="§ 08">Pricing</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
            Plans that scale with your answer coverage.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="relative h-full rounded-md border bg-surface/50 p-8"
                style={
                  p.featured
                    ? { borderColor: "var(--signal)", boxShadow: "var(--glow-signal)" }
                    : { borderColor: "var(--border)" }
                }
              >
                {p.featured && (
                  <span className="absolute -top-2.5 left-8 bg-primary px-2 py-0.5 label-mono text-primary-foreground">
                    Most popular
                  </span>
                )}
                <p className="label-mono text-muted-foreground">{p.name}</p>
                <p className="mt-4 font-display text-4xl font-semibold tracking-tight">
                  {p.price}
                  {p.price !== "Custom" && (
                    <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-7 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-3 text-sm text-foreground/85">
                      <span className="signal-text">✓</span>
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.price === "Custom" ? "/auth/login" : "/auth/register"}
                  className={
                    p.featured
                      ? "mt-8 block rounded-sm bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      : "mt-8 block rounded-sm border border-border px-5 py-3 text-center text-sm font-medium transition-colors hover:border-signal/60"
                  }
                >
                  {p.price === "Custom" ? "Contact Team" : "Start Free Trial"}
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ / CTA ---------------- */

const faqs = [
  [
    "What is AI Search Intelligence?",
    "It is the measurement layer for generated answers: which engines mention your brand, which sources they cite, and which prompts trigger you or your competitors.",
  ],
  [
    "How is GEO different from SEO?",
    "SEO optimizes for ranked links. Generative Engine Optimization optimizes for inclusion inside the answer — entities, evidence, structure, and citation-worthy sources.",
  ],
  [
    "How do you measure AI visibility?",
    "VSI runs live prompts against each engine on a schedule, archives every response, and scores presence, position, sentiment, and citation share over time.",
  ],
  [
    "Can I track competitors?",
    "Yes. Every scan captures the full recommended set, so you see who the model suggests instead of you and which source earned the slot.",
  ],
  [
    "Which engines are covered?",
    "ChatGPT, Google AI Overviews, Gemini, Claude, Perplexity, plus additional regional and vertical engines on Enterprise.",
  ],
  [
    "Can I export the data?",
    "CSV export is on every plan, and Growth and Enterprise add API access plus scheduled executive reports.",
  ],
];

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionLabel id="§ 09">FAQ</SectionLabel>
        </Reveal>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.04}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="font-display text-lg font-medium tracking-tight">{q}</span>
                  <span className="signal-text text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section id="demo" className="relative overflow-hidden px-6 py-32">
      <div aria-hidden className="absolute inset-0 grid-lines opacity-60" />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--signal) 40%, transparent), transparent 70%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl">
            Start winning AI search today
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 text-muted-foreground">
            Get your first AI visibility report in 24 hours and see exactly where the answer is going
            without you.
          </p>
        </Reveal>
        <Reveal delay={0.14} className="mt-9">
          <CTAButtons align="center" />
        </Reveal>
      </div>
    </section>
  );
}
