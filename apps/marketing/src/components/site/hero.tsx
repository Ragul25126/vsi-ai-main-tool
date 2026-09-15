import { motion } from "motion/react";
import { Counter, CTAButtons, Reveal, SectionLabel } from "./primitives";

const metrics = [
  { label: "AI Visibility Score", value: 74.2, suffix: "", decimals: 1 },
  { label: "Brand Mentions", value: 1284, suffix: "" },
  { label: "Citations Won", value: 396, suffix: "" },
  { label: "Search Coverage", value: 68, suffix: "%" },
];

const engines = [
  { name: "ChatGPT", share: 82 },
  { name: "AI Overviews", share: 64 },
  { name: "Perplexity", share: 51 },
  { name: "Gemini", share: 43 },
  { name: "Claude", share: 37 },
];

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-70" />
      <motion.div
        className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--signal) 45%, transparent), transparent 70%)",
        }}
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-[8%] h-[420px] w-[420px] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 40%, transparent), transparent 70%)",
        }}
        animate={{ opacity: [0.2, 0.45, 0.2], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-px w-px rounded-full bg-signal"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            boxShadow: "0 0 8px 2px color-mix(in oklab, var(--signal) 60%, transparent)",
          }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -60, -120] }}
          transition={{
            duration: 8 + (i % 5) * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-16 w-full max-w-5xl"
      style={{ perspective: 1200 }}
    >
      <div
        className="panel rounded-lg p-1"
        style={{ boxShadow: "var(--shadow-panel), var(--glow-signal)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          </div>
          <span className="label-mono text-muted-foreground">VSI://ANSWER-INTELLIGENCE · LIVE</span>
          <span className="h-2 w-2 rounded-full bg-signal node-pulse" />
        </div>

        <div className="grid gap-px bg-border/60 sm:grid-cols-4">
          {metrics.map((m, i) => (
            <div key={m.label} className="bg-background/70 p-4">
              <p className="label-mono text-muted-foreground">{m.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                <Counter to={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
              </p>
              <div className="mt-3 h-1 w-full bg-surface-2">
                <motion.div
                  className="h-full bg-signal"
                  initial={{ width: 0 }}
                  animate={{ width: `${45 + i * 13}%` }}
                  transition={{ duration: 1.4, delay: 0.8 + i * 0.15 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-px bg-border/60 md:grid-cols-[1.4fr_1fr]">
          <div className="bg-background/70 p-5">
            <p className="label-mono text-muted-foreground">Citation share by engine</p>
            <div className="mt-4 space-y-3">
              {engines.map((e, i) => (
                <div key={e.name} className="flex items-center gap-3">
                  <span className="w-28 font-mono text-xs text-muted-foreground">{e.name}</span>
                  <div className="h-2 flex-1 bg-surface-2">
                    <motion.div
                      className="h-full"
                      style={{ background: "var(--gradient-signal)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${e.share}%` }}
                      transition={{ duration: 1.2, delay: 1 + i * 0.12 }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-xs">{e.share}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-background/70 p-5">
            <p className="label-mono text-muted-foreground">Visibility trend · 90d</p>
            <svg viewBox="0 0 200 90" className="mt-4 h-28 w-full" aria-hidden>
              <motion.path
                d="M0 74 L25 66 L50 70 L75 52 L100 46 L125 50 L150 30 L175 24 L200 12"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="1.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1.1, ease: "easeInOut" }}
              />
              <motion.path
                d="M0 74 L25 66 L50 70 L75 52 L100 46 L125 50 L150 30 L175 24 L200 12 L200 90 L0 90 Z"
                fill="color-mix(in oklab, var(--signal) 16%, transparent)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 2 }}
              />
            </svg>
            <p className="font-mono text-xs text-muted-foreground">
              <span className="signal-text">+38.4%</span> answer presence vs. last quarter
            </p>
          </div>
        </div>
      </div>

      <motion.div
        className="panel absolute -left-24 top-1/2 hidden rounded-md p-3 xl:block"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="label-mono text-muted-foreground">Competitor Rankings</p>
        <p className="mt-1 font-display text-xl font-semibold">
          #<Counter to={2} /> <span className="signal-text text-sm">▲ 3</span>
        </p>
      </motion.div>
      <motion.div
        className="panel absolute -right-24 bottom-16 hidden rounded-md p-3 xl:block"
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <p className="label-mono text-muted-foreground">Prompts tracked</p>
        <p className="mt-1 font-display text-xl font-semibold">
          <Counter to={4820} />
        </p>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-6 pb-24 pt-36">
      <Aurora />
      <div className="relative mx-auto max-w-5xl text-center">
        <Reveal>
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface/60 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-signal node-pulse" />
            <span className="label-mono text-muted-foreground">
              ValGrow Search Intelligence · GEO Platform
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mx-auto mt-8 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Dominate AI Search Before{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-signal)" }}
            >
              Your Competitors Do
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Monitor how AI platforms mention your brand, discover competitor opportunities, optimize
            your content for AI search, and increase visibility where modern buyers search first.
          </p>
        </Reveal>
        <Reveal delay={0.24} className="mt-9">
          <CTAButtons align="center" />
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-4 label-mono text-muted-foreground">
            No credit card · Full engine coverage in 24 hours
          </p>
        </Reveal>
      </div>
      <DashboardMock />
    </section>
  );
}

const logos = [
  "NORTHWIND",
  "CHECKOUT.IO",
  "LUMEN LABS",
  "ARCADIA",
  "HELIOGRAPH",
  "SABER FINANCE",
  "ORBIT HEALTH",
  "VERTEX GCC",
];

export function TrustedBy() {
  return (
    <section className="relative border-y border-border py-10">
      <p className="mb-6 text-center label-mono text-muted-foreground">
        Trusted by modern marketing teams and growth companies
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track flex w-max gap-16 pr-16">
          {[...logos, ...logos].map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="font-display text-lg font-semibold tracking-[-0.03em] text-muted-foreground/60"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export { SectionLabel };
