"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Globe,
  ExternalLink,
  MapPin,
  Tag,
  TrendingUp,
  Sparkles,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCustomClients, saveCustomClient, ClientItem } from "@/lib/client-store";

const VALGROW_LABS_CLIENT: ClientItem = {
  id: "valgrow-labs-001",
  name: "Valgrow Labs",
  brand_name: "Valgrow Labs",
  website: "valgrowlabs.com",
  service_type: "seo_geo",
  country: "United Arab Emirates",
  industry: "Technology / SaaS",
  default_location: "ae",
  keywords: 8,
  winRate: 63,
  tasks: 2,
};

const SERVICE_BADGE: Record<string, { label: string; color: string }> = {
  seo: { label: "SEO", color: "bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40" },
  geo: { label: "GEO", color: "bg-orange-50 dark:bg-orange-950/50 text-[#FF5A1F] dark:text-orange-400 border border-orange-200 dark:border-orange-900/40" },
  seo_geo: { label: "SEO + GEO", color: "bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-400 border border-purple-200 dark:border-purple-900/40" },
};

const AVATAR_COLORS = [
  "from-[#FF5A1F] to-[#FF8C42]",
  "from-[#2563EB] to-[#60A5FA]",
  "from-[#10B981] to-[#34D399]",
  "from-[#7C3AED] to-[#A78BFA]",
  "from-[#F59E0B] to-[#FBBF24]",
];

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);

  useEffect(() => {
    async function loadClients() {
      const custom = getCustomClients();
      const supabase = createClient();
      let dbClients: ClientItem[] = [];

      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, brand_name, website, service_type, country, industry, default_location, created_at");

        if (!error && data) {
          dbClients = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            brand_name: c.brand_name || c.name,
            website: c.website || "",
            service_type: c.service_type || "seo_geo",
            country: c.country || "United Arab Emirates",
            industry: c.industry || "Technology / SaaS",
            default_location: c.default_location || "ae",
            keywords: 8,
            winRate: 63,
            tasks: 2,
            created_at: c.created_at,
          }));
        }
      } catch (err) {
        console.error("Error loading clients from Supabase:", err);
      }

      // Merge Supabase DB clients and local custom clients (deduplicated by ID)
      const mergedMap = new Map<string, ClientItem>();
      dbClients.forEach((c) => mergedMap.set(c.id, c));
      custom.forEach((c) => {
        if (!mergedMap.has(c.id)) {
          mergedMap.set(c.id, c);
        }
      });

      const DEMO_DOMAINS = new Set([
        "zomato.com", "vgdigital.ae", "seo.ae", "vgdigital.com", "athariw.com",
        "tap.company", "alex.sa", "trial.valgrow.com", "menacyberwire.com",
        "testb4pilot.com", "chrismcelroy.com", "acme.com", "unitedseo.ae", "valgrowing.com"
      ]);

      let list = Array.from(mergedMap.values()).filter((c) => {
        const w = (c.website || "").toLowerCase().trim();
        const n = (c.name || "").toLowerCase().trim();
        return !DEMO_DOMAINS.has(w) && n !== "zomato" && n !== "vg" && n !== "seo" && n !== "vg digital" && n !== "athariw" && n !== "tap payments" && n !== "alex";
      });

      // If list is empty, initialize our real client Valgrow Labs
      if (list.length === 0) {
        list = [VALGROW_LABS_CLIENT];
        saveCustomClient(VALGROW_LABS_CLIENT);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
            if (profile?.agency_id) {
              await supabase.from("clients").insert({
                name: VALGROW_LABS_CLIENT.name,
                brand_name: VALGROW_LABS_CLIENT.brand_name,
                website: VALGROW_LABS_CLIENT.website,
                service_type: VALGROW_LABS_CLIENT.service_type,
                country: VALGROW_LABS_CLIENT.country,
                industry: VALGROW_LABS_CLIENT.industry,
                default_location: VALGROW_LABS_CLIENT.default_location,
                agency_id: profile.agency_id,
              });
            }
          }
        } catch {}
      }

      setClientsList(list);
    }

    loadClients();

    window.addEventListener("storage", loadClients);
    window.addEventListener("clients_updated", loadClients);
    return () => {
      window.removeEventListener("storage", loadClients);
      window.removeEventListener("clients_updated", loadClients);
    };
  }, []);

  const filtered = clientsList.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.brand_name || "").toLowerCase().includes(q) ||
      (c.website || "").toLowerCase().includes(q) ||
      (c.industry || "").toLowerCase().includes(q) ||
      (c.country || "").toLowerCase().includes(q)
    );
  });

  const avgWin = clientsList.length > 0 ? Math.round(clientsList.reduce((s, c) => s + (c.winRate || 0), 0) / clientsList.length) : 63;
  const totalKw = clientsList.reduce((s, c) => s + (c.keywords || 0), 0);
  const seoCount = clientsList.filter((c) => c.service_type === "seo" || c.service_type === "seo_geo").length;
  const geoCount = clientsList.filter((c) => c.service_type === "geo" || c.service_type === "seo_geo").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background animate-fadeIn pb-12">
      
      {/* ── 1. CLEAN TOP HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Icon + Eyebrow + Title + Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] border border-orange-100/80 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 size={24} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#FF5A1F]">
              PORTFOLIO &amp; WORKSPACES
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
              Clients
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-medium">
              Manage client domains, track organic and AI search visibility, and export strategy briefs.
            </p>
          </div>
        </div>

        {/* Right: Search + Add Client CTA */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl pl-9.5 pr-4 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] shadow-2xs"
            />
          </div>

          <Link
            href="/dashboard/clients/new"
            className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04D16] text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Client</span>
          </Link>
        </div>

      </div>

      {/* ── 2. TOP 4 KPI CARDS ROW (Exact Palette & Soft Borders) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Clients */}
        <div className="bg-[#FFF9F5] dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-4.5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-100/90 dark:bg-orange-900/50 text-[#FF5A1F] flex items-center justify-center shrink-0">
            <Users size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Clients
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none">
              {clientsList.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              across your agency
            </p>
          </div>
        </div>

        {/* Card 2: SEO Clients */}
        <div className="bg-[#F5F9FF] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4.5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100/90 dark:bg-blue-900/50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Search size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SEO Clients
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none">
              {seoCount}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              search &amp; rank focused
            </p>
          </div>
        </div>

        {/* Card 3: GEO Clients */}
        <div className="bg-[#FAF7FE] dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-4.5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100/90 dark:bg-purple-900/50 text-[#7C3AED] flex items-center justify-center shrink-0">
            <Globe size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GEO Clients
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none">
              {geoCount}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              AI engine visibility
            </p>
          </div>
        </div>

        {/* Card 4: Avg Win Rate */}
        <div className="bg-[#F4FBF7] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4.5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/50 text-[#16A34A] flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg AI Win Rate
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none">
              {avgWin}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {totalKw > 0 ? `${totalKw} tracked keywords` : "healthy visibility"}
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. CLIENTS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
        
        {filtered.map((client, idx) => {
          const svc = SERVICE_BADGE[client.service_type] ?? SERVICE_BADGE.seo_geo;
          const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];

          return (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-orange-300 dark:hover:border-orange-800 rounded-2xl p-5 transition-all duration-200 hover:shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Row: Avatar + Service Pill */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-extrabold text-base shadow-2xs shrink-0`}>
                    {client.brand_name.charAt(0)}
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${svc.color}`}>
                    {svc.label}
                  </span>
                </div>

                {/* Name + Website */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-foreground group-hover:text-[#FF5A1F] transition-colors leading-tight">
                  {client.brand_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1 mt-1 font-medium truncate">
                  <Globe size={12} className="text-slate-400 shrink-0" />
                  <span>{client.website || "No domain set"}</span>
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-muted-foreground mt-3 font-semibold">
                  {client.industry && (
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-muted px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-border">
                      <Tag size={11} className="text-slate-400" />
                      <span>{client.industry}</span>
                    </span>
                  )}
                  {client.country && (
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-muted px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-border">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{client.country}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress & Bottom Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">AI Win Rate</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{client.winRate || 63}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${client.winRate || 63}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-muted-foreground pt-1">
                  <span>{client.keywords || 8} keywords</span>
                  <span className="text-[#FF5A1F] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open client <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Add New Client Card */}
        <Link
          href="/dashboard/clients/new"
          className="group bg-white dark:bg-card border-2 border-dashed border-slate-200 dark:border-border hover:border-orange-300 dark:hover:border-orange-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-xs min-h-[220px] text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-foreground group-hover:text-[#FF5A1F] transition-colors">
              Add New Client
            </p>
            <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5 max-w-[180px]">
              Onboard a new client domain to run full AI &amp; SERP audits
            </p>
          </div>
        </Link>

      </div>

    </div>
  );
}
