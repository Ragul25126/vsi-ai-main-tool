/**
 * Pure session rules shared by the middleware and lib/auth. No server
 * imports, so they run in the middleware and in tests.
 */

/** True when Supabase is configured with placeholder credentials (local dev without a backend). */
export function isDummySupabaseUrl(url: string | undefined): boolean {
  const u = url ?? "";
  return u === "" || u.includes("dummy") || u.includes("your-project.supabase.co") || u.includes("localhost:54321");
}

/**
 * Cookie-only sessions (vsi_session + vsi_user_email) exist for local
 * development without a database. They are never trusted in production or
 * when a real Supabase project is configured: anyone can set a cookie.
 */
export function cookieSessionAllowed(env: { supabaseUrl: string | undefined; nodeEnv: string | undefined }): boolean {
  return isDummySupabaseUrl(env.supabaseUrl) && env.nodeEnv !== "production";
}

export function currentCookieSessionAllowed(): boolean {
  return cookieSessionAllowed({ supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, nodeEnv: process.env.NODE_ENV });
}

/**
 * A disabled user is signed out. Users in a disabled organization are signed
 * out too, except platform admins, so the platform can't lock itself out.
 */
export function isAccountBlocked(a: { role: string | null | undefined; userDisabled: boolean | null | undefined; orgDisabled: boolean | null | undefined }): boolean {
  if (a.userDisabled) return true;
  if (a.orgDisabled && a.role !== "super_admin") return true;
  return false;
}
