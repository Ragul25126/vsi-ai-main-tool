"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Bell, Mail, Sun, Moon, User, LogOut, Settings, ChevronDown, ChevronRight, 
  Building2, Shield, Globe, LayoutDashboard, Search, Bot, ShieldCheck, Zap, 
  TrendingUp, Users, Sparkles, CheckSquare, FileText, Terminal, HelpCircle 
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useMessages } from "@/contexts/MessagesContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { logoutAndRedirect, getClientUser, syncOAuthSession } from "@/lib/auth-client";
import { getCustomClients } from "@/lib/client-store";

interface TopbarProps {
  userEmail: string;
  userRole: string;
  agencyName: string;
}

export default function Topbar({ userEmail, userRole, agencyName }: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [activeClientName, setActiveClientName] = useState("ValGrow Labs");
  const [activeClientDomain, setActiveClientDomain] = useState("valgrowlabs.com");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useMessages();

  // Sync client name from store
  useEffect(() => {
    const clients = getCustomClients();
    if (clients.length > 0) {
      setActiveClientName(clients[0].name || "ValGrow Labs");
      setActiveClientDomain(clients[0].website || "valgrowlabs.com");
    }
  }, []);

  // Determine current page title & icon based on route and query
  const pageInfo = React.useMemo(() => {
    const tab = searchParams.get("tab");

    if (pathname === "/dashboard") {
      return { title: "Overview Dashboard", Icon: LayoutDashboard, category: "Intelligence" };
    }
    if (pathname === "/dashboard/chat") {
      return { title: "AI Search Assistant", Icon: Bot, category: "Search AI" };
    }
    if (pathname === "/dashboard/check") {
      if (tab === "quick-check") return { title: "Search & AI Check", Icon: Search, category: "Diagnostics" };
      if (tab === "opportunities") return { title: "Next Actions", Icon: Zap, category: "Optimization" };
      if (tab === "aivisibility") return { title: "Pixel Rank Tracking", Icon: Sparkles, category: "Visibility" };
      return { title: "Site Audit & Diagnostics", Icon: ShieldCheck, category: "Audit" };
    }
    if (pathname === "/dashboard/services/seo") {
      return { title: "Rank Tracking", Icon: TrendingUp, category: "Rankings" };
    }
    if (pathname === "/dashboard/competitors") {
      return { title: "Competitor Analysis", Icon: Users, category: "Intelligence" };
    }
    if (pathname === "/dashboard/tasks") {
      return { title: "Action Board", Icon: CheckSquare, category: "Execution" };
    }
    if (pathname === "/dashboard/clients") {
      return { title: "Client Reports", Icon: FileText, category: "Reporting" };
    }
    if (pathname === "/dashboard/prompts") {
      return { title: "AI Search Simulator", Icon: Terminal, category: "Grounding" };
    }
    if (pathname === "/dashboard/help") {
      return { title: "Help Center & FAQs", Icon: HelpCircle, category: "Support" };
    }
    if (pathname === "/dashboard/settings") {
      return { title: "Project Settings", Icon: Settings, category: "Configuration" };
    }
    if (pathname === "/dashboard/feedback") {
      return { title: "Feedback & Requests", Icon: Mail, category: "Support" };
    }
    if (pathname.startsWith("/admin")) {
      return { title: "Super Admin Console", Icon: Shield, category: "Administration" };
    }
    return { title: "Search Intelligence", Icon: Globe, category: "VSI" };
  }, [pathname, searchParams]);

  // Sync authenticated user data from client auth state and OAuth payload
  useEffect(() => {
    const activeUser = syncOAuthSession() || getClientUser();
    if (activeUser?.email) {
      setCurrentUserEmail(activeUser.email);
    } else if (userEmail) {
      setCurrentUserEmail(userEmail);
    }
    if (activeUser?.name) {
      setCurrentUserName(activeUser.name);
    }
  }, [userEmail]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSignOut() {
    setShowProfileMenu(false);
    logoutAndRedirect();
  }

  const displayName = React.useMemo(() => {
    if (currentUserName) return currentUserName;
    const localPart = (currentUserEmail || "").split("@")[0] || "";
    return localPart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [currentUserEmail, currentUserName]);

  const initials = React.useMemo(() => {
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  const PageIcon = pageInfo.Icon;

  return (
    <header className="w-full shrink-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-card border-b border-border transition-colors">
      
      {/* ── Left Area: Dynamic Context & Breadcrumbs ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        
        {/* Active Client / Workspace Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs font-bold text-foreground shrink-0 shadow-2xs">
          <Building2 size={13} className="text-[#FF5A1F]" />
          <span className="truncate max-w-[130px]">{activeClientName}</span>
        </div>

        <ChevronRight size={13} className="text-muted-foreground hidden md:block shrink-0 opacity-50" />

        {/* Current Active Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0 text-[#FF5A1F]">
            <PageIcon size={13} />
          </div>
          <h2 className="text-xs sm:text-sm font-black text-foreground truncate tracking-tight">
            {pageInfo.title}
          </h2>
        </div>

        {/* Active Website Domain Chip */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold shrink-0">
          <Globe size={11} />
          <span className="truncate">{activeClientDomain}</span>
        </div>

      </div>

      {/* Right: Quick actions, live status pill, theme toggle & user profile */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Live AI Engine Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AI Engine Active</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <NotificationDropdown />

          <Link
            href="/dashboard/messages"
            className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-bg transition-colors"
            aria-label="Messages"
          >
            <Mail size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-full border border-border bg-muted-bg/30 hover:bg-muted-bg transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shadow-2xs">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-none">{displayName}</span>
              <span className="text-[10px] text-muted-foreground capitalize leading-tight mt-0.5">{userRole}</span>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-bold text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUserEmail}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Building2 size={10} />
                  <span>{agencyName}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted-bg rounded-xl transition-colors"
                >
                  <Settings size={14} />
                  <span>Settings & Agency Profile</span>
                </Link>

                {userRole === "super_admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
                  >
                    <Shield size={14} />
                    <span>Super Admin Console</span>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
