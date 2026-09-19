"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { logoutAndRedirect } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, adminPageTitle, isAdminNavActive } from "./admin-nav";

/** Platform admin navigation. Same look as the VSI app sidebar, grouped for operators. */
export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu when the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5" aria-label="Platform admin overview">
          <Image src="/vg-logo.png" alt="" width={26} height={26} className="shrink-0 rounded-md" />
          <span className="min-w-0 leading-tight">
            <span className="block text-body font-semibold text-ink">VSI Platform</span>
            <span className="block truncate text-caption text-ink-3">Admin</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-control p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink md:hidden"
          aria-label="Close menu"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {ADMIN_NAV.map((group, gi) => (
          <div key={group.title} className={cn(gi > 0 && "mt-5")}>
            <p className="mb-1.5 px-2.5 text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.08em] text-ink-3">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAdminNavActive(item, pathname);
                const Icon = item.Icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-8 items-center gap-2.5 rounded-control px-2.5 text-body transition-colors duration-150",
                        active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                      )}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" aria-hidden />}
                      <Icon size={16} strokeWidth={1.75} aria-hidden className={active ? "text-ink" : "text-ink-3"} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line px-3 py-3">
        <Link
          href="/dashboard"
          className="flex h-8 items-center gap-2.5 rounded-control px-2.5 text-support text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
          Open VSI app
        </Link>
        <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 pt-3">
          <div className="min-w-0">
            <p className="truncate text-support text-ink" title={email}>
              {email}
            </p>
            <p className="text-caption text-ink-3">Platform admin</p>
          </div>
          <button
            type="button"
            onClick={() => logoutAndRedirect()}
            className="rounded-control p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  const title = adminPageTitle(pathname);

  return (
    <>
      {/* Phones and tablets: top bar with the menu */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="-ml-1.5 rounded-control p-1.5 text-ink-2 hover:bg-surface-2"
          aria-label="Open admin menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <span className="min-w-0 truncate text-body font-medium text-ink">{title ? `Admin · ${title}` : "Platform admin"}</span>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-40 animate-fade-in bg-ink/30 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-dvh w-60 shrink-0 border-r border-line transition-transform duration-200 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-overlay" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}

/** Desktop header: where you are, plainly. */
export function AdminTopbar() {
  const pathname = usePathname();
  const title = adminPageTitle(pathname);
  return (
    <header className="hidden h-14 shrink-0 items-center gap-1.5 border-b border-line bg-surface px-6 text-support md:flex">
      <span className="text-ink-3">Platform admin</span>
      {title && (
        <>
          <span className="text-line-strong" aria-hidden>
            /
          </span>
          <span className="font-medium text-ink">{title}</span>
        </>
      )}
    </header>
  );
}
