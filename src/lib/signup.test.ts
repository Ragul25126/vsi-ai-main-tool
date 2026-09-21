import { describe, expect, it, vi } from "vitest";
import { signUpWithEmail, validateSignup, type SignupClient, type SignupInput } from "./signup";

const valid: SignupInput = {
  fullName: "Ada Lovelace",
  email: "Ada@Example.org",
  password: "correct horse battery",
  confirmPassword: "correct horse battery",
};

function client(response: Awaited<ReturnType<SignupClient["auth"]["signUp"]>> | Error) {
  const signUp = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  return { signUp, client: { auth: { signUp } } as SignupClient };
}

describe("validateSignup", () => {
  it("accepts a complete, matching form", () => {
    expect(validateSignup(valid)).toEqual({});
  });

  it("requires a name, a valid email and a long enough password", () => {
    const errors = validateSignup({ fullName: "  ", email: "not-an-email", password: "short", confirmPassword: "short" });
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.password).toMatch(/at least 8/);
  });

  it("rejects a password confirmation that doesn't match", () => {
    expect(validateSignup({ ...valid, confirmPassword: "something else entirely" }).confirmPassword).toBe("Passwords don't match.");
  });

  it("requires the confirmation to be filled in", () => {
    expect(validateSignup({ ...valid, confirmPassword: "" }).confirmPassword).toBe("Confirm your password.");
  });

  it("caps the password at what Supabase can hash", () => {
    const long = "x".repeat(73);
    expect(validateSignup({ ...valid, password: long, confirmPassword: long }).password).toMatch(/at most 72/);
  });
});

describe("signUpWithEmail", () => {
  it("never calls Supabase when the form is invalid", async () => {
    const { signUp, client: c } = client({ data: { user: null, session: null }, error: null });
    const result = await signUpWithEmail(c, { ...valid, confirmPassword: "nope" });
    expect(result).toMatchObject({ status: "error", field: "confirmPassword" });
    expect(signUp).not.toHaveBeenCalled();
  });

  it("creates the account through Supabase Auth with only the full name as metadata", async () => {
    const { signUp, client: c } = client({ data: { user: { identities: [{}] }, session: { access_token: "t" } }, error: null });
    await signUpWithEmail(c, valid, "http://localhost:3000/auth/callback");
    expect(signUp).toHaveBeenCalledTimes(1);
    const [args] = signUp.mock.calls[0] as unknown as [{ email: string; password: string; options: { data: Record<string, unknown>; emailRedirectTo: string } }];
    expect(args.email).toBe("ada@example.org");
    expect(args.password).toBe(valid.password);
    expect(args.options.emailRedirectTo).toBe("http://localhost:3000/auth/callback");
    // Nothing that could grant privileges is sent: no role, organization, invite or admin flag.
    expect(args.options.data).toEqual({ full_name: "Ada Lovelace" });
  });

  it("signs the user in when email confirmation is off (Supabase returns a session)", async () => {
    const { client: c } = client({ data: { user: { identities: [{}] }, session: { access_token: "t" } }, error: null });
    expect(await signUpWithEmail(c, valid)).toEqual({ status: "signed_in", email: "ada@example.org", fullName: "Ada Lovelace" });
  });

  it("asks the user to check their email when confirmation is on (no session yet)", async () => {
    const { client: c } = client({ data: { user: { identities: [{}] }, session: null }, error: null });
    expect(await signUpWithEmail(c, valid)).toEqual({ status: "confirm_email", email: "ada@example.org" });
  });

  it("reports a duplicate email from the error code", async () => {
    const { client: c } = client({ data: { user: null, session: null }, error: { message: "User already registered", code: "user_already_exists", status: 422 } });
    expect(await signUpWithEmail(c, valid)).toMatchObject({ status: "error", duplicate: true, field: "email" });
  });

  it("reports a duplicate email from the obfuscated user Supabase returns when confirmation is on", async () => {
    const { client: c } = client({ data: { user: { identities: [] }, session: null }, error: null });
    const result = await signUpWithEmail(c, valid);
    expect(result).toMatchObject({ status: "error", duplicate: true });
    expect(result.status === "error" && result.message).toMatch(/already exists/);
  });

  it("maps weak passwords, rate limits and disabled sign-ups to clear messages", async () => {
    const weak = await signUpWithEmail(client({ data: { user: null, session: null }, error: { message: "Password is too weak", code: "weak_password" } }).client, valid);
    expect(weak).toMatchObject({ status: "error", field: "password" });

    const limited = await signUpWithEmail(client({ data: { user: null, session: null }, error: { message: "rate", code: "over_email_send_rate_limit", status: 429 } }).client, valid);
    expect(limited.status === "error" && limited.message).toMatch(/Too many attempts/);

    const off = await signUpWithEmail(client({ data: { user: null, session: null }, error: { message: "Signups not allowed for this instance", code: "signup_disabled" } }).client, valid);
    expect(off.status === "error" && off.message).toMatch(/turned off/);
  });

  it("does not leak a raw provider error", async () => {
    const result = await signUpWithEmail(client({ data: { user: null, session: null }, error: { message: "duplicate key value violates unique constraint pg_internal_xyz" } }).client, valid);
    expect(result).toEqual({ status: "error", message: "We couldn't create your account. Please try again." });
  });

  it("survives a network failure", async () => {
    const result = await signUpWithEmail(client(new Error("fetch failed")).client, valid);
    expect(result.status).toBe("error");
  });
});
