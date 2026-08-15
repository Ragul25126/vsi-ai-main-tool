"use client";

import Link from "next/link";
import { Logo } from "./primitives";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Integrations", href: "#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/dashboard" },
      { name: "Blog", href: "#top" },
      { name: "GEO Playbook", href: "#top" },
      { name: "Changelog", href: "#top" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Contact", href: "#demo" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms", href: "/privacy" },
      { name: "Security", href: "#top" },
    ],
  },
];

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const socials = [TwitterIcon, LinkedinIcon, GithubIcon, YoutubeIcon];

export function Footer() {
  return (
    <footer className="relative border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The citation command center for AI-era search. Built for strategists who prefer to ship
            than report.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map((IconComponent, i) => (
              <a
                key={i}
                href="#top"
                aria-label="ValGrow social profile"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-signal/60 hover:text-signal"
              >
                <IconComponent className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="label-mono text-muted-foreground">{c.title}</p>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l.name}>
                  {l.href.startsWith("/") ? (
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-signal"
                    >
                      {l.name}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-signal"
                    >
                      {l.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="label-mono text-muted-foreground">
          © {new Date().getFullYear()} ValGrow Labs. All rights reserved.
        </p>
        <p className="flex items-center gap-2 label-mono text-signal">
          <span className="h-1.5 w-1.5 rounded-full bg-signal node-pulse" />
          All systems active
        </p>
      </div>
    </footer>
  );
}
