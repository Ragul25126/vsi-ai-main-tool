"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2, ChevronDown, ChevronRight, LogOut, Mail, Shield } from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { logoutAndRedirect, getClientUser, syncOAuthSession } from "@/lib/auth-client";
import { useActiveProject } from "./ProjectProvider";
import { displayDomain } from "@/lib/project-types";
import { pageTitleFor } from "./nav";

interface TopbarProps {
  userEmail: string;
  userRole: string;
  agencyName: string;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Platform admin",
  pilot: "Member",
};

export default function Topbar({ userEmail, userRole, agencyName }: TopbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const project = useActiveProject();
  const { unreadCount } = useMessages();

  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time sync with the OAuth hand-off cookie / localStorage, browser-only.
    const user = syncOAuthSession() || getClientUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.name) setName(user.name);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const pageTitle = pageTitleFor(pathname, searchParams.get("tab"));
  const domain = project ? displayDomain(project.website) : null;

  const displayName = useMemo(() => {
    if (name) return name;
    const local = (userEmail || "").split("@")[0] ?? "";
    return local
      .split(/[._-]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [name, userEmail]);

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    return (parts.length >= 2 ? parts[0][0] + parts[1][0] : displayName.slice(0, 2)).toUpperCase() || "?";
  }, [displayName]);

  return (
    <header className="z-20 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-6 md:flex">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-support">
        {project ? (
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2 rounded-control py-1 pr-1 text-ink-2 transition-colors hover:text-ink">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            <span className="truncate font-medium">{project.name}</span>
            {domain && domain !== project.name && <span className="hidden truncate text-ink-3 lg:inline">{domain}</span>}
          </Link>
        ) : (
          <span className="flex items-center gap-2 text-ink-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong" aria-hidden />
            No website added
          </span>
        )}
        {pageTitle && (
          <>
            <ChevronRight size={14} strokeWidth={1.75} className="shrink-0 text-line-strong" aria-hidden />
            <span className="truncate font-semibold text-ink" aria-current="page">
              {pageTitle}
            </span>
          </>
        )}
      </nav>

      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <Link
          href="/dashboard/messages"
          className="relative rounded-control p-2 text-ink-3 hover:bg-surface-2 hover:text-ink"
          aria-label={unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Messages"}
        >
          <Mail size={17} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white tabular">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <span className="mx-2 h-5 w-px bg-line" aria-hidden />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-control py-1 pl-1 pr-2 hover:bg-surface-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-caption font-semibold text-brand-strong ring-1 ring-brand/20">
              {initials}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-support font-medium leading-tight text-ink">{displayName}</span>
              <span className="block max-w-[11rem] truncate text-caption leading-tight text-ink-3">{agencyName}</span>
            </span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-ink-3" aria-hidden />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 z-50 mt-1.5 w-60 animate-fade-in rounded-panel border border-line bg-surface p-1.5 shadow-overlay">
              <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
                <p className="truncate text-support font-medium text-ink">{displayName}</p>
                <p className="truncate text-caption text-ink-3">{userEmail}</p>
                <p className="mt-1 truncate text-caption text-ink-3">
                  {agencyName} · {ROLE_LABEL[userRole] ?? userRole}
                </p>
              </div>
              <div className="pt-1.5">
                <MenuItem href="/dashboard/settings" Icon={Building2} onSelect={() => setMenuOpen(false)}>
                  Organization settings
                </MenuItem>
                {userRole === "super_admin" && (
                  <MenuItem href="/admin" Icon={Shield} onSelect={() => setMenuOpen(false)}>
                    Admin
                  </MenuItem>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logoutAndRedirect();
                  }}
                  className="flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-support text-ink-2 hover:bg-surface-2 hover:text-ink"
                >
                  <LogOut size={14} strokeWidth={1.75} aria-hidden />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  href,
  Icon,
  onSelect,
  children,
}: {
  href: string;
  Icon: typeof Mail;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2 rounded-control px-2.5 py-1.5 text-support text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden />
      {children}
    </Link>
  );
}
