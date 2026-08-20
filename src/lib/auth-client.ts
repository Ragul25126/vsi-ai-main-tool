import type { UserProfile } from "@/types/login";

export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function getClientUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("vsi_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function syncOAuthSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const cookiePayload = getClientCookie("vsi_oauth_payload");
  if (cookiePayload) {
    try {
      const decoded = decodeURIComponent(cookiePayload);
      const user = JSON.parse(decoded) as UserProfile;
      setClientSession(user);
      document.cookie = "vsi_oauth_payload=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      return user;
    } catch {
      // ignore
    }
  }
  return getClientUser();
}

export function isAuthenticatedClient(): boolean {
  if (typeof window === "undefined") return false;
  const hasCookie = !!getClientCookie("vsi_session");
  const hasUser = !!localStorage.getItem("vsi_user");
  return hasCookie && hasUser;
}

export function setClientSession(user: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem("vsi_user", JSON.stringify(user));
  const maxAge = 2592000; // 30 days
  document.cookie = `vsi_session=authenticated; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (user.email) {
    document.cookie = `vsi_user_email=${encodeURIComponent(user.email)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  if (user.name) {
    document.cookie = `vsi_user_name=${encodeURIComponent(user.name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function clearClientSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("vsi_user");
  const expired = "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  document.cookie = `vsi_session=; ${expired}`;
  document.cookie = `vsi_user_email=; ${expired}`;
  document.cookie = `vsi_user_name=; ${expired}`;
}

import { createClient } from "@/lib/supabase/client";

export async function logoutAndRedirect() {
  if (typeof window !== "undefined") {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out of Supabase:", e);
    }
  }
  clearClientSession();
  window.location.href = "/login";
}

