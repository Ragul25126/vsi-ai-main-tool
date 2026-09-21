// One-shot marker set at the moment of sign-in: by the login page for password sign-in, by the
// OAuth callback routes for Google. The dashboard reads it once to greet the user. It expires
// on its own, so a sign-in that lands outside the dashboard leaves nothing behind.
export const WELCOME_COOKIE = "vsi_welcome";
export const WELCOME_COOKIE_MAX_AGE = 60;
