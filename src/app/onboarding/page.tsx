"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function slugify(text: string): string {
 return text
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g, "")
 .trim()
 .replace(/\s+/g, "-")
 .slice(0, 50);
}

export default function OnboardingPage() {
 const router = useRouter();
 const [agencyName, setAgencyName] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [inviteInfo, setInviteInfo] = useState<{ role: string; max_keywords: number } | null>(null);

 // Resolve the invite code stashed in user_metadata at register time
 useEffect(() => {
 (async () => {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push("/auth/login");
 return;
 }

 // If profile already has agency_id, skip
 const { data: profile } = await supabase
 .from("profiles").select("agency_id").eq("id", user.id).single();
 if (profile?.agency_id) {
 router.push("/dashboard");
 return;
 }

 const code = (user.user_metadata?.invite_code as string | undefined)?.toUpperCase();
 if (!code) {
 setError("No invite code on this account. Re-register with a valid invite.");
 return;
 }

 // Checks one code server-side; the invites table itself isn't readable.
 const { data: validation } = await supabase.rpc("validate_invite", { p_code: code });
 const invite = (Array.isArray(validation) ? validation[0] : validation) as { role: string; max_keywords: number } | null;

 if (!invite) {
 setError("Your invite code is invalid or already used. Contact your admin.");
 return;
 }

 setInviteInfo({ role: invite.role, max_keywords: invite.max_keywords });
 })();
 }, [router]);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!agencyName.trim() || !inviteInfo) return;

 setLoading(true);
 setError(null);

 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push("/auth/login");
 return;
 }

 const code = (user.user_metadata?.invite_code as string | undefined)?.toUpperCase();
 if (!code) {
 setError("Invite code missing — please re-register.");
 setLoading(false);
 return;
 }

 // One server-side step: claims the invite (single use, locked), creates the
 // organization and links this account to it with the invite's role. The
 // browser can't set its own role or organization.
 const { error: setupErr } = await supabase.rpc("complete_onboarding", {
 p_code: code,
 p_agency_name: agencyName.trim(),
 p_slug: slugify(agencyName),
 });

 if (setupErr) {
 const msg = setupErr.message ?? "";
 setError(
 /invite/i.test(msg)
 ? "This invite code has already been used. Each invite is single-use. Request a new one from your admin."
 : /duplicate|unique|slug/i.test(msg)
 ? "Could not create agency. Try a different name."
 : "Account setup failed. Please contact support.",
 );
 setLoading(false);
 return;
 }

 router.push("/dashboard");
 router.refresh();
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
 <div className="w-full max-w-sm space-y-6">
 <div className="flex flex-col items-center gap-3">
 <Image src="/logo.png" alt="ValGrow" width={56} height={56} />
 <div className="text-center">
 <h1 className="text-lg font-bold tracking-widest text-amber-700 uppercase">VSI</h1>
 <p className="text-xs text-gray-500">One last step — name your agency</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] border border-gray-200 bg-card p-6">
 <p className="text-sm font-medium text-gray-900">Set up your agency</p>

 {inviteInfo && (
 <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
 {inviteInfo.role === "super_admin"
 ? "Super admin access — unlimited keywords."
 : `Pilot access — up to ${inviteInfo.max_keywords} keywords.`}
 </div>
 )}

 {error && (
 <div className="rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-700">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs text-gray-500 mb-1">Agency Name</label>
 <input
 type="text"
 value={agencyName}
 onChange={(e) => setAgencyName(e.target.value)}
 placeholder="e.g. ValGrow Digital"
 required
 autoFocus
 disabled={!inviteInfo}
 className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none disabled:opacity-50"
 />
 </div>

 <button
 type="submit"
 disabled={loading || !inviteInfo}
 className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? "Setting up..." : "Launch my dashboard →"}
 </button>
 </form>
 </div>
 </div>
 );
}
