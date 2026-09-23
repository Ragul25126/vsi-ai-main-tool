/**
 * Helper utilities for Feedback submission, configuration verification,
 * and error classification.
 */

export function checkSupabaseConfig(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes("dummy") || url.includes("your-project.supabase.co")) {
    throw new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
  }
  if (!key || key.includes("anon_key_here") || key.includes("dummy_key")) {
    throw new Error("Supabase Anon Key is missing or invalid. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}

export type FeedbackErrorCategory = "configuration" | "authentication" | "permission" | "database";

export interface ClassifiedFeedbackError {
  type: FeedbackErrorCategory;
  message: string;
}

export function classifyFeedbackError(err: unknown): ClassifiedFeedbackError {
  if (!err) {
    return { type: "database", message: "An unexpected error occurred while submitting feedback." };
  }

  const rawMsg =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
      ? String((err as any).message)
      : String(err);
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as any).code)
      : "";
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as any).status)
      : null;

  // 1. Configuration errors
  if (
    rawMsg.includes("NEXT_PUBLIC_SUPABASE") ||
    rawMsg.includes("Supabase is not configured") ||
    rawMsg.includes("Anon Key is missing") ||
    rawMsg.includes("your-project.supabase.co") ||
    rawMsg.includes("anon_key_here")
  ) {
    return {
      type: "configuration",
      message: "Configuration error: Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.",
    };
  }

  // 2. Authentication errors
  if (
    status === 401 ||
    rawMsg.includes("No authenticated session") ||
    rawMsg.includes("not authenticated") ||
    rawMsg.includes("sign in") ||
    rawMsg.includes("JWT") ||
    rawMsg.includes("token is expired") ||
    rawMsg.includes("invalid claim")
  ) {
    return {
      type: "authentication",
      message: "Authentication error: You must be signed in to submit feedback. Please sign in again.",
    };
  }

  // 3. Permission errors
  if (
    code === "42501" ||
    status === 403 ||
    rawMsg.toLowerCase().includes("permission denied") ||
    rawMsg.toLowerCase().includes("row-level security") ||
    rawMsg.toLowerCase().includes("violates row-level security policy")
  ) {
    return {
      type: "permission",
      message: "Permission error: You do not have permission to submit feedback (row-level security policy violation).",
    };
  }

  // 4. Database errors
  if (
    rawMsg === "fetch failed" ||
    rawMsg.toLowerCase().includes("network") ||
    rawMsg.toLowerCase().includes("failed to fetch") ||
    rawMsg.toLowerCase().includes("connection")
  ) {
    return {
      type: "database",
      message: "Database error: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL is correct and the database is active.",
    };
  }

  return {
    type: "database",
    message: `Database error: ${rawMsg}`,
  };
}
