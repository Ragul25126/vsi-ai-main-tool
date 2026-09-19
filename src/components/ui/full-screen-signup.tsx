"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LoginBenefits, LoginShowcase } from "@/components/auth/LoginShowcase";
import { currentCookieSessionAllowed } from "@/lib/auth-rules";

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
    `h-12 w-full rounded-control border bg-surface pl-11 pr-3.5 text-[0.9375rem] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-[3px] ${
      invalid ? "border-critical focus:border-critical focus:ring-critical/15" : "border-line-strong hover:border-ink-3 focus:border-brand focus:ring-brand/20"
    }`;
  const fieldIcon = "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-3";

  // Google sign-in only creates a local development session, so it is offered only where it can work.
  const googleAvailable = currentCookieSessionAllowed();

  return (
    <div className="grid min-h-screen w-full bg-surface font-sans text-ink lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]">
      {/* Sign in */}
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:py-10">
        <div className="mx-auto flex w-full max-w-[440px] items-center gap-3">
          <Image src="/vg-logo.png" alt="" width={40} height={40} className="rounded-control ring-1 ring-line" priority />
          <span>
            <span className="block text-section font-semibold leading-5 tracking-[-0.01em] text-ink">VSI</span>
            <span className="block text-[0.6875rem] font-medium uppercase leading-4 tracking-[0.12em] text-ink-3">Search Intelligence</span>
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
          <div className="animate-rise-in">
            <p className="text-caption font-semibold uppercase tracking-[0.14em] text-brand-strong">Welcome back</p>
            <h1 className="mt-3 text-[1.75rem] font-semibold leading-9 tracking-[-0.02em] text-ink">Sign in to your account</h1>
            <p className="mt-2.5 text-[0.9375rem] leading-6 text-ink-2">
              Continue to track your search visibility, website performance and AI presence — all in one place.
            </p>

            {authError && (
              <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-control border border-critical/20 bg-critical-soft px-3.5 py-3 text-support text-critical">
                <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
                <span>{authError}</span>
              </div>
            )}

            <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-support font-medium text-ink">
                  Email
                </label>
                <div className="relative">
                  <Mail className={fieldIcon} strokeWidth={1.75} aria-hidden />
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
                </div>
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
                  <Lock className={fieldIcon} strokeWidth={1.75} aria-hidden />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`${field(!!passwordError)} pr-12`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                      if (clearAuthError) clearAuthError();
                    }}
                    aria-invalid={!!passwordError}
                    aria-describedby="password-error"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 rounded-control p-2 text-ink-3 transition-colors hover:text-ink"
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
                className="group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-brand-strong text-[0.9375rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-strong/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 dark:text-canvas"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>Signing in</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
                  </>
                )}
              </button>
            </form>

            {googleAvailable && (
              <>
                <div className="mt-7 flex items-center gap-4" aria-hidden>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-3">Or continue with</span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <a
                  href="/api/auth/google"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-control border border-line-strong bg-surface text-[0.9375rem] font-medium text-ink transition-colors duration-150 hover:border-ink-3 hover:bg-surface-2 active:translate-y-px"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign in with Google
                </a>
              </>
            )}

            <p className="mt-7 flex items-center justify-center gap-2 text-caption text-ink-3">
              <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Your account is protected by secure authentication.
            </p>
            <p className="mt-2 text-center text-caption text-ink-3">Access is by invitation. Ask your VSI contact if you need an account.</p>
          </div>

          {/* Small screens: sign-in comes first, then what VSI does in three short lines. */}
          <LoginBenefits className="mt-10 border-t border-line pt-8 lg:hidden" />
        </div>
      </div>

      <LoginShowcase />
    </div>
  );
};
