import { motion, useInView, useMotionValue, useSpring, animate } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className="flex items-center gap-3 label-mono text-signal">
      <span className="inline-block h-1.5 w-1.5 bg-signal node-pulse" />
      <span>{children}</span>
      {id ? <span className="text-muted-foreground">{id}</span> : null}
    </div>
  );
}

export function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Mouse-follow glow layered behind page content. */
export function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-0 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px] md:block"
      style={{
        left: sx,
        top: sy,
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--signal) 55%, transparent), transparent 65%)",
      }}
    />
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel rounded-md", className)}>{children}</div>;
}

export function CTAButtons({ align = "start" }: { align?: "start" | "center" }) {
  return (
    <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center")}>
      <a
        href="#pricing"
        className="shimmer group inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
        style={{ boxShadow: "var(--glow-signal)" }}
      >
        Start Free Trial
      </a>
      <a
        href="#demo"
        className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface/60 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-signal/60 hover:bg-surface"
      >
        Book Demo
      </a>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <span className="font-display text-xl font-extrabold tracking-[-0.06em] uppercase">VSI</span>
        <span className="label-mono text-muted-foreground uppercase">ValGrow</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/vg-logo.png"
        alt="ValGrow Search Intelligence logo"
        className="block h-[38px] w-auto sm:h-[40px] md:h-[48px]"
        onError={() => setHasError(true)}
      />
      <span className="inline-flex flex-col gap-0 leading-tight">
        <span className="font-display text-sm font-extrabold tracking-[-0.06em] uppercase">VSI</span>
        <span className="label-mono text-[11px] uppercase text-muted-foreground -mt-0.5">ValGrow</span>
      </span>
    </span>
  );
}
