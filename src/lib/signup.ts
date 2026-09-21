/**
 * Self-service sign-up. Validation runs here, the account is created by Supabase Auth, and the
 * profile row comes from the existing handle_new_user() trigger. Nothing here writes to a public
 * table, chooses a role, or looks at what the email address is: a new account is always an
 * ordinary member until it creates or joins an organization.
 */

export const MIN_PASSWORD_LENGTH = 8;
// Supabase hashes passwords with bcrypt, which ignores anything past 72 bytes.
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_NAME_LENGTH = 100;

export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignupFieldErrors = Partial<Record<keyof SignupInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateSignup(input: SignupInput): SignupFieldErrors {
  const errors: SignupFieldErrors = {};

  const name = input.fullName.trim();
  if (!name) errors.fullName = "Enter your full name.";
  else if (name.length > MAX_NAME_LENGTH) errors.fullName = `Your name can be at most ${MAX_NAME_LENGTH} characters.`;

  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = "Please enter a valid email address.";

  if (input.password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (input.password.length > MAX_PASSWORD_LENGTH) errors.password = `Password can be at most ${MAX_PASSWORD_LENGTH} characters.`;

  if (!input.confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (input.confirmPassword !== input.password) errors.confirmPassword = "Passwords don't match.";

  return errors;
}

/** The slice of the Supabase client sign-up needs, so it can be tested without a network. */
export interface SignupClient {
  auth: {
    signUp(args: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
    }): Promise<{
      data: { user: { identities?: unknown[] | null } | null; session: unknown | null };
      error: { message: string; code?: string; status?: number } | null;
    }>;
  };
}

export type SignupResult =
  /** Confirmation is off: Supabase signed the user in straight away. */
  | { status: "signed_in"; email: string; fullName: string }
  /** Confirmation is on: the account exists but must be confirmed from the email first. */
  | { status: "confirm_email"; email: string }
  | { status: "error"; message: string; field?: keyof SignupInput; duplicate?: boolean };

const DUPLICATE_MESSAGE = "An account with this email already exists. Sign in instead.";
const GENERIC_MESSAGE = "We couldn't create your account. Please try again.";

function mapSignupError(error: { message: string; code?: string; status?: number }): SignupResult {
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (code === "user_already_exists" || code === "email_exists" || /already (been )?registered|already exists/i.test(message)) {
    return { status: "error", message: DUPLICATE_MESSAGE, field: "email", duplicate: true };
  }
  if (code === "weak_password" || /password.*(weak|short|at least|should)/i.test(message)) {
    return { status: "error", message: "Choose a stronger password: use a longer one with a mix of letters and numbers.", field: "password" };
  }
  if (code === "email_address_invalid" || code === "validation_failed" || /invalid.*email|email.*invalid/i.test(message)) {
    return { status: "error", message: "Please enter a valid email address.", field: "email" };
  }
  if (code === "signup_disabled" || /signups? (are )?(not allowed|disabled)/i.test(message)) {
    return { status: "error", message: "Creating accounts is turned off right now. Contact your VSI contact for access." };
  }
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) {
    return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
  }
  return { status: "error", message: GENERIC_MESSAGE };
}

/**
 * Creates the account with Supabase Auth. Only the full name is sent as user metadata: the role,
 * the organization and any invite are never set from the browser.
 */
export async function signUpWithEmail(client: SignupClient, input: SignupInput, emailRedirectTo?: string): Promise<SignupResult> {
  const errors = validateSignup(input);
  const firstInvalid = (Object.keys(errors) as (keyof SignupInput)[])[0];
  if (firstInvalid) return { status: "error", message: errors[firstInvalid]!, field: firstInvalid };

  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();

  let response;
  try {
    response = await client.auth.signUp({
      email,
      password: input.password,
      options: { data: { full_name: fullName }, ...(emailRedirectTo ? { emailRedirectTo } : {}) },
    });
  } catch {
    return { status: "error", message: "We couldn't reach the sign-up service. Check your connection and try again." };
  }

  const { data, error } = response;
  if (error) return mapSignupError(error);

  // With email confirmation on, Supabase answers an existing address with an obfuscated user that
  // has no identities, so the address can't be probed. Treat it as the duplicate it is.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { status: "error", message: DUPLICATE_MESSAGE, field: "email", duplicate: true };
  }
  if (!data.user) return { status: "error", message: GENERIC_MESSAGE };

  if (data.session) return { status: "signed_in", email, fullName };
  return { status: "confirm_email", email };
}
