export const AUTHORIZED_EMAIL = "valgrowlabs444@gmail.com";

/**
 * Checks if the given email matches the single authorized account for ValGrow Labs.
 */
export function isAuthorizedEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_EMAIL.toLowerCase();
}
