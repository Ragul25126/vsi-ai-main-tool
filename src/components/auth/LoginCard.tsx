import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';

interface LoginCardProps {
  onLoginSubmit: (email: string, password: string, remember: boolean) => void;
  onOpenForgotPassword: () => void;
  onOpenSignUp?: () => void;
  onGoogleLogin?: () => void;
  isLoading?: boolean;
  authError?: string;
  clearAuthError?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onLoginSubmit,
  onOpenForgotPassword,
  isLoading = false,
  authError,
  clearAuthError,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    let hasError = false;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email address is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    onLoginSubmit(email, password, remember);
  };

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#0B0E14]/90 backdrop-blur-xl rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(255,85,0,0.2)] border border-[#FF5500]/30 relative overflow-hidden transition-all duration-300">
      {/* Subtle top orange glow bar accent matching Image 2 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#FF5500] to-transparent shadow-[0_0_12px_#FF5500]" />

      {/* Card Heading */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Welcome Back <span className="inline-block animate-wave">👋</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-1.5 font-normal">
          Sign in to continue to VSI AI Suite
        </p>
      </div>

      {/* Auth Failure Alert Box */}
      {authError && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-medium flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF5500]" />
          <span>{authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Email Address Field */}
        <InputField
          label="Email address"
          id="email-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
            if (clearAuthError) clearAuthError();
          }}
          error={emailError}
          autoComplete="email"
        />

        {/* Password Field */}
        <PasswordField
          label="Password"
          id="password-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
            if (clearAuthError) clearAuthError();
          }}
          error={passwordError}
          autoComplete="current-password"
        />

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-950 peer-checked:bg-[#FF5500] peer-checked:border-[#FF5500] transition-all duration-200 peer-focus:ring-1 peer-focus:ring-[#FF5500]/50" />
              <svg
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-zinc-300 group-hover:text-white transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="text-[#FF5500] hover:text-orange-400 font-medium transition-colors hover:underline focus:outline-none cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Sign In Button matching Image 2 orange accent */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#FF5500] to-[#FF3300] hover:from-[#FF6600] hover:to-[#FF4400] text-white font-bold text-base py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-1 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_25px_rgba(255,85,0,0.45)] cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Sign Up Link Footer - Disabled for security */}
      <div className="mt-7 text-center text-xs sm:text-sm text-zinc-400 font-normal">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          disabled
          className="text-zinc-500 font-semibold cursor-not-allowed opacity-60 focus:outline-none"
          title="Public sign up is disabled"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

