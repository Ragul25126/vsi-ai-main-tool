import { createClient } from "@/lib/supabase/server";
import InviteCreator from "@/components/admin/InviteCreator";

export default async function InvitesPage() {
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("id, code, email, role, max_keywords, note, is_active, used_by, used_at, created_at")
    .order("created_at", { ascending: false });

  const rows = invites ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invites</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate codes to onboard pilot users or new admins.</p>
      </div>

      <InviteCreator />

      <div className="rounded-panel border border-slate-200/80 overflow-hidden bg-white">
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50/70 text-xs text-slate-400 font-bold border-b border-slate-100">
          <div className="col-span-3">Code</div>
          <div className="col-span-3">Email / Note</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-1 text-center">Max KW</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Created</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm font-semibold text-slate-400">No invites yet.</div>
        ) : (
          rows.map((inv) => (
            <div key={inv.id} className="grid grid-cols-12 gap-2 px-6 py-3.5 border-b border-slate-100 last:border-0 items-center text-xs hover:bg-slate-50/60 transition-colors">
              <div className="col-span-3 font-mono font-bold text-slate-900">{inv.code}</div>
              <div className="col-span-3 min-w-0">
                <p className="text-slate-800 font-medium truncate">{inv.email ?? <span className="text-slate-400 font-normal">any email</span>}</p>
                {inv.note && <p className="text-slate-400 truncate">{inv.note}</p>}
              </div>
              <div className="col-span-1 capitalize font-semibold text-slate-700">{inv.role.replace("_", " ")}</div>
              <div className="col-span-1 text-center font-bold text-slate-800">{inv.max_keywords}</div>
              <div className="col-span-2">
                {inv.used_by ? (
                  <span className="text-slate-400 font-medium">Used {inv.used_at ? new Date(inv.used_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
                ) : inv.is_active ? (
                  <span className="text-emerald-600 font-bold">Open</span>
                ) : (
                  <span className="text-rose-600 font-bold">Disabled</span>
                )}
              </div>
              <div className="col-span-2 text-right text-slate-400 font-medium">
                {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
