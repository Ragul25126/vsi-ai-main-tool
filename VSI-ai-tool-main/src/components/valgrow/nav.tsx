"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./primitives";
import { cn } from "@/lib/utils";

const links = [
  { label: "Problem", href: "#problem" },
  { label: "Platform", href: "#features" },
  { label: "Dashboard", href: "#dashboard", highlighted: true },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 backdrop-blur-md",
        scrolled ? "bg-[#050508]/85 border-b border-[#FF2B2B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" : "bg-transparent border-b border-white/5",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <Logo />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-semibold transition-colors duration-200",
                l.highlighted
                  ? "text-[#FF3B30] drop-shadow-[0_0_12px_rgba(255,59,48,0.6)] hover:text-[#FF5555]"
                  : "text-neutral-300 hover:text-white"
              )}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-[#FF3B30] via-[#FF2B2B] to-[#D61C1C] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,43,43,0.45)] hover:shadow-[0_0_30px_rgba(255,43,43,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>
    </header>
  );
}
