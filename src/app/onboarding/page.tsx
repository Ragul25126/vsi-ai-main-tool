"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { markJustSignedIn } from "@/lib/auth-client";
import { createWorkspace, MAX_ORGANIZATION_NAME_LENGTH } from "@/lib/workspace";

export default function OnboardingPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Self-service needs no invite. An invite code is still accepted: it decides the role, and it is
  // the only way to become a platform admin.
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInfo, setInviteInfo] = useState<{ role: string; max_keywords: number } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Already set up: nothing to do here.
      const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
      if (profile?.agency_id) {
        router.push("/dashboard");
        return;
      }

      // An account registered with an invite code keeps using it.
      const code = (user.user_metadata?.invite_code as string | undefined)?.toUpperCase();
      if (code) {
        setInviteCode(code);
        setShowInvite(true);
        // Checks one code server-side; the invites table itself isn't readable.
        const { data: validation } = await supabase.rpc("validate_invite", { p_code: code });
        const invite = (Array.isArray(validation) ? validation[0] : validation) as { role: string; max_keywords: number } | null;
        if (invite) setInviteInfo({ role: invite.role, max_keywords: invite.max_keywords });
      }
      setReady(true);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // One server-side step. The browser can't set its own role or organization: the database
    // function creates the organization and links this account to it.
    const result = await createWorkspace(supabase, { name: agencyName, inviteCode: showInvite ? inviteCode : "" });

    if (result.status === "created") {
      // Greet them once on the dashboard, like a sign-in.
      markJustSignedIn();
      router.push("/dashboard");
      router.refresh();
      return;
    }
    if (result.status === "already_set_up") {
      // The account really does have an organization (for example a repeated request): go and use it.
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setError(result.message);
    // Creating a workspace without an invite isn't available here: point them at the invite field.
    if (result.status === "unavailable") setShowInvite(true);
    setLoading(false);
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
              placeholder="For example: Acme Plumbing"
              required
              autoFocus
              maxLength={MAX_ORGANIZATION_NAME_LENGTH}
              disabled={!ready}
              className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none disabled:opacity-50"
            />
          </div>

          {showInvite ? (
            <div>
              <label htmlFor="invite-code" className="mb-1.5 block text-support font-medium text-ink">
                Invite code
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="VG-XXXX-XXXX"
                autoComplete="off"
                className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 font-mono text-body text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="text-support font-semibold text-brand-strong underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
            >
              I have an invite code
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !ready}
            className="flex h-11 w-full items-center justify-center rounded-control bg-ink text-[0.9375rem] font-medium text-white transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Open my dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
