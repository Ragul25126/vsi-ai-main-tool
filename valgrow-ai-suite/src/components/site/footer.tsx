import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { Logo } from "./primitives";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Dashboard", "Integrations"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Blog", "GEO Playbook", "Changelog"],
  },
  {
    title: "Company",
    links: ["Contact", "Privacy Policy", "Terms", "Security"],
  },
];

const socials = [Twitter, Linkedin, Github, Youtube];

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
            {socials.map((Icon, i) => (
              <a
                key={i}
                href="#top"
                aria-label="ValGrow social profile"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-signal/60 hover:text-signal"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="label-mono text-muted-foreground">{c.title}</p>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href="#top"
                    className="text-sm text-foreground/80 transition-colors hover:text-signal"
                  >
                    {l}
                  </a>
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
