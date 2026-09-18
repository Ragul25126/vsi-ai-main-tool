"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Bell, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/prompts", label: "Prompts" },
  { href: "/admin/cron-runs", label: "Cron" },
  { href: "/admin/qa", label: "QA" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap lg:flex-nowrap">
      {/* Logo with Super Admin Subtitle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-panel bg-ink text-white flex items-center justify-center /20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[17px] font-semibold text-slate-900 tracking-tight">SEOTool</span>
          </div>
          <span className="text-caption font-bold text-slate-400 block -mt-1">Super Admin</span>
        </div>
      </div>

      {/* Nav Pills */}
      <nav className="hidden xl:flex items-center bg-[#F1F4F9] rounded-full p-1 border border-slate-200/80">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
              isActive(href)
                ? "bg-ink text-white "
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side: Search bar + Notification + Super Admin profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search websites or reports..."
            className="bg-[#F1F4F9] border border-slate-200/80 rounded-full pl-9 pr-4 py-1.5 text-[12.5px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-line-strong w-56 lg:w-64 transition-all"
          />
        </div>

        {/* Bell Notification */}
        <button className="w-9 h-9 rounded-full bg-[#F1F4F9] border border-slate-200/80 flex items-center justify-center hover:bg-slate-200/70 transition-colors relative">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-ink rounded-full border border-white" />
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 bg-[#F1F4F9] border border-slate-200/80 rounded-full pr-3 pl-1 py-1 hover:bg-slate-200/60 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-surface-2 text-white flex items-center justify-center font-bold text-caption">
            SA
          </div>
          <span className="text-[12.5px] font-bold text-slate-700 hidden sm:inline">Super Admin</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </div>
  );
}
