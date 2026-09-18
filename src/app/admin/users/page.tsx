"use client";

import { useState } from "react";
import { Users, Shield, UserX, UserCheck, Building2, Calendar, Mail, Search } from "lucide-react";

const MOCK_USERS = [
  { id: "00000000-0000-0000-0000-000000000002", email: "admin@valgrow.com", full_name: "Valgrow Admin", role: "super_admin", agency_name: "Valgrow Enterprise", is_disabled: false, agency_is_disabled: false, created_at: "2026-01-01" },
];

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-orange-50 text-[#FF5500] border-orange-200",
  admin: "bg-blue-50 text-blue-600 border-blue-200",
  member: "bg-emerald-50 text-emerald-600 border-emerald-200",
  viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

const ROLE_FILTERS = ["all", "super_admin", "admin", "member", "viewer"];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const q = search.trim().toLowerCase();
  const filtered = MOCK_USERS.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (q && !u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.agency_name.toLowerCase().includes(q)) return false;
    return true;
  });

  const counts = {
    total: MOCK_USERS.length,
    active: MOCK_USERS.filter(u => !u.is_disabled).length,
    disabled: MOCK_USERS.filter(u => u.is_disabled).length,
    admins: MOCK_USERS.filter(u => u.role === "admin" || u.role === "super_admin").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">All registered accounts. Disable to revoke access without deleting.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, Icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Active", value: counts.active, Icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Disabled", value: counts.disabled, Icon: UserX, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
          { label: "Admins", value: counts.admins, Icon: Shield, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-2xl p-5 flex items-center gap-3 shadow-xs hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide font-bold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        {/* Role pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1 border border-slate-200/80">
          {ROLE_FILTERS.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 text-[12px] font-bold rounded-full transition-all capitalize ${
                roleFilter === role
                  ? "bg-[#FF5500] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {role === "all" ? "All" : role.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5500] w-64 shadow-xs transition-colors"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/60">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Agency</div>
          <div className="col-span-1 text-center">Role</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Joined</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-400">No users match your filters.</div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className={`grid grid-cols-12 gap-2 px-6 py-3.5 items-center border-t border-slate-100 hover:bg-slate-50/60 transition-colors ${user.is_disabled ? "opacity-50" : ""}`}
            >
              {/* Name + avatar */}
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-600">{(user.full_name ?? "?").charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{user.full_name ?? "—"}</p>
                </div>
              </div>

              {/* Email */}
              <div className="col-span-3 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[12px] text-slate-600 truncate">{user.email ?? "—"}</span>
              </div>

              {/* Agency */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[12px] text-slate-600 truncate">{user.agency_name ?? "—"}</span>
                </div>
              </div>

              {/* Role badge */}
              <div className="col-span-1 flex justify-center">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ROLE_BADGE[user.role ?? "member"] ?? ROLE_BADGE.member}`}>
                  {(user.role ?? "member").replace("_", " ")}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 flex justify-center">
                {user.is_disabled ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                    <UserX className="w-3.5 h-3.5" />
                    Off
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <UserCheck className="w-3.5 h-3.5" />
                    On
                  </span>
                )}
              </div>

              {/* Joined */}
              <div className="col-span-2 flex justify-end">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {user.created_at}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
