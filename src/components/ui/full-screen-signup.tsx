"use client";
 
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { OverviewScene } from "@/components/illustrations";

interface FullScreenSignupProps {
  onLoginSubmit?: (email: string, password: string) => Promise<void> | void;
  isLoading?: boolean;
  authError?: string;
  clearAuthError?: () => void;
}
 
export const FullScreenSignup = ({
  onLoginSubmit,
  isLoading = false,
  authError = "",
  clearAuthError,
}: FullScreenSignupProps = {}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 6;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    setSubmitted(true);
 
    if (valid) {
      if (onLoginSubmit) {
        await onLoginSubmit(email, password);
      } else {
        console.log("Form submitted!");
        console.log("Email:", email);
        alert("Form submitted!");
        setEmail("");
        setPassword("");
        setSubmitted(false);
      }
    }
  };
 
  const field = (invalid: boolean) =>
    `h-11 w-full rounded-control border bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-3 transition-colors focus:outline-none ${
      invalid ? "border-critical focus:border-critical" : "border-line-strong focus:border-brand"
    }`;

  return (
    <div className="grid min-h-screen w-full bg-canvas font-sans text-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Sign in */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[400px] animate-rise-in">
          <div className="flex items-center gap-2.5">
            <Image src="/vg-logo.png" alt="" width={32} height={32} className="rounded-md ring-1 ring-line" priority />
            <span>
              <span className="block text-[0.9375rem] font-semibold leading-5 tracking-[-0.01em] text-ink">VSI</span>
              <span className="block text-[0.6875rem] font-medium uppercase leading-4 tracking-[0.08em] text-ink-3">Search Intelligence</span>
            </span>
          </div>

          <h1 className="mt-10 text-[1.75rem] font-semibold leading-9 tracking-[-0.02em] text-ink">Sign in</h1>
          <p className="mt-2 text-body text-ink-2 md:text-[0.9375rem] md:leading-6">Use the email and password for your VSI account.</p>

          {authError && (
            <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-control bg-critical-soft px-3.5 py-3 text-support text-critical">
              <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
              <span>{authError}</span>
            </div>
          )}

          <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-support font-medium text-ink">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={field(!!emailError)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                  if (clearAuthError) clearAuthError();
                }}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                autoComplete="email"
                placeholder="you@company.com"
              />
              {emailError && (
                <p id="email-error" className="mt-1.5 text-caption text-critical">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-support font-medium text-ink">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`${field(!!passwordError)} pr-11`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (clearAuthError) clearAuthError();
                  }}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 rounded-control p-1.5 text-ink-3 transition-colors hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1.5 text-caption text-critical">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-control bg-ink text-[0.9375rem] font-medium text-white transition-colors hover:bg-ink-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Signing in</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-caption text-ink-3">Access is by invitation. Ask your VSI contact if you need an account.</p>
        </div>
      </div>

      {/* What VSI is, shown with the product's own drawing. Hidden on small screens so sign-in stays first. */}
      <div className="hidden border-l border-line bg-surface lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[520px]">
          <p className="flex items-center gap-2.5 text-caption font-semibold uppercase tracking-[0.14em] text-brand-strong">
            <span className="h-px w-6 bg-brand" aria-hidden />
            VSI
          </p>
          <p className="mt-4 text-balance text-[1.75rem] font-semibold leading-9 tracking-[-0.02em] text-ink">
            Understand how your website appears across search and AI.
          </p>
          <div className="mt-8 rounded-panel border border-line bg-surface bg-[radial-gradient(var(--line)_1px,transparent_1px)] px-6 py-5 text-ink-2 [background-size:18px_18px]">
            <OverviewScene />
          </div>
        </div>
      </div>
    </div>
  );
};
