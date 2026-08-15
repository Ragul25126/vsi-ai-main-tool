"use client";

import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
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
    <div className={cn("flex flex-wrap items-center gap-4", align === "center" && "justify-center")}>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF3B30] via-[#FF2B2B] to-[#D61C1C] px-7 py-3.5 text-base font-bold text-white shadow-[0_0_25px_rgba(255,43,43,0.5)] transition-all duration-250 hover:shadow-[0_0_35px_rgba(255,43,43,0.75)] hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Free Trial
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FF2B2B]/50 bg-[#0d0d11]/80 px-7 py-3.5 text-base font-semibold text-[#FF4D4D] backdrop-blur-md shadow-[0_0_15px_rgba(255,43,43,0.15)] transition-all duration-250 hover:border-[#FF2B2B] hover:text-[#FF3B30] hover:bg-[#FF2B2B]/10 hover:scale-[1.02] active:scale-[0.98]"
      >
        Launch Dashboard →
      </Link>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Gold VG Logo Image */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)] shrink-0 border border-amber-300/50 p-0.5 overflow-hidden">
        <img
          src="/logo.png"
          alt="ValGrow VG Logo"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/vg-logo.png";
          }}
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-display text-base font-black tracking-wider text-white uppercase">VSI</span>
        <span className="label-mono text-[9px] font-bold tracking-widest text-neutral-400 uppercase mt-0.5">VALGROW</span>
      </div>

      {/* PRO Badge */}
      <span className="ml-1.5 rounded-full border border-[#FF2B2B]/70 bg-[#FF2B2B]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#FF4D4D] shadow-[0_0_10px_rgba(255,43,43,0.25)]">
        PRO
      </span>
    </div>
  );
}
