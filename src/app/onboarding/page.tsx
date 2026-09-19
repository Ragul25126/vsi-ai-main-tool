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
 <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 font-sans text-ink">
 <div className="w-full max-w-[420px] animate-rise-in space-y-7">
 <div className="flex flex-col items-center gap-4 text-center">
 <Image src="/logo.png" alt="" width={52} height={52} />
 <div>
 <p className="flex items-center justify-center gap-2.5 text-caption font-semibold uppercase tracking-[0.14em] text-brand-strong">
 <span className="h-px w-6 bg-brand" aria-hidden />
 VSI
 <span className="h-px w-6 bg-brand" aria-hidden />
 </p>
 <h1 className="mt-3 text-display font-semibold text-ink">Name your organization</h1>
 <p className="mt-2 text-body text-ink-2">One last step before your dashboard.</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5 rounded-panel border border-line bg-surface p-6">
 {inviteInfo && (
 <div className="rounded-control bg-brand-soft px-3 py-2.5 text-support text-ink-2">
 {inviteInfo.role === "super_admin"
 ? "Platform admin access, with no limit on searches."
 : `Pilot access, with up to ${inviteInfo.max_keywords} searches.`}
 </div>
 )}

 {error && (
 <div role="alert" className="rounded-control bg-critical-soft px-3 py-2.5 text-support text-critical">
 {error}
 </div>
 )}

 <div>
 <label htmlFor="org-name" className="mb-1.5 block text-support font-medium text-ink">
 Organization name
 </label>
 <input
 id="org-name"
 type="text"
 value={agencyName}
 onChange={(e) => setAgencyName(e.target.value)}
 placeholder="For example: ValGrow Digital"
 required
 autoFocus
 disabled={!inviteInfo}
 className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none disabled:opacity-50"
 />
 </div>

 <button
 type="submit"
 disabled={loading || !inviteInfo}
 className="flex h-11 w-full items-center justify-center rounded-control bg-ink text-[0.9375rem] font-medium text-white transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {loading ? "Setting up..." : "Open my dashboard"}
 </button>
 </form>
 </div>
 </div>
 );
}
