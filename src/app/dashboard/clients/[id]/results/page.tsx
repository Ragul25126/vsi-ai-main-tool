import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { SERVICE_TYPE_LABELS, TRACK_TYPE_CONFIG } from "@/types/search";
import type { ServiceType, TrackType, StatusColor } from "@/types/search";
import StatusDot from "@/components/ui/StatusDot";
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";

const GAP_LABELS: Record<string, { dot: StatusColor; label: string; color: string; badge: string }> = {
 aligned: { dot: "green", label: "Aligned", color: "text-positive", badge: "border-positive/30 bg-positive/10" },
 aligned_no_mention: { dot: "blue", label: "Cited, Unnamed", color: "text-info", badge: "border-info/30 bg-info/10" },
 ai_mentioned: { dot: "blue", label: "AI-Mentioned", color: "text-info", badge: "border-info/30 bg-info/10" },
 search_strong_ai_invisible: { dot: "yellow", label: "AI-Invisible", color: "text-brand-strong", badge: "border-line bg-brand-soft" },
 weak_double_loss: { dot: "red", label: "Double Loss", color: "text-critical", badge: "border-critical/30 bg-critical/10" },
 geo_cited: { dot: "green", label: "GEO Cited & Named", color: "text-positive", badge: "border-positive/30 bg-positive/10" },
 geo_cited_no_mention: { dot: "blue", label: "GEO Cited, Unnamed", color: "text-info", badge: "border-info/30 bg-info/10" },
 geo_mentioned: { dot: "blue", label: "GEO Mentioned", color: "text-info", badge: "border-info/30 bg-info/10" },
 geo_invisible: { dot: "yellow", label: "GEO Invisible", color: "text-brand-strong", badge: "border-line bg-brand-soft" },
 geo_no_aio: { dot: "gray", label: "No AIO Trigger", color: "text-ink-3", badge: "border-line bg-surface-2" },
 seo_ranked: { dot: "green", label: "Ranked", color: "text-positive", badge: "border-positive/30 bg-positive/10" },
 seo_ranked_no_aio: { dot: "green", label: "Ranked, No AIO", color: "text-positive", badge: "border-positive/30 bg-positive/10" },
 seo_not_ranked: { dot: "red", label: "Not Ranked", color: "text-critical", badge: "border-critical/30 bg-critical/10" },
};

