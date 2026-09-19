export const AUTHORIZED_EMAIL = "valgrowlabs444@gmail.com";

// One-shot marker set at the moment of sign-in: by the login page for password sign-in, by the
// OAuth callback routes for Google. The dashboard reads it once to greet the user. It expires
// on its own, so a sign-in that lands outside the dashboard leaves nothing behind.
export const WELCOME_COOKIE = "vsi_welcome";
export const WELCOME_COOKIE_MAX_AGE = 60;

/**
 * Checks if the given email matches the single authorized account for ValGrow Labs.
 */
export function isAuthorizedEmail(email?: string | null): boolean {
  if (!email) return false;
  let cleaned = email.trim().toLowerCase();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim() === AUTHORIZED_EMAIL.toLowerCase();
}
