"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Key, Globe, ChevronDown, Plus, ExternalLink } from "lucide-react";

const MOCK_AGENCIES = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Valgrow Enterprise",
    slug: "valgrow-enterprise",
    is_pilot: false,
    is_disabled: false,
    max_keywords: 999,
    max_clients: null,
    created_at: "2026-01-01",
    clients: [
      { id: "valgrow-labs-001", name: "Valgrow Labs", brand_name: "Valgrow Labs", website: "valgrowlabs.com", service_type: "seo_geo" },
    ],
    keywords: 0,
  },
];

const SERVICE_COLORS: Record<string, string> = {
  seo: "bg-blue-50 text-blue-600 border-blue-200",
  geo: "bg-orange-50 text-brand-strong border-orange-200",
};

export default function AgenciesPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const totalClients = MOCK_AGENCIES.reduce((s, a) => s + a.clients.length, 0);
  const totalKeywords = MOCK_AGENCIES.reduce((s, a) => s + a.keywords, 0);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-panel bg-brand-soft border border-line-strong flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand-strong" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agencies</h1>
            <p className="text-sm text-slate-500 mt-0.5">Every tenant on the platform. Click a row to see clients.</p>
          </div>
        </div>
        <Link
          href="/admin/invites"
          className="flex items-center gap-2 bg-ink hover:bg-[#e04800] text-white text-sm font-semibold px-4 py-2.5 rounded-panel transition-colors /20"
        >
          <Plus className="w-4 h-4" />
          New Invite
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Agencies", value: MOCK_AGENCIES.length, sub: `${MOCK_AGENCIES.filter(a => a.is_pilot).length} pilot`, color: "text-brand-strong", bg: "bg-orange-50", border: "border-orange-200", Icon: Building2 },
          { label: "Total Clients", value: totalClients, sub: "across all agencies", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", Icon: Users },
          { label: "Keywords", value: totalKeywords, sub: "being tracked", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", Icon: Key },
        ].map(({ label, value, sub, color, bg, border, Icon }) => (
          <div key={label} className={`bg-white border ${border} rounded-panel p-5 flex items-center gap-4   transition-shadow`}>
            <div className={`w-11 h-11 rounded-panel ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
              <p className="text-caption text-slate-500 font-bold tracking-wide">{label}</p>
              <p className="text-caption text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agencies list */}
      <div className="space-y-3">
        {MOCK_AGENCIES.map((agency) => {
          const isOpen = expanded.has(agency.id);
          return (
            <div key={agency.id} className="bg-white border border-slate-200/80 rounded-panel overflow-hidden transition-shadow">
              {/* Row header */}
              <button
                onClick={() => toggleExpand(agency.id)}
                className="flex items-center gap-4 px-6 py-4 w-full text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-panel bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 group-hover:border-line-strong transition-colors">
                  <span className="text-base font-semibold text-brand-strong">{agency.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-bold text-slate-900">{agency.name}</h3>
                    <span className="text-caption text-slate-400">/{agency.slug}</span>
                    {agency.is_pilot && (
                      <span className="text-caption px-2.5 py-0.5 rounded-full bg-attention-soft text-attention border border-line font-semibold">Pilot</span>
                    )}
                    {agency.is_disabled && (
                      <span className="text-caption px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold">Disabled</span>
                    )}
                    {!agency.is_disabled && !agency.is_pilot && (
                      <span className="text-caption px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">Active</span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400 mt-0.5">Created {agency.created_at}</p>
                </div>
                <div className="flex items-center gap-6 text-center shrink-0">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{agency.clients.length}</p>
                    <p className="text-caption text-slate-400 tracking-wide font-semibold">Clients</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{agency.keywords}</p>
                    <p className="text-caption text-slate-400 tracking-wide font-semibold">Keywords</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-700">{agency.max_keywords}</p>
                    <p className="text-caption text-slate-400 tracking-wide font-semibold">Max KW</p>
                  </div>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Clients sub-list */}
              {isOpen && agency.clients.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/60">
                  <p className="text-caption text-slate-400 font-bold mb-3">Clients ({agency.clients.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {agency.clients.map(c => (
                      <Link
                        key={c.id}
                        href={`/admin/clients/${c.id}`}
                        className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border ${SERVICE_COLORS[c.service_type] ?? SERVICE_COLORS.seo} hover:opacity-80 transition-all font-semibold`}
                      >
                        <Globe className="w-3 h-3" />
                        {c.brand_name ?? c.name}
                        <span className="text-caption opacity-60">· {c.service_type.toUpperCase()}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && agency.clients.length === 0 && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/60">
                  <p className="text-[12px] text-slate-400">No clients registered yet.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
