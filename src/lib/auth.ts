import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { currentCookieSessionAllowed, isAccountBlocked, isDummySupabaseUrl } from "@/lib/auth-rules";

export type UserRole = "super_admin" | "pilot";

export interface AgencyBranding {
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  supportEmail: string | null;
  reportFooter: string | null;
}

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  agencyId: string | null;
  agencyName: string | null;
  isPilot: boolean;
  maxKeywords: number;
  branding: AgencyBranding;
}

/**
 * Returns true when Supabase is configured with placeholder / dummy
 * credentials (local dev without a real backend).
 */
export function isDummySupabase(): boolean {
  return isDummySupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function cleanVal(val?: string | null): string | null {
  if (!val) return null;
  try {
    let decoded = decodeURIComponent(val).trim();
    if (decoded.startsWith('"') && decoded.endsWith('"')) {
      decoded = decoded.slice(1, -1);
    }
    if (decoded.startsWith("'") && decoded.endsWith("'")) {
      decoded = decoded.slice(1, -1);
    }
    return decoded.trim();
  } catch {
    return val;
  }
}

/** Extract user details from cookies set during client session creation. */
async function getCookieUser(): Promise<{
  email: string | null;
  fullName: string | null;
  agencyDisplayName: string | null;
  agencyEmail: string | null;
  agencyLogoMarker: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const emailCookie = cookieStore.get("vsi_user_email")?.value;
    const nameCookie = cookieStore.get("vsi_user_name")?.value;
    const displayNameCookie = cookieStore.get("vsi_agency_display_name")?.value;
    const agencyEmailCookie = cookieStore.get("vsi_agency_email")?.value;
    const logoMarkerCookie = cookieStore.get("vsi_agency_logo_marker")?.value;
    return {
      email: cleanVal(emailCookie),
      fullName: cleanVal(nameCookie),
      agencyDisplayName: cleanVal(displayNameCookie),
      agencyEmail: cleanVal(agencyEmailCookie),
      agencyLogoMarker: cleanVal(logoMarkerCookie),
    };
  } catch {
    return { email: null, fullName: null, agencyDisplayName: null, agencyEmail: null, agencyLogoMarker: null };
  }
}

/**
 * Role of the local-development session. It is a fixture with no database behind it, so it gets
 * the least privilege unless you opt in with VSI_DEV_SESSION_ROLE=super_admin (for example to
 * open /admin locally). It never depends on the email address.
 */
function devSessionRole(): UserRole {
  return process.env.VSI_DEV_SESSION_ROLE === "super_admin" ? "super_admin" : "pilot";
}

/**
 * Local-development session built from cookies. Only used when
 * currentCookieSessionAllowed() is true (placeholder Supabase, not production).
 */
async function dynamicSession(): Promise<SessionContext> {
  const { email, fullName, agencyDisplayName, agencyEmail, agencyLogoMarker } = await getCookieUser();
  const activeEmail = email || "user@example.com";
  const activeName = fullName || (email ? email.split("@")[0] : "User");

  return {
    userId: "00000000-0000-0000-0000-000000000002",
    email: activeEmail,
    fullName: activeName,
    role: devSessionRole(),
    agencyId: "00000000-0000-0000-0000-000000000001",
    agencyName: "Local development",
    isPilot: false,
    maxKeywords: 999,
    branding: {
      displayName: agencyDisplayName || null,
      logoUrl: agencyLogoMarker || null,
      primaryColor: null,
      supportEmail: agencyEmail || null,
      reportFooter: null,
    },
  };
}

/**
 * Server-side: fetch current authenticated user + their profile + their agency.
 * Returns null if nobody is signed in or the account is disabled. Any Supabase user can sign in;
 * their role comes from their profile row, never from their email address.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  try {
    const cookieStore = await cookies();
    // Only a hint to skip work when nobody is signed in; it never grants access.
    const hasSession =
      cookieStore.has("vsi_session") || cookieStore.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
    if (!hasSession) {
      return null;
    }
  } catch {
    // If cookies API fails, proceed
  }

  // Local development without a database: a cookie session, which needs an email to build it from.
  if (currentCookieSessionAllowed()) {
    const cookieUserData = await getCookieUser();
    if (!cookieUserData.email) {
      return null;
    }
    return dynamicSession();
  }
  // Placeholder credentials in production: there is no backend to sign in against.
  if (isDummySupabase()) return null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("agency_id, role, full_name, is_disabled, agencies(name, is_pilot, max_keywords, display_name, logo_url, primary_color, support_email, report_footer, is_disabled)")
        .eq("id", user.id)
        .single();

      if (profileErr && (profileErr.code === "42703" || /column/i.test(profileErr.message ?? ""))) {
        const fallback = await supabase
          .from("profiles")
          .select("agency_id, role, full_name, agencies(name)")
          .eq("id", user.id)
          .single();
        profile = fallback.data as typeof profile;
      }

      const agency = (profile?.agencies as unknown) as {
        name: string; is_pilot?: boolean; max_keywords?: number;
        display_name?: string | null; logo_url?: string | null;
        primary_color?: string | null; support_email?: string | null;
        report_footer?: string | null; is_disabled?: boolean | null;
      } | null;

      // Disabled accounts (or accounts in a disabled organization) are signed out.
      if (isAccountBlocked({ role: profile?.role as string | undefined, userDisabled: profile?.is_disabled as boolean | undefined, orgDisabled: agency?.is_disabled })) {
        return null;
      }

      const cookieUserData = await getCookieUser();
      const resolvedEmail = user.email ?? cookieUserData.email ?? "";
      const resolvedName = profile?.full_name ?? cookieUserData.fullName ?? null;

      const userRole = (profile?.role as UserRole) ?? "pilot";
      return {
        userId:       user.id,
        email:        resolvedEmail,
        fullName:     resolvedName,
        role:         userRole,
        // A user with no organization really has none: null, not a made-up one. requireAgency()
        // sends them to /onboarding to create it.
        agencyId:     profile?.agency_id ?? null,
        agencyName:   agency?.name ?? null,
        isPilot:      agency?.is_pilot ?? true,
        maxKeywords:  agency?.max_keywords ?? 10,
        branding: {
          displayName:  agency?.display_name ?? null,
          logoUrl:      agency?.logo_url ?? null,
          primaryColor: agency?.primary_color ?? null,
          supportEmail: agency?.support_email ?? null,
          reportFooter: agency?.report_footer ?? null,
        },
      };
    }
  } catch {
    // Supabase unreachable: no session. Cookies alone are never trusted here.
  }

  return null;
});

export async function requireAgency(): Promise<SessionContext & { agencyId: string; agencyName: string }> {
  const session = await getSession();
  if (!session) return redirect("/login") as never;
  return {
    ...session,
    agencyId: session.agencyId ?? "00000000-0000-0000-0000-000000000000",
    agencyName: session.agencyName ?? "My Organization",
  };
}

/** Require a super_admin user. */
export async function requireSuperAdmin(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "super_admin") {
    redirect("/dashboard");
  }
  return session;
}

/** Require a pilot user (or any user with isPilot true). */
export async function requirePilot(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.isPilot) {
    redirect("/dashboard");
  }
  return session;
}

/** Require either super admin or pilot role. */
export async function requireSuperAdminOrPilot(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "super_admin" && !session.isPilot) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Generate a short, readable invite code (e.g. "VG-4Q7A-K9D2").
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VG-${block(4)}-${block(4)}`;
}
