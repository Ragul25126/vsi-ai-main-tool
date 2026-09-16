"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, Search, Plus, LogOut, ShieldCheck, Menu, Settings, 
  CheckSquare, ChevronRight, ChevronDown, ChevronUp, Users, Terminal, 
  MessageSquare, Sparkles, Layers, PanelLeftClose, PanelLeftOpen, 
  FileText, HelpCircle, TrendingUp, Zap, Bot, Globe, Shield, ExternalLink, ArrowUp
} from "lucide-react";
import { ServiceType } from "@/types/search";
import type { UserRole } from "@/lib/auth";
import { logoutAndRedirect, getClientUser } from "@/lib/auth-client";
import { getCustomClients } from "@/lib/client-store";

interface ClientEntry {
  id: string;
  name: string;
  service_type: ServiceType;
  agencyName?: string | null;
  website?: string | null;
}

interface Props {
  agencyName: string;
  agencyLogoUrl?: string | null;
  clients: ClientEntry[];
  userRole: UserRole;
  userEmail: string;
  atClientCap?: boolean;
  showSidebarProfile?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  tooltip?: string;
  Icon: React.ElementType;
  badge?: {
    text: string;
    variant: "orange" | "green" | "blue";
  };
}

interface NavSection {
  id: string;
  title: string;
  Icon: React.ElementType;
  items: NavItem[];
}

