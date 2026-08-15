import { useEffect, useState } from "react";
import { Logo } from "./primitives";
import { cn } from "@/lib/utils";

const links = [
  { label: "Problem", href: "#problem" },
  { label: "Platform", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
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
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "panel border-x-0 border-t-0" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <Logo />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a href="#demo" className="nav-link hidden sm:inline-flex">
            Book Demo
          </a>
          <a
            href="#pricing"
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition duration-250 ease-out hover:bg-primary/90"
          >
            Start Free Trial
          </a>
        </div>
      </nav>
    </header>
  );
}
