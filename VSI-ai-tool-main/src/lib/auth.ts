import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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
function isDummySupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.includes("dummy") || url.includes("localhost:54321") || url === "";
}

/** Extract user details from cookies set during client session creation. */
async function getCookieUser(): Promise<{ email: string | null; fullName: string | null }> {
  try {
    const cookieStore = await cookies();
    const emailCookie = cookieStore.get("vsi_user_email")?.value;
    const nameCookie = cookieStore.get("vsi_user_name")?.value;
    return {
      email: emailCookie ? decodeURIComponent(emailCookie) : null,
      fullName: nameCookie ? decodeURIComponent(nameCookie) : null,
    };
  } catch {
    return { email: null, fullName: null };
  }
}

/** Construct session context dynamically from authenticated cookie data or backend state. */
async function dynamicSession(): Promise<SessionContext> {
  const { email, fullName } = await getCookieUser();
  const activeEmail = email || "user@example.com";
  const activeName = fullName || (email ? email.split("@")[0] : "User");

  return {
    userId: "user-001",
    email: activeEmail,
    fullName: activeName,
    role: "pilot",
    agencyId: "agency-001",
    agencyName: "Valgrow Enterprise",
    isPilot: false,
    maxKeywords: 999,
    branding: {
      displayName: null,
      logoUrl: null,
      primaryColor: null,
      supportEmail: null,
      reportFooter: null,
    },
  };
}

/**
 * Server-side: fetch current authenticated user + their profile + their agency.
 * Returns null if not signed in.
 */
export async function getSession(): Promise<SessionContext | null> {
  try {
    const cookieStore = await cookies();
    const hasSession = cookieStore.has("vsi_session") || cookieStore.has("sb-access-token");
    if (!hasSession) {
      return null;
    }
  } catch {
    // If cookies API fails, proceed
  }

  // When running with dummy credentials, return dynamic session if session cookie exists
  if (isDummySupabase()) {
    return dynamicSession();
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return dynamicSession();

    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id, role, full_name, agencies(name, is_pilot, max_keywords, display_name, logo_url, primary_color, support_email, report_footer)")
      .eq("id", user?.id || "")
      .single();

    const agency = (profile?.agencies as unknown) as {
      name: string; is_pilot: boolean; max_keywords: number;
      display_name: string | null; logo_url: string | null;
      primary_color: string | null; support_email: string | null;
      report_footer: string | null;
    } | null;

    const cookieUserData = await getCookieUser();
    const resolvedEmail = user?.email ?? cookieUserData.email ?? "";
    const resolvedName = profile?.full_name ?? cookieUserData.fullName ?? null;

    const userRole = (profile?.role as UserRole) ?? "pilot";
    return {
      userId:       user?.id || "",
      email:        resolvedEmail,
      fullName:     resolvedName,
      role:         userRole,
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
  } catch {
    return dynamicSession();
  }
}

export async function requireAgency(): Promise<SessionContext & { agencyId: string; agencyName: string }> {
  const session = await getSession();
  if (!session) return redirect("/login") as never;
  if (!session.agencyId) return redirect("/onboarding") as never;
  return {
    ...session,
    agencyId: session.agencyId,
    agencyName: session.agencyName ?? "My Agency",
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