export default function Sidebar({
  agencyName,
  agencyLogoUrl,
  clients,
  userRole,
  userEmail,
  atClientCap = false,
  showSidebarProfile = true,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);
  const [localAgencyName, setLocalAgencyName] = useState<string | null>(null);
  
  // Section collapsible state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    analyze: true,
    execution: true,
  });

  const [displayedClients, setDisplayedClients] = useState<ClientEntry[]>(clients);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const clientSelectorRef = useRef<HTMLDivElement>(null);

  // Close client selector on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientSelectorRef.current && !clientSelectorRef.current.contains(event.target as Node)) {
        setShowClientSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync clients from store
  useEffect(() => {
    const updateClients = () => {
      const custom = getCustomClients();
      const customEntries: ClientEntry[] = custom.map((c) => ({
        id: c.id,
        name: c.name,
        service_type: (c.service_type || "geo") as ServiceType,
        agencyName: null,
        website: c.website || null,
      }));
      const serverIds = new Set(clients.map((c) => c.id));
      const combined = [...clients, ...customEntries.filter((c) => !serverIds.has(c.id))];
      setDisplayedClients(combined);
    };

    updateClients();
    window.addEventListener("storage", updateClients);
    window.addEventListener("clients_updated", updateClients);
    return () => {
      window.removeEventListener("storage", updateClients);
      window.removeEventListener("clients_updated", updateClients);
    };
  }, [clients]);

  useEffect(() => { setOpen(false); }, [pathname, searchParams]);

  useEffect(() => {
    const clientUser = getClientUser();
    if (clientUser?.email) {
      setCurrentUserEmail(clientUser.email);
    } else if (userEmail) {
      setCurrentUserEmail(userEmail);
    }
  }, [userEmail]);

  // Read agency logo & name from localStorage
  useEffect(() => {
    const readBranding = () => {
      const storedLogo = localStorage.getItem("searchintel_agency_logo");
      const storedName = localStorage.getItem("searchintel_agency_name");
      setLocalLogoUrl(storedLogo ?? null);
      setLocalAgencyName(storedName ?? null);
    };
    readBranding();
    window.addEventListener("storage", readBranding);
    return () => window.removeEventListener("storage", readBranding);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  function handleSignOut() {
    logoutAndRedirect();
  }

  const currentTab = searchParams.get("tab");

  // Determine active state with tab support
  const isActive = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    
    if (targetQuery) {
      const targetParams = new URLSearchParams(targetQuery);
      const targetTab = targetParams.get("tab");
      
      if (targetTab) {
        return pathname === targetPath && currentTab === targetTab;
      }
      return pathname === targetPath && searchParams.toString() === targetQuery;
    }
    
    if (pathname === targetPath) {
      if (currentTab && href === "/dashboard/check") return false;
      return true;
    }
    
    return false;
  };

  // Active client detection from URL
  const selectedClientId = pathname.startsWith("/dashboard/clients/")
    ? pathname.split("/")[3]
    : searchParams.get("client") || (displayedClients[0]?.id ?? null);

  const activeClient = displayedClients.find((c) => c.id === selectedClientId) || displayedClients[0];

  // Ubersuggest-inspired Navigation Sections
  const navSections: NavSection[] = [
    {
      id: "analyze",
      title: "Analyze and Audit",
      Icon: BarChart3Icon,
      items: [
        { 
          href: "/dashboard/chat", 
          label: "AI Chat", 
          tooltip: "Ask VSI Assistant about rankings & citation opportunities", 
          Icon: Bot,
        },
        { 
          href: "/dashboard", 
          label: "Dashboard", 
          tooltip: "Overall SEO & AI visibility performance", 
          Icon: LayoutDashboard,
        },
        { 
          href: "/dashboard/check", 
          label: "Site Audit", 
          tooltip: "Technical SEO & AI visibility diagnostics", 
          Icon: ShieldCheck,
        },
        { 
          href: "/dashboard/check?tab=quick-check", 
          label: "Search & AI Check", 
          tooltip: "Live real-time check across Google Search & AI Overviews", 
          Icon: Search,
        },
        { 
          href: "/dashboard/check?tab=opportunities", 
          label: "Next Actions", 
          tooltip: "High-impact citation & ranking opportunities", 
          Icon: Zap,
          badge: { text: "NEW!", variant: "orange" },
        },
        { 
          href: "/dashboard/services/seo", 
          label: "Rank Tracking", 
          tooltip: "Daily Google search rankings and positions", 
          Icon: TrendingUp,
          badge: { text: "REVAMPED", variant: "orange" },
        },
        { 
          href: "/dashboard/competitors", 
          label: "Competitor Analysis", 
          tooltip: "Compare AI citations and keyword share with competitors", 
          Icon: Users,
        },
        { 
          href: "/dashboard/check?tab=aivisibility", 
          label: "Pixel Rank Tracking", 
          tooltip: "Track Google AI Overview & ChatGPT citations", 
          Icon: Sparkles,
          badge: { text: "NEW!", variant: "orange" },
        },
        { 
          href: "/dashboard/settings", 
          label: "Project Settings", 
          tooltip: "Manage client settings, keywords, and engine configurations", 
          Icon: Settings,
        },
      ],
    },
    {
      id: "ai_visibility_section",
      title: "AI Search Visibility",
      Icon: Layers,
      items: [
        { 
          href: "/dashboard/tasks", 
          label: "Action Board", 
          tooltip: "Kanban task execution & verified outcomes", 
          Icon: CheckSquare,
        },
        { 
          href: "/dashboard/clients", 
          label: "Client Reports", 
          tooltip: "Generate and export client-ready strategy reports", 
          Icon: FileText,
        },
        { 
          href: "/dashboard/prompts", 
          label: "AI Prompts & SERP", 
          tooltip: "Simulate queries across Google and ChatGPT", 
          Icon: Terminal,
        },
      ],
    },
  ];

  const filteredClients = displayedClients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden bg-card select-none">
      
      {/* ── 1. Brand Header ── */}
      <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-2 py-3 px-2" : "justify-between px-4 py-3.5"} border-b border-border/70 bg-card shrink-0 z-10`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group" title={isCollapsed ? "VSI — ValGrow Search Intelligence" : undefined}>
          <div className="relative flex-shrink-0 p-1 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 shadow-xs">
            <Image src="/vg-logo.png" alt="VSI" width={26} height={26} className="shrink-0 rounded-md object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-foreground tracking-tight leading-none group-hover:text-[#FF5A1F] transition-colors">
                  VSI
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/25 leading-none">
                  PRO
                </span>
              </div>
              <p className="mt-1 text-[9px] font-semibold text-muted-foreground tracking-wider uppercase truncate leading-none">
                Search Intelligence
              </p>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(false)}
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close sidebar"
          >
            <span className="text-xs font-mono">✕</span>
          </button>
          <button
            onClick={toggleCollapse}
            type="button"
            className="hidden md:flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      {/* ── 2. Project / Client Context Selector (Ubersuggest Style) ── */}
      {!isCollapsed ? (
        <div className="p-3 border-b border-border/70 bg-muted/20 shrink-0 space-y-2.5">
          <div className="relative" ref={clientSelectorRef}>
            <button
              type="button"
              onClick={() => setShowClientSelector(!showClientSelector)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/90 hover:border-[#FF5A1F]/40 shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  {activeClient?.name ? activeClient.name.charAt(0).toUpperCase() : "V"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-[#FF5A1F] transition-colors">
                      {activeClient?.name || "ValGrow Labs"}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {activeClient?.website || "valgrowlabs.com"}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${showClientSelector ? "rotate-180 text-[#FF5A1F]" : ""}`} />
            </button>

            {/* Dropdown Menu (Solid, Opaque & High-Z Elevation) */}
            {showClientSelector && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-border shadow-2xl p-2.5 space-y-2 animate-in fade-in-50 zoom-in-95">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search project..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-muted/50 rounded-lg border border-slate-200 dark:border-border focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-foreground"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredClients.map((client) => {
                    const isSelected = client.id === activeClient?.id;
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setShowClientSelector(false);
                          router.push(`/dashboard?client=${client.id}`);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF4ED] dark:bg-[#FF5A1F]/15 text-[#FF5A1F] font-bold"
                            : "text-foreground hover:bg-slate-100 dark:hover:bg-muted font-medium"
                        }`}
                      >
                        <span className="truncate">{client.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1.5 border-t border-slate-100 dark:border-border flex items-center justify-between">
                  <Link
                    href="/dashboard/clients/new"
                    prefetch={true}
                    onClick={() => setShowClientSelector(false)}
                    className="text-[11px] font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add New Project
                  </Link>
                  <Link
                    href="/dashboard/clients"
                    prefetch={true}
                    onClick={() => setShowClientSelector(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                  >
                    View All →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Prominent + Add Project Button (Ubersuggest Style) */}
          <div>
            <Link
              href="/dashboard/clients/new"
              prefetch={true}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Add Project</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-border/70 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={toggleCollapse}
            title={`Active: ${activeClient?.name || "ValGrow Labs"}`}
            className="w-8 h-8 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-xs shadow-xs"
          >
            {activeClient?.name ? activeClient.name.charAt(0).toUpperCase() : "V"}
          </button>
          <Link
            href="/dashboard/clients/new"
            title="Add New Project"
            className="w-8 h-8 rounded-lg bg-[#FF5A1F]/10 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
          >
            <Plus size={14} className="stroke-[2.5]" />
          </Link>
        </div>
      )}

      {/* ── 3. Main Navigation Stream (Ubersuggest Information Architecture) ── */}
      <nav className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? "px-1.5" : "px-3"} py-3 space-y-5 custom-scrollbar`}>
        
        {/* Super Admin Access Banner (if superadmin) */}
        {userRole === "super_admin" && (
          <div className="space-y-1">
            <Link
              href="/admin"
              title={isCollapsed ? "Super Admin Console" : undefined}
              className={`flex items-center ${isCollapsed ? "justify-center p-2" : "justify-between gap-2 px-3 py-2"} rounded-xl text-xs transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-[#FF5A1F] text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-muted font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className={pathname.startsWith("/admin") ? "text-white" : "text-amber-500"} />
                {!isCollapsed && <span>Super Admin</span>}
              </div>
              {!isCollapsed && <ChevronRight size={13} className="opacity-70" />}
            </Link>
          </div>
        )}

        {/* Section Groups */}
        {navSections.map((section) => {
          const isOpen = openSections[section.id] ?? true;
          const SectionIcon = section.Icon;

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header Button (Collapsible) */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon size={16} className="text-slate-500 group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-bold tracking-tight">
                      {section.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={14} className="text-slate-400 group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-foreground transition-colors" />
                  )}
                </button>
              )}

              {/* Section Items */}
              {(isOpen || isCollapsed) && (
                <div className="space-y-0.5 pt-0.5">
                  {section.items.map(({ href, label, tooltip, Icon, badge }) => {
                    const active = isActive(href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        prefetch={true}
                        title={tooltip || label}
                        className={`
                          relative flex items-center transition-all duration-150 rounded-lg group
                          ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2 text-xs"}
                          ${active 
                            ? "bg-[#FFF4ED] dark:bg-[#FF5A1F]/15 text-[#FF5A1F] font-bold border-r-[3px] border-[#FF5A1F] rounded-r-none" 
                            : "text-slate-600 dark:text-slate-300 hover:bg-muted/70 hover:text-foreground font-medium"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon 
                            size={16} 
                            className={`shrink-0 transition-colors ${
                              active 
                                ? "text-[#FF5A1F]" 
                                : "text-slate-400 group-hover:text-foreground"
                            }`} 
                          />
                          {!isCollapsed && (
                            <span className="truncate">{label}</span>
                          )}
                        </div>

                        {/* Badges (NEW!, LIVE, etc. as in Ubersuggest reference) */}
                        {!isCollapsed && badge && (
                          <span className={`
                            text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0 shadow-2xs
                            ${badge.variant === "orange" ? "bg-[#FF5A1F] text-white" : ""}
                            ${badge.variant === "green" ? "bg-emerald-500 text-white" : ""}
                            ${badge.variant === "blue" ? "bg-blue-600 text-white" : ""}
                          `}>
                            {badge.text}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Support & Configuration Links */}
        <div className="pt-2 border-t border-border/70 space-y-0.5">
          {!isCollapsed && (
            <p className="px-2.5 text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase mb-1">
              SUPPORT & FEEDBACK
            </p>
          )}
          <Link
            href="/dashboard/feedback"
            prefetch={true}
            className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-1.5"} rounded-lg text-xs text-slate-500 hover:text-foreground hover:bg-muted transition-colors`}
            title="Feedback & Feature Requests"
          >
            <MessageSquare size={15} />
            {!isCollapsed && <span>Feedback</span>}
          </Link>
          <Link
            href="/dashboard/help"
            prefetch={true}
            className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-1.5"} rounded-lg text-xs ${
              pathname === "/dashboard/help" ? "bg-[#FFF4ED] dark:bg-[#FF5A1F]/15 text-[#FF5A1F] font-bold" : "text-slate-500 hover:text-foreground hover:bg-muted"
            } transition-colors`}
            title="Help Center, Guides & FAQs"
          >
            <HelpCircle size={15} className={pathname === "/dashboard/help" ? "text-[#FF5A1F]" : ""} />
            {!isCollapsed && <span>Help Center</span>}
          </Link>
        </div>
      </nav>


      {/* ── 4. Bottom User Profile & Workspace Status ── */}
      {showSidebarProfile && (
        <div className={`p-3 border-t border-border/70 bg-card shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/30 border border-border/60">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate" title={currentUserEmail}>
                  {currentUserEmail}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold capitalize">
                  {userRole.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                type="button"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              type="button"
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground bg-card hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Image src="/vg-logo.png" alt="VSI" width={24} height={24} className="rounded object-contain" />
          <span className="text-sm font-bold text-foreground">VSI SearchIntel</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground truncate max-w-[45%]">
          {activeClient?.name || agencyName}
        </span>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
          aria-hidden
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          flex flex-col bg-card border-r border-border/80 
          fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30
          ${isCollapsed ? "md:w-16 w-64" : "w-64"} h-screen max-h-screen shrink-0 overflow-hidden
          transition-all duration-200 ease-out shadow-2xl md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        suppressHydrationWarning
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function BarChart3Icon(props: React.ComponentProps<typeof BarChart3>) {
  return <BarChart3 {...props} />;
}
import { BarChart3 } from "lucide-react";