export default async function ResultsPage({
 params,
 searchParams,
}: {
 params: Promise<{ id: string }>;
 searchParams: Promise<{ page?: string; track?: string }>;
}) {
 const { id } = await params;
 const { page: pageParam, track: trackFilter } = await searchParams;
 const page = Math.max(1, parseInt(pageParam ?? "1", 10));
 const perPage = 30;
 const from = (page - 1) * perPage;

 const supabase = await createClient();
 const session = await requireAgency();

 const isSuperAdmin = session.role === "super_admin";
 const clientQ = supabase.from("clients").select("id, name, service_type").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQ : clientQ.eq("agency_id", session.agencyId)).single();

 if (!client) notFound();

 const svc = SERVICE_TYPE_LABELS[client.service_type as ServiceType];

 let query = supabase
 .from("search_results")
 .select("*", { count: "exact" })
 .eq("client_id", id)
 .order("created_at", { ascending: false })
 .range(from, from + perPage - 1);

 if (trackFilter && trackFilter !== "all") {
 query = query.eq("track_type", trackFilter);
 }

 const { data: results, count } = await query;
 const rows = results ?? [];
 const totalPages = Math.ceil((count ?? 0) / perPage);

 return (
 <div className="mx-auto w-full max-w-[1240px] animate-fade-in space-y-8 px-4 pb-24 pt-6 font-sans md:px-8 md:pt-9 xl:px-10">
 {/* Header */}
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-line pb-6">
 <div>
 <div className="flex items-center gap-2 mb-1.5 text-caption text-ink-3">
 <Link href={`/dashboard/clients/${id}`} className="hover:text-ink transition-colors flex items-center gap-1">
 <ArrowLeft size={13} />
 <span>{client.name}</span>
 </Link>
 <span className="text-ink-3">/</span>
 <span className="text-ink font-semibold">Citation Diagnostics</span>
 </div>
 <div className="flex items-center gap-3">
 <h1 className="text-display font-semibold text-ink">Check history</h1>
 <span className="rounded-control bg-brand-soft border border-line text-brand-strong px-3 py-0.5 text-caption font-mono font-semibold">
 {svc.short}
 </span>
 <span className="text-caption text-ink-3">{count ?? 0} Total Snapshots</span>
 </div>
 </div>

 {/* Track type filter */}
 <div className="flex items-center gap-1.5 bg-surface border border-line p-1.5 rounded-panel shadow-overlay w-fit">
 {["all", "seo", "geo", "both"].map((t) => {
 const active = (trackFilter ?? "all") === t;
 return (
 <Link
 key={t}
 href={`/dashboard/clients/${id}/results?track=${t}`}
 className={`rounded-panel px-4 py-1.5 text-caption font-mono font-semibold transition-all  ${
 active
 ? "bg-surface-2 text-ink scale-105"
 : "text-ink-3 hover:text-ink hover:bg-surface-2"
 }`}
 >
 {t === "all" ? "All Tracks" : TRACK_TYPE_CONFIG[t as TrackType]?.label ?? t}
 </Link>
 );
 })}
 </div>
 </div>

 {rows.length === 0 ? (
 <div className="rounded-panel border border-dashed border-line bg-surface p-16 text-center shadow-overlay">
 <Search size={36} className="text-brand-strong mx-auto mb-4" />
 <p className="text-lg font-heading font-semibold text-ink mb-1">No Diagnostic Results Found</p>
 <p className="text-caption text-ink-3 max-w-md mx-auto mb-6">
 Run the AI answer audit from the client overview to generate detailed rank position and citation snapshots.
 </p>
 <Link
 href={`/dashboard/clients/${id}`}
 className="inline-flex items-center gap-2 rounded-panel bg-surface-2 px-6 py-3 text-caption font-semibold text-ink transition-all"
 >
 ← BACK TO CLIENT OVERVIEW
 </Link>
 </div>
 ) : (
 <>
 <div className="rounded-panel border border-line bg-surface overflow-hidden shadow-overlay">
 {/* Table header */}
 <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3.5 bg-ink/40 text-caption font-semibold text-ink-3 border-b border-line">
 <div className="col-span-3">Keyword</div>
 <div className="col-span-1 text-center">Track</div>
 <div className="col-span-1 text-center">Google Rank</div>
 <div className="col-span-1 text-center">AIO Present</div>
 <div className="col-span-1 text-center">Client Cited</div>
 <div className="col-span-1 text-center">ChatGPT</div>
 <div className="col-span-3">Diagnostic Gap</div>
 <div className="col-span-1 text-right">Date</div>
 </div>

 {rows.map((r) => {
 const gap = GAP_LABELS[r.gap_label] ?? { dot: "gray" as StatusColor, label: r.gap_label, color: "text-ink-3", badge: "border-line bg-surface-2" };
 const tt = TRACK_TYPE_CONFIG[r.track_type as TrackType];
 return (
 <div
 key={r.id}
 className="border-t border-line hover:bg-surface-2 transition-all px-6 py-4 text-caption flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
 >
 {/* Keyword + domain */}
 <div className="sm:col-span-3 min-w-0">
 <p className="text-body font-heading font-semibold text-ink sm:truncate">{r.keyword}</p>
 <p className="text-caption text-ink-3 truncate mt-0.5">{r.domain}</p>
 </div>

 {/* Metrics columns */}
 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents font-mono">
 <div className="sm:col-span-1 sm:flex sm:justify-center">
 <span className="text-ink-3 sm:hidden">Track:</span>
 <span className={`rounded-control px-2 py-0.5 text-caption font-semibold bg-surface-2 border border-line ${tt?.color ?? "text-ink-3"}`}>
 {tt?.label ?? r.track_type}
 </span>
 </div>
 <div className="sm:col-span-1 sm:text-center font-semibold text-body">
 <span className="text-ink-3 font-normal sm:hidden">Rank:</span>{" "}
 {r.rank_position
 ? <span className="text-info">#{r.rank_position}</span>
 : <span className="text-ink-3">-</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-semibold">
 <span className="text-ink-3 font-normal sm:hidden">AIO:</span>{" "}
 {r.aio_present === null
 ? <span className="text-ink-3">-</span>
 : r.aio_present
 ? <span className="text-brand-strong">Yes</span>
 : <span className="text-ink-3">No</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-semibold">
 <span className="text-ink-3 font-normal sm:hidden">Cited:</span>{" "}
 {r.client_cited === null
 ? <span className="text-ink-3">-</span>
 : r.client_cited
 ? <span className="text-positive text-body">✓</span>
 : r.mentioned_in_text
 ? <span className="text-info">~</span>
 : <span className="text-critical/80">✗</span>}
 </div>
 <div className="sm:col-span-1 sm:text-center font-semibold">
 <span className="text-ink-3 font-normal sm:hidden">ChatGPT:</span>{" "}
 {!r.chatgpt_checked
 ? <span className="text-ink-3">-</span>
 : r.chatgpt_brand_cited
 ? <span className="text-positive text-body">✓</span>
 : r.chatgpt_brand_mentioned
 ? <span className="text-info">~</span>
 : <span className="text-critical/80">✗</span>}
 </div>
 </div>

 <div className="sm:col-span-3 flex items-center gap-2">
 <span className={`inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-caption font-mono font-semibold border ${gap.badge}`}>
 <StatusDot color={gap.dot} />
 <span className={gap.color}>{gap.label}</span>
 </span>
 </div>
 <div className="sm:col-span-1 sm:text-right text-ink-3">
 {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
 </div>
 </div>
 );
 })}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between pt-2 border-t border-line">
 <span className="text-caption text-ink-3">Page {page} of {totalPages}</span>
 <div className="flex gap-2">
 {page > 1 && (
 <Link
 href={`/dashboard/clients/${id}/results?page=${page - 1}&track=${trackFilter ?? "all"}`}
 className="inline-flex items-center gap-1 rounded-panel border border-line bg-surface hover:bg-surface-2 px-3.5 py-1.5 text-caption font-semibold text-ink-3 transition-all"
 >
 <ChevronLeft size={14} /> Prev
 </Link>
 )}
 {page < totalPages && (
 <Link
 href={`/dashboard/clients/${id}/results?page=${page + 1}&track=${trackFilter ?? "all"}`}
 className="inline-flex items-center gap-1 rounded-panel border border-line bg-surface hover:bg-surface-2 px-3.5 py-1.5 text-caption font-semibold text-ink-3 transition-all"
 >
 Next <ChevronRight size={14} />
 </Link>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
